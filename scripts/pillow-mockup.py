#!/usr/bin/env python3
"""
Pillow-basierte Poster-Mockup-Loesung
=====================================
100% kostenlos - Poster bleibt pixelgenau erhalten

Features:
- Perspektivische 4-Punkt-Transformation (ohne numpy!)
- Realistische Schatten mit Gaussian Blur
- Rahmen-Effekte
- Alpha-Compositing fuer natuerliche Integration

Abhaengigkeiten:
  pip install Pillow requests

Verwendung:
  python pillow-mockup.py              # Generiert alle Mockups
  python pillow-mockup.py --help       # Zeigt Hilfe
"""

import os
import sys
import math
from io import BytesIO
from pathlib import Path
from typing import Tuple, List, Optional

try:
    import requests
except ImportError:
    print("requests nicht gefunden. Installiere mit: pip install requests")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
except ImportError:
    print("Pillow nicht gefunden. Installiere mit: pip install Pillow")
    sys.exit(1)

# Konfiguration
POSTER_API = "https://lumeries.com/api/generate-moon-image?scale=2"
OUTPUT_DIR = Path("/Users/waleria/Desktop/poster/public/mockups")
ROOMS_DIR = Path("/Users/waleria/Desktop/poster/assets/rooms")

# Kostenlose Raum-Bilder von Unsplash (Direct Download URLs)
# Diese URLs funktionieren ohne API-Key
ROOM_IMAGES = [
    {
        "name": "modern-living-room",
        "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80",
        "poster_coords": [(580, 180), (920, 200), (910, 520), (590, 490)],
        "description": "Modernes Wohnzimmer mit weisser Wand"
    },
    {
        "name": "minimalist-bedroom",
        "url": "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1920&q=80",
        "poster_coords": [(750, 120), (1050, 130), (1045, 380), (755, 365)],
        "description": "Minimalistisches Schlafzimmer"
    },
    {
        "name": "scandinavian-interior",
        "url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80",
        "poster_coords": [(400, 80), (700, 90), (695, 320), (405, 305)],
        "description": "Skandinavisches Interior mit Sofa"
    },
    {
        "name": "cozy-reading-corner",
        "url": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80",
        "poster_coords": [(520, 100), (820, 110), (815, 360), (525, 345)],
        "description": "Gemuetliche Leseecke"
    },
    {
        "name": "bright-apartment",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80",
        "poster_coords": [(600, 150), (880, 160), (875, 390), (605, 375)],
        "description": "Helle Wohnung mit grossen Fenstern"
    }
]


# ============================================================================
# MATHEMATISCHE HILFSFUNKTIONEN (ohne numpy)
# ============================================================================

def solve_linear_system_8x8(matrix: List[List[float]], vector: List[float]) -> List[float]:
    """
    Loest ein 8x8 lineares Gleichungssystem mit Gauss-Elimination.
    Reine Python-Implementierung ohne numpy.
    """
    n = 8
    # Erstelle erweiterte Matrix [A|b]
    aug = [matrix[i][:] + [vector[i]] for i in range(n)]

    # Vorwaerts-Elimination mit Pivotierung
    for col in range(n):
        # Finde Pivot
        max_row = col
        for row in range(col + 1, n):
            if abs(aug[row][col]) > abs(aug[max_row][col]):
                max_row = row

        # Tausche Zeilen
        aug[col], aug[max_row] = aug[max_row], aug[col]

        # Pruefe auf singulaere Matrix
        if abs(aug[col][col]) < 1e-10:
            raise ValueError("Matrix ist singulär oder nahezu singulär")

        # Eliminiere
        for row in range(col + 1, n):
            factor = aug[row][col] / aug[col][col]
            for j in range(col, n + 1):
                aug[row][j] -= factor * aug[col][j]

    # Rueckwaerts-Substitution
    solution = [0.0] * n
    for i in range(n - 1, -1, -1):
        solution[i] = aug[i][n]
        for j in range(i + 1, n):
            solution[i] -= aug[i][j] * solution[j]
        solution[i] /= aug[i][i]

    return solution


