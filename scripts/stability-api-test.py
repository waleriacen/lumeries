#!/usr/bin/env python3
"""
Stability AI Image-to-Image (img2img) API Test Script

=============================================================================
DOKUMENTATION - Stability AI Platform API
=============================================================================

API ENDPOINT FÜR IMG2IMG:
-------------------------
POST https://api.stability.ai/v2beta/stable-image/generate/sd3-img2img

Alternative Endpoints:
- SDXL img2img: POST https://api.stability.ai/v1/generation/{engine_id}/image-to-image
- SD3 Turbo: POST https://api.stability.ai/v2beta/stable-image/generate/sd3-turbo-img2img

SIGNUP PROZESS:
---------------
1. Gehe zu https://platform.stability.ai/
2. Klicke auf "Sign Up" oder "Get Started"
3. Registriere dich mit Email oder Google/GitHub Account
4. Nach der Registrierung erhältst du 25 kostenlose Credits
5. API Key findest du unter: https://platform.stability.ai/account/keys

KOSTEN PRO BILD (Credits):
--------------------------
- SD3 img2img: 3-4 Credits pro Bild (abhängig von Auflösung)
- SDXL img2img: 0.2-0.4 Credits pro Bild
- SD3 Turbo: 4 Credits pro Bild
- Upscaling: 0.2 Credits pro Bild

Mit 25 kostenlosen Credits kannst du ca.:
- 6-8 SD3 Bilder generieren
- 60-125 SDXL Bilder generieren

AUTHENTIFIZIERUNG:
------------------
Header: Authorization: Bearer {API_KEY}

=============================================================================
"""

import os
import sys
import base64
import requests
from datetime import datetime
from pathlib import Path

# Konfiguration
STABILITY_API_KEY = os.environ.get("STABILITY_API_KEY", "")
SOURCE_IMAGE_URL = "https://lumeries.com/api/generate-moon-image?scale=2"
OUTPUT_DIR = Path("/Users/waleria/Desktop/poster/public/mockups")

# API Endpoints
STABILITY_ENDPOINTS = {
    "sd3_img2img": "https://api.stability.ai/v2beta/stable-image/generate/sd3-img2img",
    "sdxl_img2img": "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
    "core_img2img": "https://api.stability.ai/v2beta/stable-image/generate/core",  # Newer simplified API
}


def fetch_source_image(url: str) -> bytes:
    """
    Holt das Quellbild von der Lumeries API

    Args:
        url: URL zum Bild

    Returns:
        Bild als Bytes
    """
    print(f"[1/4] Hole Quellbild von: {url}")

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    print(f"      Content-Type: {content_type}")
    print(f"      Bildgröße: {len(response.content) / 1024:.1f} KB")

    return response.content


def transform_with_stability_sd3(image_data: bytes, prompt: str, strength: float = 0.5) -> bytes:
    """
    Transformiert ein Bild mit Stability AI SD3 img2img API

    Args:
        image_data: Eingabebild als Bytes
        prompt: Text-Prompt für die Transformation
        strength: Wie stark das Bild verändert wird (0.0-1.0)

    Returns:
        Transformiertes Bild als Bytes
    """
    print(f"[2/4] Sende an Stability AI SD3 img2img API...")
    print(f"      Prompt: {prompt[:50]}...")
    print(f"      Strength: {strength}")

    if not STABILITY_API_KEY:
        raise ValueError(
            "STABILITY_API_KEY nicht gesetzt!\n"
            "Setze die Umgebungsvariable:\n"
            "  export STABILITY_API_KEY='dein-api-key'\n\n"
            "API Key erhältst du nach Signup auf:\n"
            "  https://platform.stability.ai/account/keys"
        )

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "image/*",  # Bild direkt zurückbekommen
    }

    # SD3 img2img verwendet multipart/form-data
    files = {
        "image": ("input.png", image_data, "image/png"),
    }

    data = {
        "prompt": prompt,
        "strength": strength,
        "mode": "image-to-image",
        "output_format": "png",
    }

    response = requests.post(
        STABILITY_ENDPOINTS["sd3_img2img"],
        headers=headers,
        files=files,
        data=data,
        timeout=120,
    )

    if response.status_code != 200:
        error_msg = f"API Fehler: {response.status_code}"
        try:
            error_detail = response.json()
            error_msg += f"\nDetails: {error_detail}"
        except:
            error_msg += f"\nResponse: {response.text[:500]}"
        raise Exception(error_msg)

    print(f"      Antwort erhalten: {len(response.content) / 1024:.1f} KB")
    return response.content


