#!/usr/bin/env python3
"""
HuggingFace Inference API - Image-to-Image Test Script
======================================================

Dieses Script testet die HuggingFace Inference API fuer automatisierte img2img Generierung.

SETUP:
------
1. API Token erstellen:
   - Gehe zu https://huggingface.co/settings/tokens
   - Klicke auf "Create new token" -> "Fine-grained"
   - Aktiviere "Make calls to Inference Providers" Berechtigung
   - Kopiere den Token (beginnt mit "hf_")

2. Token als Umgebungsvariable setzen:
   export HF_TOKEN="hf_xxxxxxxxxxxxx"

   Oder in .env Datei speichern

3. Dependencies installieren:
   pip install requests pillow huggingface_hub

KOSTENLOSER TIER - LIMITS:
--------------------------
- Free Users: $0.10 monatliche Credits (kann sich aendern)
- PRO Users ($9/Monat): $2.00 monatliche Credits + Pay-as-you-go
- Enterprise: $2.00 pro Seat + Pay-as-you-go

Wichtig:
- Keine Extra-Kosten von HuggingFace - nur Provider-Kosten werden durchgereicht
- Nach Aufbrauchen der Credits: Free User werden blockiert, PRO User zahlen Pay-as-you-go

IMAGE-TO-IMAGE MODELLE (mit aktiver Inference API):
---------------------------------------------------
Die besten verfuegbaren Modelle fuer img2img:

1. black-forest-labs/FLUX.1-Kontext-dev (empfohlen)
   - Provider: fal-ai
   - Sehr gute Qualitaet fuer Image Editing

2. black-forest-labs/FLUX.2-dev / FLUX.2-klein-4B
   - Provider: fal-ai
   - Neueste FLUX Version

3. Qwen/Qwen-Image-Edit-2511 / Qwen-Image-Edit
   - Provider: fal-ai
   - Gut fuer Text-gesteuerte Edits

4. tencent/HunyuanImage-3.0-Instruct
   - Provider: fal-ai
   - Instruction-based Editing

5. kontext-community/relighting-kontext-dev-lora-v3
   - Provider: fal-ai
   - Speziell fuer Re-Lighting

HINWEIS: stabilityai/stable-diffusion-xl-refiner-1.0 ist NICHT ueber die
         Inference API verfuegbar - nur als lokales Modell nutzbar!

API DOKUMENTATION:
------------------
https://huggingface.co/docs/api-inference/tasks/image-to-image

"""

import os
import sys
import base64
import requests
from io import BytesIO
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow nicht installiert. Bitte ausfuehren: pip install pillow")
    sys.exit(1)

try:
    from huggingface_hub import InferenceClient
except ImportError:
    print("WARNING: huggingface_hub nicht installiert. Fallback auf requests.")
    InferenceClient = None


# ============================================================================
# KONFIGURATION
# ============================================================================

# HuggingFace Token aus Umgebungsvariable
HF_TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")

# Quell-URL fuer das Poster
SOURCE_URL = "https://lumeries.com/api/generate-moon-image?scale=2"

# Output Verzeichnis
OUTPUT_DIR = Path("/Users/waleria/Desktop/poster/public/mockups")

# Verfuegbare img2img Modelle (mit aktiver Inference API)
AVAILABLE_MODELS = {
    "flux-kontext": {
        "model_id": "black-forest-labs/FLUX.1-Kontext-dev",
        "provider": "fal-ai",
        "description": "Powerful image editing model (recommended)"
    },
    "flux-2-dev": {
        "model_id": "black-forest-labs/FLUX.2-dev",
        "provider": "fal-ai",
        "description": "Latest FLUX 2 version"
    },
    "flux-2-klein": {
        "model_id": "black-forest-labs/FLUX.2-klein-4B",
        "provider": "fal-ai",
        "description": "Smaller, faster FLUX 2 variant"
    },
    "qwen-edit": {
        "model_id": "Qwen/Qwen-Image-Edit-2511",
        "provider": "fal-ai",
        "description": "Qwen Image Edit model"
    },
    "hunyuan": {
        "model_id": "tencent/HunyuanImage-3.0-Instruct",
        "provider": "fal-ai",
        "description": "Tencent Hunyuan instruction-based editing"
    },
}

# Standard-Modell
DEFAULT_MODEL = "flux-kontext"

# Prompt fuer die Bildtransformation
DEFAULT_PROMPT = """
Transform this moon phase poster into a premium lifestyle product photo.
Place it in an elegant, minimalist interior setting with soft natural lighting.
The poster should be framed in a modern black or wooden frame.
High-end aesthetic, professional product photography style.
"""


# ============================================================================
# HILFSFUNKTIONEN
# ============================================================================

def check_token():
    """Prueft ob HF_TOKEN gesetzt ist."""
    if not HF_TOKEN:
        print("""
ERROR: HuggingFace Token nicht gefunden!

Bitte setze die Umgebungsvariable:
  export HF_TOKEN="hf_xxxxxxxxxxxxx"

Token erstellen unter:
  https://huggingface.co/settings/tokens

Berechtigungen: "Make calls to Inference Providers" aktivieren
        """)
        sys.exit(1)
    print(f"[OK] HF_TOKEN gefunden: {HF_TOKEN[:10]}...")