def find_perspective_coefficients(
    src_coords: List[Tuple[float, float]],
    dst_coords: List[Tuple[float, float]]
) -> List[float]:
    """
    Berechnet die 8 Koeffizienten fuer eine perspektivische Transformation.

    Die Transformation bildet Quellpunkte (src) auf Zielpunkte (dst) ab.
    Verwendet 8 Gleichungen fuer 8 Unbekannte (a, b, c, d, e, f, g, h).

    Transformationsformel:
        x' = (a*x + b*y + c) / (g*x + h*y + 1)
        y' = (d*x + e*y + f) / (g*x + h*y + 1)
    """
    # Baue das Gleichungssystem auf
    matrix = []
    vector = []

    for (sx, sy), (dx, dy) in zip(src_coords, dst_coords):
        # Gleichung fuer x'
        matrix.append([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy])
        vector.append(dx)
        # Gleichung fuer y'
        matrix.append([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy])
        vector.append(dy)

    # Loese das System
    coeffs = solve_linear_system_8x8(matrix, vector)
    return coeffs


# ============================================================================
# BILD-DOWNLOAD FUNKTIONEN
# ============================================================================

def download_image(url: str, save_path: Optional[Path] = None) -> Image.Image:
    """Laedt ein Bild von URL herunter."""
    print(f"  Lade: {url[:70]}...")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    img = Image.open(BytesIO(response.content))

    # Konvertiere zu RGB falls noetig (ausser RGBA fuer Transparenz)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')

    if save_path:
        save_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(save_path, quality=95)
        print(f"  Gespeichert: {save_path.name}")

    return img


def get_poster_image() -> Image.Image:
    """Holt das Poster von der Lumeries API."""
    print("\n[1/4] Hole Poster von Lumeries API...")
    poster = download_image(POSTER_API)

    # Stelle sicher, dass es RGBA ist fuer Alpha-Compositing
    if poster.mode != 'RGBA':
        poster = poster.convert('RGBA')

    print(f"  Poster-Groesse: {poster.size}")
    return poster


def get_room_images() -> List[dict]:
    """Laedt alle Raum-Bilder herunter oder verwendet Cache."""
    print("\n[2/4] Lade Raum-Bilder...")
    ROOMS_DIR.mkdir(parents=True, exist_ok=True)

    rooms = []
    for room in ROOM_IMAGES:
        room_path = ROOMS_DIR / f"{room['name']}.jpg"

        if room_path.exists():
            print(f"  Cache: {room['name']}")
            img = Image.open(room_path)
        else:
            try:
                img = download_image(room['url'], room_path)
            except Exception as e:
                print(f"  Fehler bei {room['name']}: {e}")
                continue

        rooms.append({
            **room,
            'image': img.convert('RGB'),
            'path': room_path
        })

    print(f"  {len(rooms)} Raum-Bilder geladen")
    return rooms


# ============================================================================
# PERSPEKTIVISCHE TRANSFORMATION
# ============================================================================

def perspective_transform(
    poster: Image.Image,
    target_coords: List[Tuple[int, int]],
    room_size: Tuple[int, int]
) -> Image.Image:
    """
    Transformiert das Poster perspektivisch mit 4-Punkt-Warp.

    Args:
        poster: Das Poster-Bild (RGBA)
        target_coords: 4 Eckpunkte im Zielbild [(TL), (TR), (BR), (BL)]
        room_size: Groesse des Zielbildes (width, height)

    Returns:
        Transformiertes Poster als RGBA-Bild in Raumgroesse
    """
    # Berechne die Ziel-Bounding-Box
    xs = [c[0] for c in target_coords]
    ys = [c[1] for c in target_coords]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    target_width = max_x - min_x
    target_height = max_y - min_y

    # Skaliere Poster auf Zielgroesse (behaelt Proportionen)
    poster_ratio = poster.width / poster.height
    target_ratio = target_width / target_height

    if poster_ratio > target_ratio:
        new_width = target_width
        new_height = int(target_width / poster_ratio)
    else:
        new_height = target_height
        new_width = int(target_height * poster_ratio)

    # Hochwertige Skalierung
    poster_scaled = poster.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Quell-Koordinaten (Ecken des skalierten Posters)
    src_coords = [
        (0, 0),
        (new_width - 1, 0),
        (new_width - 1, new_height - 1),
        (0, new_height - 1)
    ]

    # Zentriere das Poster innerhalb der Zielkoordinaten
    center_offset_x = (target_width - new_width) // 2
    center_offset_y = (target_height - new_height) // 2

    # Passe Zielkoordinaten an die Postergroesse an
    adjusted_target = [
        (target_coords[0][0] + center_offset_x, target_coords[0][1] + center_offset_y),
        (target_coords[1][0] - center_offset_x, target_coords[1][1] + center_offset_y),
        (target_coords[2][0] - center_offset_x, target_coords[2][1] - center_offset_y),
        (target_coords[3][0] + center_offset_x, target_coords[3][1] - center_offset_y)
    ]

    try:
        # Berechne perspektivische Koeffizienten
        # PIL braucht die inverse Transformation (dst -> src)
        coeffs = find_perspective_coefficients(adjusted_target, src_coords)

        # Transformiere das Poster
        transformed = poster_scaled.transform(
            room_size,
            Image.Transform.PERSPECTIVE,
            coeffs,
            Image.Resampling.BICUBIC,
            fillcolor=(0, 0, 0, 0)
        )

        return transformed

    except Exception as e:
        print(f"  Perspektiv-Transform Warnung: {e}")
        print("  Verwende einfache Platzierung...")

        # Fallback: Einfache Platzierung ohne Perspektive
        result = Image.new('RGBA', room_size, (0, 0, 0, 0))
        paste_x = min_x + center_offset_x
        paste_y = min_y + center_offset_y
        result.paste(poster_scaled, (paste_x, paste_y))
        return result


