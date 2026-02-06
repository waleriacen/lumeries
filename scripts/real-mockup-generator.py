#!/usr/bin/env python3
"""
Real Room Mockup Generator
==========================
Setzt das Lumeries Poster in echte Raum-Fotos ein.

Verwendung:
  python real-mockup-generator.py

Abhaengigkeiten:
  pip install Pillow requests
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import requests
from io import BytesIO

# Pfade
PROJECT_ROOT = Path("/Users/waleria/Desktop/poster")
MOCKUPS_DIR = PROJECT_ROOT / "assets" / "mockups"
OUTPUT_DIR = PROJECT_ROOT / "public" / "mockups" / "generated"
POSTER_PATH = PROJECT_ROOT / "public" / "mockups" / "test-poster.png"

# Erstelle Output-Verzeichnis
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Mockup Konfigurationen
# Jedes Mockup definiert: Bild, Rahmen-Position (4 Ecken), Stil
MOCKUPS = [
    {
        "name": "wohnzimmer-modern",
        "file": "room1-living.jpg",
        "description": "Modernes Wohnzimmer",
        # Koordinaten: [top-left, top-right, bottom-right, bottom-left]
        # Diese muessen fuer jedes Bild angepasst werden
        "frame_coords": [(760, 220), (1000, 220), (1000, 560), (760, 560)],
        "frame_style": "black",
        "shadow": True
    },
    {
        "name": "leseecke-gemuetlich",
        "file": "room2-bedroom.jpg",
        "description": "Gemuetliche Leseecke",
        "frame_coords": [(850, 180), (1100, 180), (1100, 530), (850, 530)],
        "frame_style": "black",
        "shadow": True
    },
    {
        "name": "apartment-hell",
        "file": "room3-apartment.jpg",
        "description": "Helle Wohnung",
        "frame_coords": [(650, 200), (880, 200), (880, 520), (650, 520)],
        "frame_style": "white",
        "shadow": True
    },
    {
        "name": "skandinavisch",
        "file": "room4-scandi.jpg",
        "description": "Skandinavisches Interior",
        "frame_coords": [(820, 100), (1050, 100), (1050, 420), (820, 420)],
        "frame_style": "natural",
        "shadow": True
    },
    {
        "name": "wohnzimmer-hell",
        "file": "room5-bright.jpg",
        "description": "Helles Wohnzimmer",
        "frame_coords": [(780, 150), (1020, 150), (1020, 490), (780, 490)],
        "frame_style": "black",
        "shadow": True
    }
]

# Rahmen-Farben
FRAME_COLORS = {
    "black": "#1a1a1a",
    "white": "#f5f5f5",
    "natural": "#8b7355"
}


def load_poster():
    """Laedt das Poster-Bild"""
    if POSTER_PATH.exists():
        print(f"  Lade lokales Poster: {POSTER_PATH}")
        return Image.open(POSTER_PATH).convert("RGBA")
    else:
        print("  Kein lokales Poster gefunden, erstelle Placeholder...")
        return create_placeholder_poster()


def create_placeholder_poster():
    """Erstellt ein Placeholder-Poster wenn keins vorhanden"""
    width, height = 600, 840
    img = Image.new('RGBA', (width, height), '#1a1a2e')
    draw = ImageDraw.Draw(img)

    # Mond
    moon_x, moon_y = width // 2, height // 3
    moon_radius = 100
    draw.ellipse([moon_x - moon_radius, moon_y - moon_radius,
                  moon_x + moon_radius, moon_y + moon_radius],
                 fill='#f4d03f')

    # Text
    draw.text((width // 2, height - 150), "Emma & Luca",
              fill='white', anchor='mm')
    draw.text((width // 2, height - 100), "15. Juni 2024",
              fill='#cccccc', anchor='mm')

    return img


def add_frame(poster, frame_color, frame_width=15):
    """Fuegt einen Rahmen um das Poster hinzu"""
    w, h = poster.size
    framed_size = (w + frame_width * 2, h + frame_width * 2)

    # Rahmen erstellen
    framed = Image.new('RGBA', framed_size, frame_color)
    framed.paste(poster, (frame_width, frame_width), poster)

    return framed


def create_shadow(size, offset=(10, 10), blur=15, opacity=100):
    """Erstellt einen realistischen Schatten"""
    shadow = Image.new('RGBA',
                       (size[0] + abs(offset[0]) + blur * 2,
                        size[1] + abs(offset[1]) + blur * 2),
                       (0, 0, 0, 0))

    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle(
        [blur + max(0, offset[0]),
         blur + max(0, offset[1]),
         blur + max(0, offset[0]) + size[0],
         blur + max(0, offset[1]) + size[1]],
        fill=(0, 0, 0, opacity)
    )

    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return shadow


def composite_poster_on_room(room_img, poster, frame_coords, frame_style, add_shadow=True):
    """Setzt das Poster in das Raum-Bild ein"""

    # Berechne Zielgroesse aus Koordinaten
    x1, y1 = frame_coords[0]  # top-left
    x2, y2 = frame_coords[1]  # top-right
    x3, y3 = frame_coords[2]  # bottom-right
    x4, y4 = frame_coords[3]  # bottom-left

    target_width = x2 - x1
    target_height = y4 - y1

    # Poster skalieren
    poster_ratio = poster.width / poster.height
    target_ratio = target_width / target_height

    if poster_ratio > target_ratio:
        new_width = target_width
        new_height = int(target_width / poster_ratio)
    else:
        new_height = target_height
        new_width = int(target_height * poster_ratio)

    poster_resized = poster.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Rahmen hinzufuegen
    frame_color = FRAME_COLORS.get(frame_style, FRAME_COLORS["black"])
    framed_poster = add_frame(poster_resized, frame_color, frame_width=12)

    # Finales Resize auf Zielgroesse
    framed_poster = framed_poster.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Raum in RGBA konvertieren
    room_rgba = room_img.convert('RGBA')

    # Position
    pos_x = x1
    pos_y = y1

    # Schatten hinzufuegen
    if add_shadow:
        shadow = create_shadow(framed_poster.size, offset=(8, 8), blur=12, opacity=80)
        shadow_pos = (pos_x - 12, pos_y - 4)
        room_rgba.paste(shadow, shadow_pos, shadow)

    # Poster einfuegen
    room_rgba.paste(framed_poster, (pos_x, pos_y), framed_poster)

    return room_rgba


def generate_mockup(mockup_config, poster):
    """Generiert ein einzelnes Mockup"""
    name = mockup_config["name"]
    file = mockup_config["file"]
    description = mockup_config["description"]
    frame_coords = mockup_config["frame_coords"]
    frame_style = mockup_config["frame_style"]
    add_shadow = mockup_config.get("shadow", True)

    print(f"\n  Generiere: {description}")

    # Lade Raum-Bild
    room_path = MOCKUPS_DIR / file
    if not room_path.exists():
        print(f"    FEHLER: {room_path} nicht gefunden")
        return None

    room_img = Image.open(room_path)
    print(f"    Raum geladen: {room_img.size}")

    # Composite
    result = composite_poster_on_room(room_img, poster, frame_coords, frame_style, add_shadow)

    # Speichern
    output_path = OUTPUT_DIR / f"{name}.jpg"
    result.convert('RGB').save(output_path, 'JPEG', quality=92)
    print(f"    Gespeichert: {output_path}")

    # Pinterest Format (1000x1500)
    pinterest_path = OUTPUT_DIR / f"{name}-pinterest.jpg"
    pinterest = result.copy()
    pinterest = pinterest.resize((1000, int(1000 * result.height / result.width)), Image.Resampling.LANCZOS)
    # Crop oder Pad auf 1000x1500
    if pinterest.height < 1500:
        # Pad
        padded = Image.new('RGB', (1000, 1500), '#f5f5f5')
        y_offset = (1500 - pinterest.height) // 2
        padded.paste(pinterest.convert('RGB'), (0, y_offset))
        pinterest = padded
    else:
        # Crop
        y_offset = (pinterest.height - 1500) // 2
        pinterest = pinterest.crop((0, y_offset, 1000, y_offset + 1500))
    pinterest.convert('RGB').save(pinterest_path, 'JPEG', quality=90)
    print(f"    Pinterest: {pinterest_path}")

    # Instagram Format (1080x1080)
    insta_path = OUTPUT_DIR / f"{name}-instagram.jpg"
    insta = result.copy()
    # Quadratisch croppen
    size = min(result.width, result.height)
    x_offset = (result.width - size) // 2
    y_offset = (result.height - size) // 2
    insta = insta.crop((x_offset, y_offset, x_offset + size, y_offset + size))
    insta = insta.resize((1080, 1080), Image.Resampling.LANCZOS)
    insta.convert('RGB').save(insta_path, 'JPEG', quality=90)
    print(f"    Instagram: {insta_path}")

    return output_path


def main():
    print("=" * 60)
    print("  LUMERIES REAL MOCKUP GENERATOR")
    print("  Echte Raum-Fotos mit deinem Poster")
    print("=" * 60)

    # Poster laden
    print("\n[1/2] Lade Poster...")
    poster = load_poster()
    print(f"  Poster Groesse: {poster.size}")

    # Mockups generieren
    print("\n[2/2] Generiere Mockups...")

    generated = []
    for mockup in MOCKUPS:
        result = generate_mockup(mockup, poster)
        if result:
            generated.append(result)

    print("\n" + "=" * 60)
    print(f"  FERTIG! {len(generated)} Mockups generiert")
    print(f"  Output: {OUTPUT_DIR}")
    print("=" * 60)

    return generated


if __name__ == "__main__":
    main()