def transform_with_stability_sdxl(image_data: bytes, prompt: str, strength: float = 0.5) -> bytes:
    """
    Transformiert ein Bild mit Stability AI SDXL img2img API (günstiger!)

    Args:
        image_data: Eingabebild als Bytes
        prompt: Text-Prompt für die Transformation
        strength: Wie stark das Bild verändert wird (0.0-1.0)

    Returns:
        Transformiertes Bild als Bytes
    """
    print(f"[2/4] Sende an Stability AI SDXL img2img API...")
    print(f"      Prompt: {prompt[:50]}...")
    print(f"      Strength (image_strength): {1 - strength}")

    if not STABILITY_API_KEY:
        raise ValueError(
            "STABILITY_API_KEY nicht gesetzt!\n"
            "Setze die Umgebungsvariable:\n"
            "  export STABILITY_API_KEY='dein-api-key'\n\n"
            "API Key erhältst du nach Signup auf:\n"
            "  https://platform.stability.ai/account/keys"
        )

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Bild als base64 kodieren
    image_base64 = base64.b64encode(image_data).decode("utf-8")

    payload = {
        "text_prompts": [
            {
                "text": prompt,
                "weight": 1.0
            }
        ],
        "init_image": image_base64,
        "init_image_mode": "IMAGE_STRENGTH",
        "image_strength": 1 - strength,  # SDXL: höher = mehr Original beibehalten
        "cfg_scale": 7,
        "samples": 1,
        "steps": 30,
    }

    response = requests.post(
        STABILITY_ENDPOINTS["sdxl_img2img"],
        headers=headers,
        json=payload,
        timeout=120,
    )

    if response.status_code != 200:
        error_msg = f"API Fehler: {response.status_code}"
        try:
            error_detail = response.json()
            error_msg += f"\nDetails: {error_detail}"
        except:
            error_msg += f"\nResponse: {response.text[:500]}"
        raise Exception(error_msg)

    result = response.json()

    if "artifacts" not in result or len(result["artifacts"]) == 0:
        raise Exception("Keine Bilder in der API-Antwort")

    # Base64 Bild dekodieren
    image_base64 = result["artifacts"][0]["base64"]
    image_bytes = base64.b64decode(image_base64)

    print(f"      Antwort erhalten: {len(image_bytes) / 1024:.1f} KB")
    return image_bytes


def transform_with_stability_core(image_data: bytes, prompt: str, strength: float = 0.5) -> bytes:
    """
    Transformiert ein Bild mit Stability AI Core API (neueste vereinfachte API)

    Args:
        image_data: Eingabebild als Bytes
        prompt: Text-Prompt für die Transformation
        strength: Wie stark das Bild verändert wird (0.0-1.0)

    Returns:
        Transformiertes Bild als Bytes
    """
    print(f"[2/4] Sende an Stability AI Core API...")
    print(f"      Prompt: {prompt[:50]}...")
    print(f"      Strength: {strength}")

    if not STABILITY_API_KEY:
        raise ValueError(
            "STABILITY_API_KEY nicht gesetzt!\n"
            "Setze die Umgebungsvariable:\n"
            "  export STABILITY_API_KEY='dein-api-key'\n\n"
            "API Key erhältst du nach Signup auf:\n"
            "  https://platform.stability.ai/account/keys"
        )

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "image/*",
    }

    files = {
        "image": ("input.png", image_data, "image/png"),
    }

    data = {
        "prompt": prompt,
        "control_strength": strength,
        "output_format": "png",
    }

    response = requests.post(
        STABILITY_ENDPOINTS["core_img2img"],
        headers=headers,
        files=files,
        data=data,
        timeout=120,
    )

    if response.status_code != 200:
        error_msg = f"API Fehler: {response.status_code}"
        try:
            error_detail = response.json()
            error_msg += f"\nDetails: {error_detail}"
        except:
            error_msg += f"\nResponse: {response.text[:500]}"
        raise Exception(error_msg)

    print(f"      Antwort erhalten: {len(response.content) / 1024:.1f} KB")
    return response.content