# ============================================================================
# RAHMEN UND SCHATTEN EFFEKTE
# ============================================================================

def add_frame(
    poster: Image.Image,
    frame_width: int = 15,
    frame_color: Tuple[int, int, int] = (30, 30, 30),
    inner_border: int = 3,
    inner_color: Tuple[int, int, int] = (255, 255, 255)
) -> Image.Image:
    """
    Fuegt einen realistischen Rahmen um das Poster hinzu.

    Args:
        poster: Das Poster-Bild
        frame_width: Breite des aeusseren Rahmens
        frame_color: Farbe des Rahmens
        inner_border: Breite des inneren (weissen) Randes
        inner_color: Farbe des inneren Randes (Passepartout)
    """
    total_border = frame_width + inner_border
    new_width = poster.width + 2 * total_border
    new_height = poster.height + 2 * total_border

    # Erstelle Rahmen-Bild
    framed = Image.new('RGBA', (new_width, new_height), (*frame_color, 255))

    # Innerer Rand (Passepartout)
    inner = Image.new('RGBA',
                      (poster.width + 2 * inner_border, poster.height + 2 * inner_border),
                      (*inner_color, 255))
    framed.paste(inner, (frame_width, frame_width))

    # Poster einfuegen
    framed.paste(poster, (total_border, total_border))

    return framed


def create_shadow_fast(
    size: Tuple[int, int],
    poster_bounds: List[Tuple[int, int]],
    offset: Tuple[int, int] = (10, 15),
    blur_radius: int = 25,
    opacity: float = 0.4
) -> Image.Image:
    """
    Erstellt einen realistischen Schatten mit Gaussian Blur.

    Args:
        size: Groesse des Ausgabebildes
        poster_bounds: 4 Eckpunkte des Posters
        offset: Schatten-Versatz (x, y)
        blur_radius: Staerke der Unschaerfe
        opacity: Deckkraft (0.0 - 1.0)
    """
    shadow = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)

    # Verschiebe die Koordinaten fuer den Schatten
    shadow_coords = [(x + offset[0], y + offset[1]) for x, y in poster_bounds]

    # Zeichne Schatten-Polygon
    shadow_intensity = int(255 * opacity)
    draw.polygon(shadow_coords, fill=(0, 0, 0, shadow_intensity))

    # Blur anwenden fuer weichen Schatten
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))

    return shadow


def adjust_brightness_contrast(
    image: Image.Image,
    brightness: float = 1.0,
    contrast: float = 1.0
) -> Image.Image:
    """Passt Helligkeit und Kontrast an fuer bessere Integration."""
    if brightness != 1.0:
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(brightness)

    if contrast != 1.0:
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(contrast)

    return image


# ============================================================================
# MOCKUP ERSTELLUNG
# ============================================================================

