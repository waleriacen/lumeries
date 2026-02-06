#!/usr/bin/env python3
"""
FAL.AI IMG2IMG TEST SCRIPT
==========================

Dieses Script testet fal.ai als automatisierte img2img Loesung
fuer Poster-Mockup-Generierung.

SETUP:
------
1. API Key bekommen:
   - Gehe zu https://fal.ai
   - Registriere dich (GitHub/Google Login moeglich)
   - Gehe zu https://fal.ai/dashboard/keys
   - Erstelle einen neuen API Key
   - Du bekommst $10 kostenlose Credits zum Start

2. Dependencies installieren:
   pip install fal-client requests pillow

3. Environment Variable setzen:
   export FAL_KEY="dein-api-key-hier"

VERFUEGBARE IMG2IMG MODELLE AUF FAL.AI:
---------------------------------------

1. FLUX.1 [dev] Image-to-Image (fal-ai/flux/dev/image-to-image)
   - Beste Qualitaet fuer kreative Transformationen
   - Kosten: ~$0.025 pro Bild (512x512), ~$0.05 pro Bild (1024x1024)
   - Empfohlen fuer: Stilistische Aenderungen, Artwork

2. FLUX.1 [schnell] Image-to-Image (fal-ai/flux-realism/image-to-image)
   - Schneller, guenstiger
   - Kosten: ~$0.003 pro Bild
   - Empfohlen fuer: Schnelle Tests, einfache Transformationen

3. SDXL Image-to-Image (fal-ai/fast-sdxl/image-to-image)
   - Klassischer SDXL Ansatz
   - Kosten: ~$0.01-0.02 pro Bild
   - Empfohlen fuer: Traditionelle img2img Workflows

4. ControlNet SDXL (fal-ai/fast-sdxl-controlnet-canny)
   - Mit Kanten-Erkennung fuer praezise Kontrolle
   - Kosten: ~$0.02 pro Bild
   - Empfohlen fuer: Struktur-erhaltende Transformationen

5. IP-Adapter SDXL (fal-ai/ip-adapter-face-id)
   - Fuer Gesichts/Stil-Transfer
   - Kosten: ~$0.02 pro Bild

BESTE MODELLE FUER "POSTER IN RAUM" MOCKUPS:
--------------------------------------------

Option A: FLUX.1 [dev] mit Inpainting (fal-ai/flux/dev/inpainting)
  - Kann einen Bereich im Bild ersetzen
  - Ideal wenn du ein Raum-Foto hast und das Poster einsetzen willst
  - Prompt: "modern minimalist poster on white wall, living room"

Option B: SDXL ControlNet (fal-ai/fast-sdxl-controlnet-canny)
  - Behaelt die Struktur des Original-Posters
  - Fuegt Raum-Kontext hinzu
  - Prompt: "poster frame on wall in modern living room, photorealistic"

Option C: FLUX Fill (fal-ai/flux/dev/fill)
  - Neueres Modell fuer Inpainting
  - Sehr gute Qualitaet

EMPFEHLUNG FUER MOCKUPS:
Der beste Ansatz ist NICHT reines img2img, sondern:
1. Verwende vorgefertigte Mockup-Templates (Raum-Bilder mit leerem Rahmen)
2. Nutze Compositing (Poster in Rahmen einsetzen)
3. Optional: FLUX Inpainting fuer Feinschliff

USAGE:
------
python scripts/fal-test.py
"""

import os
import sys
import time
import base64
import requests
from pathlib import Path
from typing import Optional, Dict, Any

# ============================================================================
# CONFIGURATION
# ============================================================================

FAL_API_KEY = os.environ.get('FAL_KEY') or os.environ.get('FAL_API_KEY', '')
FAL_API_BASE = 'https://queue.fal.run'

SOURCE_IMAGE_URL = 'https://lumeries.com/api/generate-moon-image?scale=2'
OUTPUT_DIR = Path('/Users/waleria/Desktop/poster/public/mockups')


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def download_image(url: str) -> bytes:
    """Download image from URL and return bytes."""
    print(f"Downloading from: {url}")
    response = requests.get(url, timeout=60, allow_redirects=True)
    response.raise_for_status()
    return response.content