def fetch_source_image(url: str) -> Image.Image:
    """Laedt das Quellbild von der URL."""
    print(f"\n[1/4] Lade Quellbild von: {url}")

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        image = Image.open(BytesIO(response.content))
        print(f"      Bildgroesse: {image.size}, Format: {image.format}, Mode: {image.mode}")

        # Konvertiere zu RGB falls noetig
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
            print(f"      Konvertiert zu RGB")

        return image

    except requests.RequestException as e:
        print(f"ERROR: Konnte Bild nicht laden: {e}")
        sys.exit(1)


def image_to_base64(image: Image.Image) -> str:
    """Konvertiert PIL Image zu Base64 String."""
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def run_img2img_huggingface_hub(
    image: Image.Image,
    prompt: str,
    model_config: dict
) -> Image.Image:
    """
    Fuehrt img2img mit huggingface_hub InferenceClient durch.
    Dies ist die empfohlene Methode.
    """
    if InferenceClient is None:
        raise ImportError("huggingface_hub nicht verfuegbar")

    print(f"\n[2/4] Initialisiere HuggingFace Inference Client...")
    print(f"      Modell: {model_config['model_id']}")
    print(f"      Provider: {model_config['provider']}")

    client = InferenceClient(token=HF_TOKEN)

    print(f"\n[3/4] Sende Bild zur Verarbeitung...")
    print(f"      Prompt: {prompt[:100]}...")

    # Image-to-Image API Call
    result = client.image_to_image(
        image=image,
        prompt=prompt,
        model=model_config['model_id'],
        # Optional: Provider explizit angeben
        # provider=model_config['provider'],
    )

    return result


def run_img2img_requests(
    image: Image.Image,
    prompt: str,
    model_config: dict
) -> Image.Image:
    """
    Fuehrt img2img mit direktem HTTP Request durch.
    Fallback falls huggingface_hub nicht installiert.
    """
    model_id = model_config['model_id']

    # API Endpoint
    api_url = f"https://router.huggingface.co/hf-inference/models/{model_id}"

    print(f"\n[2/4] Sende Request an: {api_url}")

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    # Bild zu Base64 konvertieren
    image_b64 = image_to_base64(image)

    payload = {
        "inputs": image_b64,
        "parameters": {
            "prompt": prompt,
            "guidance_scale": 7.5,
            "num_inference_steps": 30,
        }
    }

    print(f"\n[3/4] Sende Bild zur Verarbeitung...")
    print(f"      Prompt: {prompt[:100]}...")

    response = requests.post(
        api_url,
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        print(f"\nERROR: API Response {response.status_code}")
        print(f"Details: {response.text}")
        raise Exception(f"API Error: {response.status_code}")

    # Response ist das Bild als Bytes
    result_image = Image.open(BytesIO(response.content))
    return result_image


def save_result(image: Image.Image, output_dir: Path, prefix: str = "hf_img2img") -> Path:
    """Speichert das Ergebnisbild."""
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}.png"
    output_path = output_dir / filename

    print(f"\n[4/4] Speichere Ergebnis: {output_path}")
    image.save(output_path, format='PNG')
    print(f"      Bildgroesse: {image.size}")

    return output_path


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Hauptfunktion - fuehrt den img2img Test durch."""

    print("=" * 70)
    print("HuggingFace Inference API - Image-to-Image Test")
    print("=" * 70)

    # Token pruefen
    check_token()

    # Modell auswaehlen
    model_key = DEFAULT_MODEL
    if len(sys.argv) > 1:
        model_key = sys.argv[1]

    if model_key not in AVAILABLE_MODELS:
        print(f"\nERROR: Unbekanntes Modell '{model_key}'")
        print(f"Verfuegbare Modelle:")
        for key, config in AVAILABLE_MODELS.items():
            print(f"  - {key}: {config['description']}")
        sys.exit(1)

    model_config = AVAILABLE_MODELS[model_key]
    print(f"\nVerwendetes Modell: {model_key}")
    print(f"  ID: {model_config['model_id']}")
    print(f"  Provider: {model_config['provider']}")
    print(f"  Beschreibung: {model_config['description']}")

    # Prompt
    prompt = DEFAULT_PROMPT.strip()
    if len(sys.argv) > 2:
        prompt = sys.argv[2]

    # 1. Quellbild laden
    source_image = fetch_source_image(SOURCE_URL)

    # 2+3. img2img durchfuehren
    try:
        if InferenceClient is not None:
            result_image = run_img2img_huggingface_hub(
                source_image,
                prompt,
                model_config
            )
        else:
            result_image = run_img2img_requests(
                source_image,
                prompt,
                model_config
            )
    except Exception as e:
        print(f"\nERROR bei img2img: {e}")
        print("\nMoegliche Ursachen:")
        print("  - Token ungueltig oder abgelaufen")
        print("  - Kostenlose Credits aufgebraucht")
        print("  - Modell nicht verfuegbar")
        print("  - Rate Limiting")
        print("\nPruefe: https://huggingface.co/settings/billing")
        sys.exit(1)

    # 4. Ergebnis speichern
    output_path = save_result(result_image, OUTPUT_DIR, f"hf_{model_key}")

    print("\n" + "=" * 70)
    print("ERFOLG!")
    print("=" * 70)
    print(f"\nErgebnis gespeichert: {output_path}")
    print(f"\nNaechste Schritte:")
    print(f"  - Bild anschauen: open '{output_path}'")
    print(f"  - Anderes Modell testen: python {__file__} flux-2-dev")
    print(f"  - Credits pruefen: https://huggingface.co/settings/billing")

    return output_path


if __name__ == "__main__":
    main()