def create_mockup(
    poster: Image.Image,
    room: dict,
    add_shadow: bool = True,
    add_poster_frame: bool = True,
    frame_width: int = 12
) -> Image.Image:
    """
    Erstellt ein vollstaendiges Poster-Mockup.

    Args:
        poster: Das Poster-Bild (RGBA)
        room: Dict mit 'image', 'poster_coords', 'name'
        add_shadow: Schatten hinzufuegen?
        add_poster_frame: Rahmen hinzufuegen?
        frame_width: Rahmenbreite in Pixeln
    """
    room_img = room['image'].copy()
    room_size = room_img.size
    target_coords = room['poster_coords']

    print(f"\n  Verarbeite: {room['name']}")
    print(f"    Raum-Groesse: {room_size}")

    # Optional: Rahmen hinzufuegen
    poster_with_frame = poster.copy()
    if add_poster_frame:
        poster_with_frame = add_frame(poster, frame_width=frame_width)
        print(f"    Rahmen: {frame_width}px")

    # Perspektivische Transformation
    transformed_poster = perspective_transform(
        poster_with_frame,
        target_coords,
        room_size
    )
    print(f"    Transformation: OK")

    # Konvertiere Raum zu RGBA
    room_rgba = room_img.convert('RGBA')

    # Schatten hinzufuegen (vor dem Poster!)
    if add_shadow:
        shadow = create_shadow_fast(
            room_size,
            target_coords,
            offset=(12, 18),
            blur_radius=30,
            opacity=0.35
        )
        room_rgba = Image.alpha_composite(room_rgba, shadow)
        print(f"    Schatten: OK")

    # Poster compositen
    result = Image.alpha_composite(room_rgba, transformed_poster)
    print(f"    Compositing: OK")

    # Zurueck zu RGB konvertieren fuer JPEG-Speicherung
    result_rgb = result.convert('RGB')

    return result_rgb