def image_to_data_url(image_bytes: bytes, mime_type: str = 'image/png') -> str:
    """Convert image bytes to data URL."""
    base64_data = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:{mime_type};base64,{base64_data}"


def save_image(url: str, output_path: Path) -> None:
    """Download image from URL and save to file."""
    response = requests.get(url, timeout=60, allow_redirects=True)
    response.raise_for_status()
    output_path.write_bytes(response.content)


def fal_request(endpoint: str, method: str = 'GET', json_data: Optional[Dict] = None) -> Dict:
    """Make a request to fal.ai API."""
    headers = {
        'Authorization': f'Key {FAL_API_KEY}',
        'Content-Type': 'application/json',
    }

    if method == 'GET':
        response = requests.get(endpoint, headers=headers, timeout=120)
    else:
        response = requests.post(endpoint, headers=headers, json=json_data, timeout=120)

    if response.status_code >= 400:
        raise Exception(f"API Error {response.status_code}: {response.text}")

    return response.json()


def wait_for_completion(status_url: str, response_url: str) -> Dict:
    """Wait for a queued job to complete."""
    print("Waiting for completion...")

    while True:
        time.sleep(2)

        status = fal_request(status_url)
        print(f"  Status: {status.get('status')}")

        if 'logs' in status:
            for log in status['logs']:
                print(f"  Log: {log.get('message', '')}")

        if status.get('status') == 'COMPLETED':
            return fal_request(response_url)

        if status.get('status') == 'FAILED':
            raise Exception(f"Job failed: {status}")


# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_sdxl_img2img(image_data_url: str) -> Optional[Path]:
    """Test SDXL Image-to-Image."""
    print('\n=== Testing SDXL Image-to-Image ===')
    print('Model: fal-ai/fast-sdxl/image-to-image')
    print('Estimated cost: ~$0.01-0.02')

    try:
        result = fal_request(
            f'{FAL_API_BASE}/fal-ai/fast-sdxl/image-to-image',
            'POST',
            {
                'image_url': image_data_url,
                'prompt': 'elegant framed poster hanging on a modern white wall in a stylish minimalist living room, natural lighting, professional interior photography, high quality',
                'negative_prompt': 'blurry, low quality, distorted, ugly, bad proportions',
                'strength': 0.65,
                'num_inference_steps': 30,
                'guidance_scale': 7.5,
                'image_size': 'square_hd',
                'sync_mode': False,
            }
        )

        print(f"Request ID: {result.get('request_id')}")

        final_result = wait_for_completion(result['status_url'], result['response_url'])

        if final_result.get('images'):
            output_path = OUTPUT_DIR / f"fal_sdxl_mockup_{int(time.time())}.png"
            save_image(final_result['images'][0]['url'], output_path)
            print(f"Saved to: {output_path}")
            return output_path

    except Exception as e:
        print(f"SDXL test failed: {e}")

    return None


def test_flux_img2img(image_data_url: str) -> Optional[Path]:
    """Test FLUX Image-to-Image."""
    print('\n=== Testing FLUX Image-to-Image ===')
    print('Model: fal-ai/flux/dev/image-to-image')
    print('Estimated cost: ~$0.025-0.05')

    try:
        result = fal_request(
            f'{FAL_API_BASE}/fal-ai/flux/dev/image-to-image',
            'POST',
            {
                'image_url': image_data_url,
                'prompt': 'beautiful framed art poster displayed on a wall in a cozy modern living room with soft natural lighting, interior design photography, professional quality',
                'strength': 0.7,
                'num_inference_steps': 28,
                'guidance_scale': 3.5,
                'image_size': {
                    'width': 1024,
                    'height': 1024
                },
                'sync_mode': False,
            }
        )

        print(f"Request ID: {result.get('request_id')}")

        final_result = wait_for_completion(result['status_url'], result['response_url'])

        if final_result.get('images'):
            output_path = OUTPUT_DIR / f"fal_flux_mockup_{int(time.time())}.png"
            save_image(final_result['images'][0]['url'], output_path)
            print(f"Saved to: {output_path}")
            return output_path

    except Exception as e:
        print(f"FLUX test failed: {e}")

    return None


