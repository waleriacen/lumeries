#!/usr/bin/env python3
"""
OpenAI DALL-E Image Variation/Edit Test
"""

import os
import sys
import base64
import requests
from pathlib import Path

# API Key
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"

OUTPUT_DIR = Path("/Users/waleria/Desktop/poster/public/mockups")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Use existing test image
INPUT_IMAGE = Path("/Users/waleria/Desktop/poster/public/mockups/sdxl_lifestyle_test.png")

def test_dalle_edit():
    """Test DALL-E image edit (img2img equivalent)"""
    print("=" * 60)
    print("  OpenAI DALL-E Image Generation Test")
    print("=" * 60)
    
    # DALL-E 3 doesn't support img2img/variations
    # But we can generate new images with prompts
    
    print("\n[1] Generiere Lifestyle-Bild mit DALL-E 3...")
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "dall-e-3",
        "prompt": "A beautiful moon phases astronomy poster in an elegant thin black frame, hanging on a white wall in a modern minimalist Scandinavian bedroom. The poster shows golden moon phases. Soft natural lighting, cozy atmosphere, high-end interior design photography style.",
        "n": 1,
        "size": "1024x1024",
        "quality": "standard"
    }
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=payload,
            timeout=120
        )
        
        if response.status_code != 200:
            print(f"  Fehler: {response.status_code}")
            print(f"  {response.text}")
            return None
            
        data = response.json()
        image_url = data["data"][0]["url"]
        
        print(f"  Bild generiert!")
        print(f"  URL: {image_url[:80]}...")
        
        # Download image
        img_response = requests.get(image_url)
        output_path = OUTPUT_DIR / "dalle3_lifestyle_test.png"
        
        with open(output_path, "wb") as f:
            f.write(img_response.content)
            
        print(f"  Gespeichert: {output_path}")
        
        # Cost info
        print("\n" + "=" * 60)
        print("  KOSTEN:")
        print("  - DALL-E 3 Standard 1024x1024: $0.040 pro Bild")
        print("  - DALL-E 3 HD 1024x1024: $0.080 pro Bild")
        print("  - DALL-E 3 Standard 1024x1792: $0.080 pro Bild")
        print("  - DALL-E 3 HD 1024x1792: $0.120 pro Bild")
        print("=" * 60)
        
        return output_path
        
    except Exception as e:
        print(f"  Fehler: {e}")
        return None

if __name__ == "__main__":
    result = test_dalle_edit()
    if result:
        print(f"\nErfolg! Bild gespeichert unter: {result}")
    else:
        print("\nFehlgeschlagen.")