def auto_detect_wall_area(room_img: Image.Image) -> List[Tuple[int, int]]:
    """
    Generiert automatisch Poster-Koordinaten basierend auf Bildgroesse.
    Platziert das Poster im oberen mittleren Bereich.
    """
    width, height = room_img.size

    # Standard-Position: Obere Mitte des Bildes
    center_x = width // 2
    top_y = height // 5

    # Poster-Groesse relativ zum Bild
    poster_w = width // 4
    poster_h = int(poster_w * 1.4)  # Typisches Poster-Verhaeltnis

    # Leichte Perspektive fuer Realismus
    perspective_offset = 10

    coords = [
        (center_x - poster_w // 2, top_y),
        (center_x + poster_w // 2 + perspective_offset, top_y + 5),
        (center_x + poster_w // 2, top_y + poster_h),
        (center_x - poster_w // 2 - perspective_offset, top_y + poster_h - 5)
    ]

    return coords


# ============================================================================
# BATCH VERARBEITUNG
# ============================================================================

def generate_all_mockups(
    poster: Optional[Image.Image] = None,
    rooms: Optional[List[dict]] = None,
    use_auto_coords: bool = False
) -> List[Path]:
    """
    Generiert Mockups fuer alle definierten Raeume.

    Args:
        poster: Optional vorgefertigtes Poster
        rooms: Optional Liste von Raum-Definitionen
        use_auto_coords: Automatische Koordinaten statt vordefinierter
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Hole Poster falls nicht uebergeben
    if poster is None:
        poster = get_poster_image()

    # Hole Raum-Bilder falls nicht uebergeben
    if rooms is None:
        rooms = get_room_images()

    if not rooms:
        print("Keine Raum-Bilder verfuegbar!")
        return []

    print(f"\n[3/4] Erstelle {len(rooms)} Mockups...")

    generated = []
    for room in rooms:
        try:
            # Optional: Automatische Koordinaten-Erkennung
            if use_auto_coords:
                room['poster_coords'] = auto_detect_wall_area(room['image'])

            mockup = create_mockup(
                poster,
                room,
                add_shadow=True,
                add_poster_frame=True,
                frame_width=10
            )

            output_path = OUTPUT_DIR / f"mockup-{room['name']}.jpg"
            mockup.save(output_path, 'JPEG', quality=92)
            generated.append(output_path)
            print(f"    Gespeichert: {output_path.name}")

        except Exception as e:
            print(f"  Fehler bei {room['name']}: {e}")
            import traceback
            traceback.print_exc()

    return generated


def create_single_mockup(
    poster_path: str,
    room_path: str,
    output_path: str,
    coords: Optional[List[Tuple[int, int]]] = None
) -> str:
    """
    Erstellt ein einzelnes Mockup mit benutzerdefinierten Bildern.

    Args:
        poster_path: Pfad zum Poster-Bild
        room_path: Pfad zum Raum-Bild
        output_path: Pfad fuer das Ausgabe-Bild
        coords: Optional - 4 Eckpunkte [(TL), (TR), (BR), (BL)]

    Returns:
        Pfad zum erstellten Mockup

    Beispiel:
        create_single_mockup(
            'poster.png',
            'room.jpg',
            'output.jpg',
            coords=[(100, 50), (400, 60), (390, 350), (110, 340)]
        )
    """
    print(f"\n=== Einzelnes Mockup erstellen ===")

    poster = Image.open(poster_path).convert('RGBA')
    room = Image.open(room_path).convert('RGB')

    print(f"  Poster: {poster.size}")
    print(f"  Raum: {room.size}")

    if coords is None:
        coords = auto_detect_wall_area(room)
        print(f"  Auto-Koordinaten: {coords}")

    room_dict = {
        'name': Path(room_path).stem,
        'image': room,
        'poster_coords': coords
    }

    mockup = create_mockup(poster, room_dict)
    mockup.save(output_path, 'JPEG', quality=92)
    print(f"\n  Gespeichert: {output_path}")

    return output_path


def interactive_coordinate_helper(room_path: str) -> List[Tuple[int, int]]:
    """
    Hilft beim manuellen Festlegen der Poster-Koordinaten.
    """
    room = Image.open(room_path)
    width, height = room.size

    print(f"\n{'='*50}")
    print("  KOORDINATEN-HELFER")
    print(f"{'='*50}")
    print(f"\n  Bild: {room_path}")
    print(f"  Groesse: {width} x {height} Pixel")
    print(f"\n  Oeffne das Bild in einem Bildbearbeitungsprogramm")
    print("  und notiere die Koordinaten der 4 Ecken:")
    print("    1. Oben links")
    print("    2. Oben rechts")
    print("    3. Unten rechts")
    print("    4. Unten links")
    print(f"\n  Format: [(x1, y1), (x2, y2), (x3, y3), (x4, y4)]")

    default_coords = auto_detect_wall_area(room)
    print(f"\n  Vorgeschlagen: {default_coords}")

    return default_coords


# ============================================================================
# HAUPTPROGRAMM
# ============================================================================

def main():
    """Hauptfunktion - generiert alle Mockups."""
    print("=" * 60)
    print("  PILLOW POSTER MOCKUP GENERATOR")
    print("  100% kostenlos - Poster bleibt pixelgenau")
    print("=" * 60)

    try:
        # Generiere alle Mockups
        generated = generate_all_mockups()

        print(f"\n[4/4] Fertig!")
        print("=" * 60)
        print(f"  Erfolgreich erstellt: {len(generated)} Mockups")
        print(f"  Ausgabe-Ordner: {OUTPUT_DIR}")
        print("=" * 60)

        for path in generated:
            print(f"    - {path.name}")

        return generated

    except Exception as e:
        print(f"\nFehler: {e}")
        import traceback
        traceback.print_exc()
        return []


def print_help():
    """Zeigt Hilfe an."""
    print("""
PILLOW POSTER MOCKUP GENERATOR
==============================

Verwendung:
  python pillow-mockup.py                    Generiert alle Mockups
  python pillow-mockup.py --help             Zeigt diese Hilfe
  python pillow-mockup.py --coords BILD      Koordinaten-Helfer

Abhaengigkeiten:
  pip install Pillow requests

Programmier-API:
  from pillow_mockup import create_single_mockup

  # Mit automatischen Koordinaten
  create_single_mockup('poster.png', 'room.jpg', 'output.jpg')

  # Mit manuellen Koordinaten
  create_single_mockup(
      'poster.png',
      'room.jpg',
      'output.jpg',
      coords=[(100, 50), (400, 60), (390, 350), (110, 340)]
  )

Koordinaten-Format:
  4 Punkte im Uhrzeigersinn: [Oben-Links, Oben-Rechts, Unten-Rechts, Unten-Links]
  Jeder Punkt als (x, y) Tuple

Ausgabe-Ordner:
  /Users/waleria/Desktop/poster/public/mockups/

Raum-Bilder werden gecacht in:
  /Users/waleria/Desktop/poster/assets/rooms/
""")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg in ("--help", "-h"):
            print_help()
        elif arg == "--coords" and len(sys.argv) > 2:
            interactive_coordinate_helper(sys.argv[2])
        elif arg == "--auto":
            # Verwende automatische Koordinaten
            generate_all_mockups(use_auto_coords=True)
        else:
            main()
    else:
        main()