def test_flux_schnell() -> Optional[Path]:
    """Test FLUX Schnell (text-to-image for comparison)."""
    print('\n=== Testing FLUX Schnell ===')
    print('Model: fal-ai/flux/schnell')
    print('Estimated cost: ~$0.003')
    print('Note: schnell is text-to-image, using it for comparison')

    try:
        result = fal_request(
            f'{FAL_API_BASE}/fal-ai/flux/schnell',
            'POST',
            {
                'prompt': 'a beautiful celestial moon phases poster in an elegant black frame, hanging on a white wall in a modern minimalist Scandinavian living room, natural soft lighting from window, professional interior photography, high quality',
                'image_size': {
                    'width': 1024,
                    'height': 1024
                },
                'num_inference_steps': 4,
                'sync_mode': False,
            }
        )

        print(f"Request ID: {result.get('request_id')}")

        final_result = wait_for_completion(result['status_url'], result['response_url'])

        if final_result.get('images'):
            output_path = OUTPUT_DIR / f"fal_flux_schnell_{int(time.time())}.png"
            save_image(final_result['images'][0]['url'], output_path)
            print(f"Saved to: {output_path}")
            return output_path

    except Exception as e:
        print(f"FLUX Schnell test failed: {e}")

    return None


def test_controlnet(image_data_url: str) -> Optional[Path]:
    """Test SDXL ControlNet (Canny) for structure-preserving transformation."""
    print('\n=== Testing SDXL ControlNet (Canny) ===')
    print('Model: fal-ai/fast-sdxl-controlnet-canny')
    print('Estimated cost: ~$0.02')
    print('Best for: Keeping poster structure while adding room context')

    try:
        result = fal_request(
            f'{FAL_API_BASE}/fal-ai/fast-sdxl-controlnet-canny',
            'POST',
            {
                'image_url': image_data_url,
                'prompt': 'elegant framed artwork on wall, modern interior, living room, soft natural lighting, professional photography',
                'negative_prompt': 'blurry, distorted, low quality',
                'controlnet_conditioning_scale': 0.5,
                'num_inference_steps': 30,
                'guidance_scale': 7.5,
                'sync_mode': False,
            }
        )

        print(f"Request ID: {result.get('request_id')}")

        final_result = wait_for_completion(result['status_url'], result['response_url'])

        if final_result.get('images'):
            output_path = OUTPUT_DIR / f"fal_controlnet_mockup_{int(time.time())}.png"
            save_image(final_result['images'][0]['url'], output_path)
            print(f"Saved to: {output_path}")
            return output_path

    except Exception as e:
        print(f"ControlNet test failed: {e}")

    return None


def test_flux_inpainting_info():
    """Document FLUX Fill/Inpainting approach (best for mockups)."""
    print('\n=== FLUX Inpainting Info ===')
    print('Model: fal-ai/flux-pro/v1/fill')
    print('Estimated cost: ~$0.05')
    print('Note: Requires base image with mask - best for compositing')
    print()
    print('HOW TO USE FOR MOCKUPS:')
    print('1. Take a room photo with empty wall/frame area')
    print('2. Create mask for where poster should go')
    print('3. Use FLUX Fill to blend poster into scene')
    print()
    print('Example code:')
    print('''
    result = fal_request(
        f'{FAL_API_BASE}/fal-ai/flux-pro/v1/fill',
        'POST',
        {
            'image_url': room_image_url,
            'mask_url': mask_url,  # White = area to fill
            'prompt': 'moon phases poster in black frame',
            'seed': 42,
        }
    )
    ''')


# ============================================================================
# MAIN
# ============================================================================