def save_image(image_data: bytes, prefix: str = "stability") -> Path:
    """
    Speichert das transformierte Bild

    Args:
        image_data: Bild als Bytes
        prefix: Präfix für den Dateinamen

    Returns:
        Pfad zur gespeicherten Datei
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_img2img_{timestamp}.png"
    output_path = OUTPUT_DIR / filename

    print(f"[3/4] Speichere Ergebnis: {output_path}")

    with open(output_path, "wb") as f:
        f.write(image_data)

    print(f"      Gespeichert: {len(image_data) / 1024:.1f} KB")
    return output_path


def main():
    """
    Hauptfunktion - führt den kompletten img2img Workflow aus
    """
    print("=" * 60)
    print("Stability AI img2img API Test")
    print("=" * 60)
    print()

    # Überprüfe API Key
    if not STABILITY_API_KEY:
        print("FEHLER: STABILITY_API_KEY nicht gesetzt!")
        print()
        print("So erhältst du deinen API Key:")
        print("1. Gehe zu https://platform.stability.ai/")
        print("2. Erstelle einen Account (25 kostenlose Credits)")
        print("3. Gehe zu https://platform.stability.ai/account/keys")
        print("4. Erstelle einen neuen API Key")
        print("5. Setze die Umgebungsvariable:")
        print("   export STABILITY_API_KEY='sk-xxxxxxxx'")
        print()
        sys.exit(1)

    print(f"API Key: {STABILITY_API_KEY[:10]}...{STABILITY_API_KEY[-4:]}")
    print()

    # Transformation Prompt
    prompt = (
        "artistic moon poster with dreamy cosmic atmosphere, "
        "soft gradients, ethereal lighting, vintage astronomy aesthetic, "
        "high quality print design"
    )

    try:
        # 1. Quellbild holen
        source_image = fetch_source_image(SOURCE_IMAGE_URL)

        # Optional: Quellbild auch speichern
        source_path = save_image(source_image, prefix="stability_source")
        print()

        # 2. Mit Stability AI transformieren
        # Wähle eine der Methoden (auskommentieren zum Wechseln):

        # Option A: SD3 (höhere Qualität, mehr Credits)
        # transformed_image = transform_with_stability_sd3(source_image, prompt, strength=0.4)

        # Option B: SDXL (günstiger, gute Qualität)
        transformed_image = transform_with_stability_sdxl(source_image, prompt, strength=0.4)

        # Option C: Core API (neueste API)
        # transformed_image = transform_with_stability_core(source_image, prompt, strength=0.5)

        print()

        # 3. Ergebnis speichern
        output_path = save_image(transformed_image, prefix="stability_transformed")
        print()

        # 4. Zusammenfassung
        print("[4/4] Fertig!")
        print()
        print("=" * 60)
        print("ZUSAMMENFASSUNG")
        print("=" * 60)
        print(f"Quellbild:    {source_path}")
        print(f"Ergebnis:     {output_path}")
        print(f"Prompt:       {prompt[:60]}...")
        print()
        print("Credits verwendet: ca. 0.2-0.4 (SDXL) oder 3-4 (SD3)")
        print()

        return output_path

    except requests.exceptions.RequestException as e:
        print(f"NETZWERK-FEHLER: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"FEHLER: {e}")
        sys.exit(1)


def check_balance():
    """
    Überprüft den aktuellen Credit-Stand
    """
    if not STABILITY_API_KEY:
        print("API Key nicht gesetzt")
        return

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
    }

    response = requests.get(
        "https://api.stability.ai/v1/user/balance",
        headers=headers,
    )

    if response.status_code == 200:
        data = response.json()
        print(f"Aktuelle Credits: {data.get('credits', 'unbekannt')}")
    else:
        print(f"Fehler beim Abrufen des Kontostands: {response.status_code}")


if __name__ == "__main__":
    # Argumente verarbeiten
    if len(sys.argv) > 1 and sys.argv[1] == "--balance":
        check_balance()
    else:
        main()