def main():
    print('=' * 50)
    print('FAL.AI IMG2IMG TEST')
    print('=' * 50)

    # Check API key
    if not FAL_API_KEY:
        print('\nERROR: FAL_KEY environment variable not set!')
        print('\nTo get your API key:')
        print('1. Go to https://fal.ai and sign up')
        print('2. Navigate to https://fal.ai/dashboard/keys')
        print('3. Create a new API key')
        print('4. Set it: export FAL_KEY="your-key-here"')
        print('\nYou get $10 free credits on signup!')
        sys.exit(1)

    print(f'\nAPI Key: {FAL_API_KEY[:8]}...')

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f'Output directory: {OUTPUT_DIR}')

    # Download source image
    print('\n--- Downloading source poster ---')
    print(f'Source: {SOURCE_IMAGE_URL}')

    try:
        source_image_bytes = download_image(SOURCE_IMAGE_URL)
        source_data_url = image_to_data_url(source_image_bytes)
        print(f'Downloaded {len(source_image_bytes)} bytes')

        # Save source image for reference
        source_output_path = OUTPUT_DIR / 'source_poster.png'
        source_output_path.write_bytes(source_image_bytes)
        print(f'Saved source to: {source_output_path}')

    except Exception as e:
        print(f'Failed to download source image: {e}')
        sys.exit(1)

    # Run tests
    results = []

    # Test 1: SDXL img2img
    results.append({
        'model': 'SDXL img2img',
        'path': test_sdxl_img2img(source_data_url)
    })

    # Test 2: FLUX img2img
    results.append({
        'model': 'FLUX dev img2img',
        'path': test_flux_img2img(source_data_url)
    })

    # Test 3: FLUX Schnell (text-to-image for comparison)
    results.append({
        'model': 'FLUX Schnell (t2i)',
        'path': test_flux_schnell()
    })

    # Test 4: ControlNet
    results.append({
        'model': 'SDXL ControlNet',
        'path': test_controlnet(source_data_url)
    })

    # Test 5: Document FLUX Fill approach
    test_flux_inpainting_info()

    # Summary
    print('\n' + '=' * 50)
    print('RESULTS SUMMARY')
    print('=' * 50)

    for r in results:
        status = 'SUCCESS' if r['path'] else 'FAILED'
        print(f"{r['model']}: {status}")
        if r['path']:
            print(f"  -> {r['path']}")

    print('\n' + '=' * 50)
    print('RECOMMENDATIONS FOR POSTER MOCKUPS')
    print('=' * 50)
    print('''
1. BEST APPROACH: Compositing + Light Adjustment
   - Use static room mockup templates
   - Composite poster into frame area
   - Optional: Use AI for lighting/shadow adjustment

2. AI-ONLY APPROACH: FLUX Fill/Inpainting
   - Requires room image with masked frame area
   - Best quality but needs preparation
   - Cost: ~$0.05 per image

3. QUICK & DIRTY: SDXL img2img
   - Simple but doesn't preserve poster details well
   - Cost: ~$0.01-0.02 per image
   - Good for concept/mood testing

4. ALTERNATIVE: Use dedicated mockup APIs
   - Placeit.net, Smartmockups, etc.
   - More reliable for production
   - Fixed pricing per mockup
    ''')

    print('\n' + '=' * 50)
    print('COST SUMMARY (fal.ai)')
    print('=' * 50)
    print('''
Model                        | Cost/Image | Speed    | Quality
-----------------------------|------------|----------|--------
FLUX Schnell                 | ~$0.003    | Fast     | Good
SDXL img2img                 | ~$0.01-02  | Medium   | Good
SDXL ControlNet              | ~$0.02     | Medium   | Good
FLUX dev img2img             | ~$0.025-05 | Slow     | Best
FLUX Pro Fill (Inpainting)   | ~$0.05     | Slow     | Best

With $10 free credits, you can run:
- ~3000+ FLUX Schnell generations
- ~500-1000 SDXL generations
- ~200-400 FLUX dev generations
    ''')


if __name__ == '__main__':
    main()
