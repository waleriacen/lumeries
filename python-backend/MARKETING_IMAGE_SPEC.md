# Marketing Image Batch Generator - Technical Specification

## Project Overview

A Python script that takes a rendered moon poster image (500x700px) as input and
composites it into 13 marketing scenes using **only Pillow + NumPy** -- no AI APIs,
no cloud dependencies, 100% local, 100% free, 100% deterministic.

Each scene is exported in two formats:
- **Pinterest**: 1000x1500 (2:3 portrait)
- **Instagram**: 1080x1080 (1:1 square)

Total output: **26 images** (13 scenes x 2 formats).

---

## Architecture

```
python-backend/
    generate_marketing.py          # Main entry point
    marketing/
        __init__.py
        config.py                  # Constants, paths, color palettes
        poster_utils.py            # Poster loading, perspective transforms
        scene_bedroom.py           # Bedroom wall mockup
        scene_living_room.py       # Living room mockup
        scene_desk.py              # Desk/shelf display
        scene_gift_wrap.py         # Gift wrapping scene
        scene_couple_stargazing.py # Romantic stargazing
        scene_wedding_table.py     # Wedding table display
        scene_anniversary.py       # Anniversary setting
        scene_hands_holding.py     # Hands holding poster
        scene_flat_lay.py          # Flat-lay overhead shot
        scene_gallery_wall.py      # Gallery wall arrangement
        social_pinterest_pin.py    # Pinterest pin with CTA
        social_instagram_post.py   # Instagram post with CTA
        social_story_slide.py      # Story-style vertical slide
        text_overlays.py           # Text rendering utilities
        backgrounds.py             # Background/gradient generators
        shadows.py                 # Shadow and lighting effects
        export.py                  # Output sizing and saving
    assets/
        backgrounds/               # Solid/gradient background templates
            bedroom_wall.png       # ~1500x1000 warm-toned wall texture
            living_room.png        # ~1500x1000 modern room scene
            desk_surface.png       # ~1500x1000 wooden desk surface
            marble_surface.png     # ~1500x1000 flat-lay surface
            gift_paper.png         # ~1000x1000 wrapping paper texture
            starry_sky.png         # ~1500x1000 night sky background
            wedding_table.png      # ~1500x1000 elegant table setting
            gallery_wall.png       # ~1500x1000 white/gray wall
        overlays/
            frame_black.png        # Poster frame overlay (transparent PNG)
            frame_white.png        # White frame variant
            frame_wood.png         # Wood frame variant
            shadow_drop.png        # Pre-rendered drop shadow
            shadow_perspective.png # Wall-mounted shadow
            candle_glow.png        # Warm candle light overlay
            bokeh_lights.png       # Bokeh light overlay
            rose_petals.png        # Scattered rose petals (transparent)
            gift_bow.png           # Gift ribbon/bow overlay
        props/
            hands_holding.png      # Hands holding a frame (transparent)
            coffee_cup.png         # Coffee cup prop (transparent)
            book_stack.png         # Stack of books (transparent)
            plant_pot.png          # Small plant (transparent)
            fairy_lights.png       # String lights (transparent)
        fonts/
            (uses system fonts -- see FONT STRATEGY below)
    output/
        pinterest/                 # 1000x1500 outputs
        instagram/                 # 1080x1080 outputs
```

---

## Dependencies

```
# Add to requirements.txt
pillow>=10.0.0
numpy>=1.24.0
```

That is it. No OpenCV needed for this script. Pillow handles:
- Image compositing (paste, alpha_composite)
- Perspective transforms (Image.transform with PERSPECTIVE)
- Gaussian blur (ImageFilter.GaussianBlur)
- Color adjustments (ImageEnhance)
- Text rendering (ImageDraw + ImageFont)
- Shadow generation (offset + blur of silhouette)

---

## Font Strategy

Use macOS system fonts (all confirmed available on this machine):

| Purpose              | Font                          | Path                                        |
|----------------------|-------------------------------|---------------------------------------------|
| Headlines/CTA        | Avenir Next Bold              | /System/Library/Fonts/Avenir Next.ttc       |
| Body/descriptions    | Avenir Next Regular           | /System/Library/Fonts/Avenir Next.ttc       |
| Script/romantic      | Noteworthy                    | /System/Library/Fonts/Noteworthy.ttc        |
| Monospace/coords     | SF Mono                       | /System/Library/Fonts/SFNSMono.ttf          |
| Elegant serif        | Palatino                      | /System/Library/Fonts/Palatino.ttc          |
| Clean sans           | Helvetica Neue                | /System/Library/Fonts/HelveticaNeue.ttc     |

Fallback strategy: If a font file is not found, fall back to Pillow's default font
with a warning printed to stderr.

---

## Core Utilities

### config.py -- Constants

```python
"""Global configuration for marketing image generation."""

from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
ASSETS_DIR = PROJECT_ROOT / "assets"
OUTPUT_DIR = PROJECT_ROOT / "output"
BACKGROUNDS_DIR = ASSETS_DIR / "backgrounds"
OVERLAYS_DIR = ASSETS_DIR / "overlays"
PROPS_DIR = ASSETS_DIR / "props"

# Output dimensions
PINTEREST_SIZE = (1000, 1500)  # 2:3 portrait
INSTAGRAM_SIZE = (1080, 1080)  # 1:1 square

# Poster input dimensions (as rendered by the Next.js app)
POSTER_NATIVE_SIZE = (500, 700)  # 5:7 ratio

# Color palettes
PALETTE = {
    "warm_cream":    "#F5F0E8",
    "soft_white":    "#FAFAFA",
    "charcoal":      "#2C2C2C",
    "deep_navy":     "#0A0E1A",
    "midnight":      "#040610",
    "gold_accent":   "#D4AF37",
    "rose_gold":     "#B76E79",
    "sage_green":    "#9CAF88",
    "dusty_pink":    "#D4A5A5",
    "warm_gray":     "#8B8680",
    "ivory":         "#FFFFF0",
}

# Font paths (macOS)
FONTS = {
    "headline":   "/System/Library/Fonts/Avenir Next.ttc",
    "body":       "/System/Library/Fonts/Avenir Next.ttc",
    "script":     "/System/Library/Fonts/Noteworthy.ttc",
    "mono":       "/System/Library/Fonts/SFNSMono.ttf",
    "serif":      "/System/Library/Fonts/Palatino.ttc",
    "sans":       "/System/Library/Fonts/HelveticaNeue.ttc",
}

# JPEG output quality
JPEG_QUALITY = 92
```

### poster_utils.py -- Poster Manipulation

```python
"""Utilities for loading, framing, and transforming the poster image."""

from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np


def load_poster(path: str, size: tuple[int, int] | None = None) -> Image.Image:
    """
    Load poster image and optionally resize.

    Args:
        path: Path to the poster PNG/JPG file.
        size: Optional (width, height) to resize to. Maintains aspect ratio
              and adds letterboxing if aspect ratios don't match.

    Returns:
        RGBA Image of the poster.
    """
    ...


def add_frame(
    poster: Image.Image,
    frame_style: str = "black",   # "black", "white", "wood", "none"
    frame_width_ratio: float = 0.03,  # Frame width as ratio of poster width
    mat_width_ratio: float = 0.06,    # White mat border ratio
    mat_color: str = "#FFFFFF",
) -> Image.Image:
    """
    Add a picture frame around the poster.

    Instead of using a pre-made frame PNG, this DRAWS the frame procedurally:
    1. Add white/cream mat border around poster
    2. Add frame border (solid color or wood-textured)
    3. Add subtle inner shadow for depth

    This is more flexible than pre-made frame PNGs because it adapts
    to any poster size.

    Args:
        poster: The poster image (RGBA).
        frame_style: Visual style of the frame.
        frame_width_ratio: Width of frame border relative to poster width.
        mat_width_ratio: Width of mat/passepartout relative to poster width.
        mat_color: Color of the mat border.

    Returns:
        RGBA Image of framed poster.
    """
    ...


def generate_drop_shadow(
    image: Image.Image,
    offset: tuple[int, int] = (8, 12),
    blur_radius: int = 20,
    shadow_color: tuple[int, int, int, int] = (0, 0, 0, 100),
) -> Image.Image:
    """
    Generate a drop shadow behind an image.

    Algorithm:
    1. Create a solid-color image the same size as the input
    2. Use the input's alpha channel as the shadow shape
    3. Apply Gaussian blur
    4. Offset by (dx, dy)
    5. Composite: shadow layer -> then original on top

    Args:
        image: RGBA image to cast shadow from.
        offset: (x, y) pixel offset for shadow.
        blur_radius: Gaussian blur radius for shadow softness.
        shadow_color: RGBA color of shadow.

    Returns:
        RGBA Image with shadow behind it (canvas is larger by offset+blur).
    """
    ...


def perspective_transform(
    poster: Image.Image,
    quad: list[tuple[int, int]],  # 4 corner points: TL, TR, BR, BL
    output_size: tuple[int, int],
) -> Image.Image:
    """
    Apply perspective transform to make poster appear mounted on a wall
    at an angle, or held in hands, etc.

    Uses PIL's Image.transform(PERSPECTIVE) which requires 8 coefficients.
    The `quad` parameter defines where the 4 corners of the poster should
    map to in the output image.

    Algorithm to find coefficients:
    1. Define source corners: (0,0), (w,0), (w,h), (0,h)
    2. Define destination corners: quad[0..3]
    3. Solve the 8-coefficient perspective matrix using numpy
    4. Apply Image.transform(output_size, PERSPECTIVE, coefficients)

    Args:
        poster: The poster image to transform.
        quad: Four (x, y) destination points for corners [TL, TR, BR, BL].
        output_size: (width, height) of the output canvas.

    Returns:
        RGBA Image with perspective-transformed poster on transparent bg.
    """
    ...


def apply_wall_lighting(
    poster: Image.Image,
    light_direction: str = "top-left",  # "top-left", "top-right", "top-center"
    intensity: float = 0.3,
) -> Image.Image:
    """
    Apply a subtle lighting gradient to simulate wall-mounted illumination.

    Creates a gradient overlay (lighter on the side closer to the 'light')
    and composites it over the poster in 'multiply' or 'overlay' mode.

    Args:
        poster: The poster image.
        light_direction: Where the simulated light comes from.
        intensity: How strong the lighting effect is (0.0 = none, 1.0 = strong).

    Returns:
        Image with lighting applied.
    """
    ...
```

### shadows.py -- Shadow and Depth Effects

```python
"""Shadow generation for realistic mockup compositing."""

from PIL import Image, ImageFilter


def wall_shadow(
    framed_poster: Image.Image,
    wall_size: tuple[int, int],
    poster_position: tuple[int, int],
    shadow_offset: tuple[int, int] = (6, 8),
    shadow_blur: int = 15,
    shadow_opacity: int = 80,
) -> Image.Image:
    """
    Create a wall-mounted shadow effect.

    The shadow is cast as if the poster is hanging slightly off the wall,
    with light coming from above-left.

    Returns:
        RGBA Image (wall_size) containing only the shadow.
    """
    ...


def surface_shadow(
    object_image: Image.Image,
    surface_size: tuple[int, int],
    object_position: tuple[int, int],
    shadow_direction: str = "bottom",  # "bottom", "right", "bottom-right"
    shadow_length: int = 30,
    shadow_blur: int = 12,
    shadow_opacity: int = 60,
) -> Image.Image:
    """
    Create a contact shadow for objects resting on a surface (desk, table).

    Returns:
        RGBA Image containing only the shadow.
    """
    ...
```

### text_overlays.py -- Text Rendering

```python
"""Text overlay utilities for social media marketing images."""

from PIL import Image, ImageDraw, ImageFont
from .config import FONTS


def load_font(style: str, size: int) -> ImageFont.FreeTypeFont:
    """
    Load a font by style name with fallback.

    Args:
        style: Key from FONTS dict ("headline", "body", "script", etc.)
        size: Font size in pixels.

    Returns:
        FreeTypeFont object.
    """
    ...


def draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    position: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str = "#FFFFFF",
    shadow_color: str = "#000000",
    shadow_offset: tuple[int, int] = (2, 2),
    shadow_blur: int = 4,
) -> None:
    """Draw text with a soft shadow behind it for readability."""
    ...


def draw_pill_button(
    image: Image.Image,
    position: tuple[int, int],       # center position
    text: str,
    font: ImageFont.FreeTypeFont,
    bg_color: str = "#D4AF37",
    text_color: str = "#FFFFFF",
    padding: tuple[int, int] = (40, 16),
    border_radius: int = 25,
) -> Image.Image:
    """
    Draw a pill-shaped CTA button (e.g., "Jetzt gestalten" / "Shop Now").

    Returns:
        Image with button drawn on it.
    """
    ...


def draw_price_badge(
    image: Image.Image,
    position: tuple[int, int],
    price: str,                       # e.g., "ab 29,99 EUR"
    font: ImageFont.FreeTypeFont,
    badge_color: str = "#D4AF37",
    text_color: str = "#FFFFFF",
    size: int = 80,
) -> Image.Image:
    """
    Draw a circular or rounded-rect price badge.

    Returns:
        Image with badge drawn on it.
    """
    ...


def draw_watermark(
    image: Image.Image,
    text: str = "mondposter.de",
    opacity: int = 40,
    position: str = "bottom-right",   # "bottom-right", "bottom-center"
) -> Image.Image:
    """
    Add a subtle watermark/branding to the image.

    Returns:
        Image with watermark.
    """
    ...
```

### backgrounds.py -- Background Generation

```python
"""Generate background canvases for scenes that don't use stock photos."""

from PIL import Image, ImageDraw, ImageFilter
import numpy as np


def solid_color(size: tuple[int, int], color: str) -> Image.Image:
    """Create a solid color background."""
    ...


def vertical_gradient(
    size: tuple[int, int],
    color_top: str,
    color_bottom: str,
) -> Image.Image:
    """Create a smooth vertical gradient background."""
    ...


def radial_gradient(
    size: tuple[int, int],
    color_center: str,
    color_edge: str,
) -> Image.Image:
    """Create a radial (circular) gradient background."""
    ...


def starry_night_bg(
    size: tuple[int, int],
    star_density: int = 200,
    color_top: str = "#0A0E1A",
    color_bottom: str = "#1A1A3E",
) -> Image.Image:
    """
    Generate a starry night sky background procedurally.

    Algorithm:
    1. Create vertical gradient from dark navy to deep blue
    2. Scatter random white dots (stars) with varying brightness
    3. Add a few larger 'bright stars' with a subtle glow
    4. Apply very slight Gaussian blur for atmosphere

    Returns:
        RGB Image of starry sky.
    """
    ...


def wood_texture(
    size: tuple[int, int],
    tone: str = "warm",  # "warm", "cool", "dark"
) -> Image.Image:
    """
    Generate a simple procedural wood grain texture.

    Algorithm:
    1. Create base brown color
    2. Add horizontal noise bands (grain lines)
    3. Apply slight color variation
    4. Blur slightly for realism

    Returns:
        RGB Image of wood texture.
    """
    ...


def wall_texture(
    size: tuple[int, int],
    color: str = "#F5F0E8",
    texture_intensity: float = 0.05,
) -> Image.Image:
    """
    Generate a subtle wall texture (painted drywall look).

    Algorithm:
    1. Fill with base wall color
    2. Add very subtle noise (simulates paint texture)
    3. Add extremely subtle vertical lighting gradient

    Returns:
        RGB Image of wall texture.
    """
    ...


def marble_texture(
    size: tuple[int, int],
    tone: str = "white",  # "white", "gray", "pink"
) -> Image.Image:
    """
    Generate a simple marble-like surface texture.

    Algorithm:
    1. Base white/gray color
    2. Add Perlin-like noise veins using numpy
    3. Slight color tinting
    4. Blur for softness

    Returns:
        RGB Image of marble texture.
    """
    ...
```

### export.py -- Output Formatting

```python
"""Export scenes to Pinterest and Instagram formats."""

from PIL import Image, ImageDraw
from .config import PINTEREST_SIZE, INSTAGRAM_SIZE, JPEG_QUALITY, OUTPUT_DIR


def fit_to_canvas(
    scene: Image.Image,
    canvas_size: tuple[int, int],
    background_color: str = "#000000",
    mode: str = "cover",  # "cover" (crop to fill), "contain" (fit with bars), "stretch"
) -> Image.Image:
    """
    Fit a scene image onto a canvas of the target size.

    For "cover" mode:
    1. Scale scene so it fully covers the canvas (some cropping)
    2. Center-crop to exact dimensions

    For "contain" mode:
    1. Scale scene to fit within canvas (no cropping)
    2. Add background-colored bars on shorter dimension

    Args:
        scene: The composed scene image.
        canvas_size: Target (width, height).
        background_color: Color for letterbox/pillarbox bars.
        mode: Sizing strategy.

    Returns:
        RGB Image at exact canvas_size dimensions.
    """
    ...


def export_scene(
    scene: Image.Image,
    scene_name: str,
    bg_color_pinterest: str = "#000000",
    bg_color_instagram: str = "#000000",
    fit_mode: str = "cover",
) -> dict[str, str]:
    """
    Export a scene to both Pinterest and Instagram formats.

    Saves:
        output/pinterest/{scene_name}_pinterest.jpg
        output/instagram/{scene_name}_instagram.jpg

    Args:
        scene: The composed scene (any size, will be fitted).
        scene_name: Base filename (no extension).
        bg_color_pinterest: Background for Pinterest letterboxing.
        bg_color_instagram: Background for Instagram letterboxing.
        fit_mode: "cover" or "contain".

    Returns:
        Dict with "pinterest" and "instagram" keys -> file paths.
    """
    ...
```

---

## The 13 Scenes

### Category 1: Lifestyle/Mockup Scenes (5 scenes)

#### Scene 1: `scene_bedroom.py` -- Bedroom Wall

```python
def generate_bedroom_scene(poster_path: str) -> Image.Image:
    """
    Poster hanging on a cozy bedroom wall above a bed headboard.

    Composition (working canvas: 1600x1200):
    1. BACKGROUND: warm-toned wall texture (#F5EDE0) filling full canvas
    2. POSTER: framed (black frame, white mat), sized ~320x450
       - Positioned: center-x, upper-third vertically
       - Subtle perspective (very slight -- nearly straight-on)
       - Wall shadow behind it (offset 6px right, 10px down, blur 15)
    3. FOREGROUND ELEMENTS (all procedurally drawn):
       - Bed headboard hint: dark rectangle at bottom 30% of canvas
       - Two small rectangles (pillows) on the headboard
       - Soft warm color wash overlay (simulates lamp light, 5% opacity)
    4. LIGHTING: radial gradient overlay, warm tone, centered slightly left

    The key insight: We do NOT need a photograph of a bedroom. A wall
    texture + geometric shapes suggesting furniture + warm lighting
    creates a convincing "bedroom" context. The eye focuses on the poster.

    Returns:
        RGBA Image ~1600x1200 (will be cropped to format by export).
    """
    ...
```

#### Scene 2: `scene_living_room.py` -- Living Room Wall

```python
def generate_living_room_scene(poster_path: str) -> Image.Image:
    """
    Poster on a modern living room wall above a sofa/shelf.

    Composition (working canvas: 1600x1200):
    1. BACKGROUND: light gray wall texture (#EDEDED)
    2. POSTER: framed (white frame, no mat), sized ~350x490
       - Positioned: slightly left of center (rule of thirds)
       - Straight-on (no perspective)
       - Clean wall shadow
    3. FOREGROUND ELEMENTS (procedural):
       - Sofa back: rounded dark rectangle at bottom 25%
       - Small side table with plant silhouette (simple shapes)
       - Subtle shelf line or picture ledge
    4. STYLING: cool-neutral tones, minimal, Scandinavian feel

    Returns:
        RGBA Image ~1600x1200.
    """
    ...
```

#### Scene 3: `scene_desk.py` -- Desk Display

```python
def generate_desk_scene(poster_path: str) -> Image.Image:
    """
    Poster propped up on a desk/shelf, leaning against the wall.

    Composition (working canvas: 1400x1200):
    1. BACKGROUND: wall texture (upper 60%) + wood desk surface (lower 40%)
    2. POSTER: framed (wood frame), sized ~280x390
       - Slight backward lean (subtle perspective: top narrower than bottom)
       - Resting on desk surface
       - Contact shadow on desk + wall shadow
    3. PROPS (procedural):
       - Coffee cup: simple circle + handle shape, warm brown fill
       - Stack of books: 2-3 colored rectangles, stacked
       - Small plant: simple green shapes in a brown pot circle
    4. LIGHTING: top-left warm light

    Returns:
        RGBA Image ~1400x1200.
    """
    ...
```

#### Scene 4: `scene_flat_lay.py` -- Overhead Flat Lay

```python
def generate_flat_lay_scene(poster_path: str) -> Image.Image:
    """
    Overhead (bird's eye) shot of the poster on a textured surface
    surrounded by styled props.

    Composition (working canvas: 1200x1200 -- square works for both formats):
    1. BACKGROUND: marble or wood surface texture (procedurally generated)
    2. POSTER: unframed, laid flat, sized ~400x560
       - Centered but slightly rotated (~3-5 degrees)
       - Soft drop shadow (close, subtle -- it's laying on the surface)
    3. PROPS (procedural):
       - Coffee cup (top view: circle with inner circle)
       - Pen: thin angled rectangle
       - Small flower/eucalyptus: simple green leaf shapes
       - Notebook: rectangle with lines
       - Scattered items create "styled" look
    4. VIGNETTE: subtle radial darkening at edges

    Returns:
        RGBA Image ~1200x1200.
    """
    ...
```

#### Scene 5: `scene_gallery_wall.py` -- Gallery Wall

```python
def generate_gallery_wall_scene(poster_path: str) -> Image.Image:
    """
    The moon poster as the centerpiece of a gallery wall arrangement.

    Composition (working canvas: 1600x1200):
    1. BACKGROUND: white wall texture
    2. CENTER: The moon poster, framed (black frame), largest piece ~300x420
    3. SURROUNDING: 4-6 "other frames" (simple colored/gray rectangles
       in frames) arranged aesthetically around the center poster
       - These are intentionally blurred/desaturated so the moon poster
         stands out as the hero
       - Various sizes: some landscape, some portrait, some square
    4. All frames get wall shadows
    5. Very clean, minimal styling

    Returns:
        RGBA Image ~1600x1200.
    """
    ...
```

### Category 2: Romantic/Emotional Scenes (4 scenes)

#### Scene 6: `scene_couple_stargazing.py` -- Stargazing Couple

```python
def generate_stargazing_scene(poster_path: str) -> Image.Image:
    """
    Romantic scene: the poster displayed against a starry night backdrop,
    suggesting the "night we met" concept.

    Composition (working canvas: 1600x1200):
    1. BACKGROUND: procedural starry sky gradient (deep navy -> dark purple)
       with scattered star dots
    2. POSTER: framed (thin gold frame), sized ~350x490
       - Centered, floating appearance
       - Subtle golden glow around the frame (radial gradient, low opacity)
    3. DECORATIVE ELEMENTS:
       - Crescent moon shape in upper corner (drawn with arcs)
       - Scattered tiny star dots
       - Thin gold decorative lines/borders at edges
    4. TEXT OVERLAY (optional, for social media variant):
       - "Die Nacht als wir uns trafen" in script font
       - Positioned above or below the poster

    Returns:
        RGBA Image ~1600x1200.
    """
    ...
```

#### Scene 7: `scene_wedding_table.py` -- Wedding Gift Display

```python
def generate_wedding_table_scene(poster_path: str) -> Image.Image:
    """
    Poster as a wedding gift, displayed on an elegant table.

    Composition (working canvas: 1400x1200):
    1. BACKGROUND: soft ivory/cream gradient (#FFFFF0 -> #F5EDE0)
    2. POSTER: framed (white frame, wide mat), sized ~280x390
       - Slightly angled (3-5 degree rotation)
       - Elegant shadow
    3. DECORATIVE ELEMENTS (procedural):
       - Candle: simple rectangle with yellow flame (drawn shapes)
       - Rose petals: small pink/red ellipses scattered around
       - Ribbon: curved golden shape near the poster
       - Soft bokeh circles (semi-transparent white circles, blurred)
    4. WARM GOLDEN LIGHT: warm color overlay at low opacity
    5. VIGNETTE: soft edge darkening

    Returns:
        RGBA Image ~1400x1200.
    """
    ...
```

#### Scene 8: `scene_anniversary.py` -- Anniversary Setting

```python
def generate_anniversary_scene(poster_path: str) -> Image.Image:
    """
    Intimate anniversary gift reveal setting.

    Composition (working canvas: 1400x1200):
    1. BACKGROUND: dark, moody gradient (charcoal -> near-black)
    2. POSTER: framed (thin gold frame), sized ~320x450
       - Center-left positioned
       - Dramatic spotlight effect (bright area around poster, dark edges)
    3. DECORATIVE ELEMENTS:
       - Fairy lights: string of small yellow-white dots across top
       - Candle glow: warm radial gradient, lower-right
       - Rose: simple red circle with green stem line
    4. MOODY LIGHTING: dramatic, intimate feel
       - Strong vignette
       - Warm color temperature overlay

    Returns:
        RGBA Image ~1400x1200.
    """
    ...
```

#### Scene 9: `scene_gift_wrap.py` -- Gift Wrapping

```python
def generate_gift_wrap_scene(poster_path: str) -> Image.Image:
    """
    The poster being unwrapped or presented as a gift.

    Composition (working canvas: 1200x1200):
    1. BACKGROUND: kraft paper / warm brown texture (procedural)
    2. POSTER: unframed, partially "emerging" from wrapping
       - Poster is full-visible but with wrapping paper shapes overlapping
         the edges (like it's being pulled out of an envelope)
       - Slight rotation (5-8 degrees)
    3. WRAPPING ELEMENTS:
       - Brown kraft paper rectangle behind poster (slightly larger, rotated)
       - Gold ribbon: curved golden stripe across
       - Gift tag: small rounded rectangle with "Fur dich" text
       - Tissue paper: translucent white shapes at edges
    4. SURFACE: wood desk underneath

    Returns:
        RGBA Image ~1200x1200.
    """
    ...
```

### Category 3: Social Media Posts (4 scenes)

#### Scene 10: `social_pinterest_pin.py` -- Pinterest Pin

```python
def generate_pinterest_pin(poster_path: str) -> Image.Image:
    """
    Optimized Pinterest pin layout with CTA elements.

    Composition (working canvas: 1000x1500 -- native Pinterest size):
    1. BACKGROUND: elegant dark gradient (matches poster aesthetic)
    2. POSTER: framed, prominently displayed in upper 60% of canvas
       - Sized ~500x700 (large, hero placement)
       - Centered horizontally
       - White or gold frame
    3. TEXT ELEMENTS (below poster):
       - Headline: "Personalisiertes Mond-Poster" (Avenir Next Bold, 36px)
       - Subheadline: "Die Nacht die alles veranderte" (Palatino Italic, 24px)
       - Price: "ab 29,99 EUR" in gold badge
       - CTA button: "Jetzt gestalten ->" pill button
    4. BRANDING:
       - Small logo/wordmark at bottom: "mondposter.de"
       - Thin gold line separators
    5. STYLE: clean, premium, dark background with gold accents

    Returns:
        RGB Image 1000x1500 (already at Pinterest size).
    """
    ...
```

#### Scene 11: `social_instagram_post.py` -- Instagram Post

```python
def generate_instagram_post(poster_path: str) -> Image.Image:
    """
    Instagram feed post optimized for engagement.

    Composition (working canvas: 1080x1080 -- native Instagram size):
    1. BACKGROUND: split layout
       - Left 55%: lifestyle scene (poster on wall, simplified)
       - Right 45%: solid color panel with text
       OR
       - Full bleed: poster mockup with text overlay
    2. POSTER: in mockup context (wall-mounted, small-medium size)
    3. TEXT ELEMENTS:
       - Hook text: "Das perfekte Geschenk" (large, bold)
       - Body: "Schenke den Mond einer besonderen Nacht" (smaller)
       - CTA: "Link in Bio" with arrow icon
    4. HASHTAG SUGGESTION (small, bottom): "#mondposter #geschenkidee"
    5. BRANDING: @mondposter.de handle

    Returns:
        RGB Image 1080x1080 (already at Instagram size).
    """
    ...
```

#### Scene 12: `social_story_slide.py` -- Story-Style Vertical

```python
def generate_story_slide(poster_path: str) -> Image.Image:
    """
    Vertical story-format slide (works for IG Stories, Pinterest).

    Composition (working canvas: 1000x1500):
    1. BACKGROUND: dramatic dark gradient with starry elements
    2. LAYOUT (top to bottom):
       a. Top 15%: "Swipe Up" or headline text
       b. Middle 55%: Poster (large, framed, with glow effect)
       c. Bottom 30%: feature bullets + CTA
    3. TEXT:
       - "Dein personalisierter Mond" (headline, top)
       - Feature list:
         * "Exakter Mond deines Datums"
         * "Sternenkarte inklusive"
         * "Sofort-Download als PDF"
       - CTA: "Jetzt gestalten" button
    4. VISUAL EFFECTS:
       - Subtle particle/star animation feel (scattered dots)
       - Gold accent lines
       - Premium dark aesthetic matching the poster style

    Returns:
        RGB Image 1000x1500.
    """
    ...
```

#### Scene 13: `scene_hands_holding.py` -- Hands Holding Poster

```python
def generate_hands_holding_scene(poster_path: str) -> Image.Image:
    """
    Simulated POV of someone holding/admiring the poster.

    Composition (working canvas: 1400x1200):
    1. BACKGROUND: blurred room environment (soft gradient, out of focus)
    2. POSTER: unframed, sized ~400x560
       - Slight perspective (closer at bottom, narrower at top)
       - Subtle paper curl effect at corners (slight shadow gradient)
    3. DEPTH EFFECT:
       - Poster is sharp and in focus
       - Background is blurred (Gaussian blur)
       - Foreground (bottom edge) has a slight blur too
    4. LIGHTING: natural, even lighting from above

    NOTE: We do NOT render actual hands. The perspective transform and
    depth-of-field effect implies someone is holding it. This is a
    common marketing photography technique -- showing the product
    "in hand" without actual hands in frame.

    Returns:
        RGBA Image ~1400x1200.
    """
    ...
```

---

## Main Entry Point

### generate_marketing.py

```python
#!/usr/bin/env python3
"""
Batch Marketing Image Generator for Moon Poster

Usage:
    python generate_marketing.py <poster_image_path> [--output-dir OUTPUT_DIR]
    python generate_marketing.py poster.png
    python generate_marketing.py poster.png --output-dir ./my_output
    python generate_marketing.py poster.png --scenes bedroom,pinterest_pin
    python generate_marketing.py poster.png --format pinterest
    python generate_marketing.py poster.png --text-lang de

Arguments:
    poster_image_path   Path to the rendered poster image (PNG or JPG, ideally 500x700)

Options:
    --output-dir DIR    Output directory (default: ./output)
    --scenes LIST       Comma-separated list of scenes to generate (default: all)
    --format FMT        Output format: "both", "pinterest", "instagram" (default: both)
    --text-lang LANG    Language for text overlays: "de" or "en" (default: de)
    --quality Q         JPEG quality 1-100 (default: 92)
    --no-watermark      Skip watermark on output images
    --poster-url URL    URL to embed in CTA text (default: mondposter.de)
"""

import argparse
import sys
import time
from pathlib import Path

from marketing.config import OUTPUT_DIR
from marketing.poster_utils import load_poster
from marketing.export import export_scene

# Import all scene generators
from marketing.scene_bedroom import generate_bedroom_scene
from marketing.scene_living_room import generate_living_room_scene
from marketing.scene_desk import generate_desk_scene
from marketing.scene_flat_lay import generate_flat_lay_scene
from marketing.scene_gallery_wall import generate_gallery_wall_scene
from marketing.scene_couple_stargazing import generate_stargazing_scene
from marketing.scene_wedding_table import generate_wedding_table_scene
from marketing.scene_anniversary import generate_anniversary_scene
from marketing.scene_gift_wrap import generate_gift_wrap_scene
from marketing.scene_hands_holding import generate_hands_holding_scene
from marketing.social_pinterest_pin import generate_pinterest_pin
from marketing.social_instagram_post import generate_instagram_post
from marketing.social_story_slide import generate_story_slide


# Scene registry: name -> (generator_function, description)
SCENES = {
    # Lifestyle/Mockups
    "bedroom":          (generate_bedroom_scene,       "Poster on bedroom wall"),
    "living_room":      (generate_living_room_scene,   "Poster in living room"),
    "desk":             (generate_desk_scene,           "Poster on desk/shelf"),
    "flat_lay":         (generate_flat_lay_scene,       "Overhead flat lay"),
    "gallery_wall":     (generate_gallery_wall_scene,   "Gallery wall arrangement"),

    # Romantic/Emotional
    "stargazing":       (generate_stargazing_scene,     "Starry night romantic scene"),
    "wedding_table":    (generate_wedding_table_scene,  "Wedding gift display"),
    "anniversary":      (generate_anniversary_scene,    "Anniversary setting"),
    "gift_wrap":        (generate_gift_wrap_scene,      "Gift wrapping scene"),
    "hands_holding":    (generate_hands_holding_scene,  "POV holding the poster"),

    # Social Media
    "pinterest_pin":    (generate_pinterest_pin,        "Pinterest pin with CTA"),
    "instagram_post":   (generate_instagram_post,       "Instagram feed post"),
    "story_slide":      (generate_story_slide,          "Story-format vertical"),
}


def main():
    parser = argparse.ArgumentParser(
        description="Generate marketing images for moon poster"
    )
    parser.add_argument("poster_path", help="Path to poster image")
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR))
    parser.add_argument("--scenes", default="all",
                        help="Comma-separated scene names, or 'all'")
    parser.add_argument("--format", default="both",
                        choices=["both", "pinterest", "instagram"])
    parser.add_argument("--text-lang", default="de", choices=["de", "en"])
    parser.add_argument("--quality", type=int, default=92)
    parser.add_argument("--no-watermark", action="store_true")
    parser.add_argument("--poster-url", default="mondposter.de")
    args = parser.parse_args()

    # Validate poster path
    poster_path = Path(args.poster_path)
    if not poster_path.exists():
        print(f"ERROR: Poster image not found: {poster_path}", file=sys.stderr)
        sys.exit(1)

    # Create output directories
    output_dir = Path(args.output_dir)
    (output_dir / "pinterest").mkdir(parents=True, exist_ok=True)
    (output_dir / "instagram").mkdir(parents=True, exist_ok=True)

    # Determine which scenes to generate
    if args.scenes == "all":
        scenes_to_run = list(SCENES.keys())
    else:
        scenes_to_run = [s.strip() for s in args.scenes.split(",")]
        for s in scenes_to_run:
            if s not in SCENES:
                print(f"ERROR: Unknown scene '{s}'. Available: {', '.join(SCENES.keys())}",
                      file=sys.stderr)
                sys.exit(1)

    # Generate each scene
    print(f"Generating {len(scenes_to_run)} scenes...")
    print(f"Poster: {poster_path}")
    print(f"Output: {output_dir}")
    print(f"Formats: {args.format}")
    print()

    results = {}
    for i, scene_name in enumerate(scenes_to_run, 1):
        generator_fn, description = SCENES[scene_name]
        print(f"[{i}/{len(scenes_to_run)}] {scene_name}: {description}...", end=" ")

        start = time.time()
        try:
            scene_image = generator_fn(str(poster_path))
            paths = export_scene(
                scene_image,
                scene_name,
                output_dir=output_dir,
                formats=args.format,
                quality=args.quality,
            )
            elapsed = time.time() - start
            print(f"OK ({elapsed:.1f}s)")
            results[scene_name] = paths
        except Exception as e:
            print(f"FAILED: {e}")
            results[scene_name] = {"error": str(e)}

    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    success = sum(1 for v in results.values() if "error" not in v)
    failed = len(results) - success
    print(f"Success: {success}/{len(results)}")
    if failed:
        print(f"Failed:  {failed}")
        for name, result in results.items():
            if "error" in result:
                print(f"  - {name}: {result['error']}")

    total_files = sum(
        len([v2 for v2 in v.values() if isinstance(v2, str)])
        for v in results.values()
        if "error" not in v
    )
    print(f"Total files generated: {total_files}")


if __name__ == "__main__":
    main()
```

---

## Output File Naming Convention

```
output/
    pinterest/
        01_bedroom_pinterest.jpg
        02_living_room_pinterest.jpg
        03_desk_pinterest.jpg
        04_flat_lay_pinterest.jpg
        05_gallery_wall_pinterest.jpg
        06_stargazing_pinterest.jpg
        07_wedding_table_pinterest.jpg
        08_anniversary_pinterest.jpg
        09_gift_wrap_pinterest.jpg
        10_hands_holding_pinterest.jpg
        11_pinterest_pin_pinterest.jpg
        12_instagram_post_pinterest.jpg
        13_story_slide_pinterest.jpg
    instagram/
        01_bedroom_instagram.jpg
        02_living_room_instagram.jpg
        ... (same pattern)
```

---

## Key Technical Algorithms

### Perspective Transform (the core technique)

The single most important algorithm. This is how we make the poster look like
it is hanging on a wall, leaning on a desk, or being held.

```python
def find_perspective_coefficients(
    src_points: list[tuple[float, float]],   # 4 source corners
    dst_points: list[tuple[float, float]],   # 4 destination corners
) -> tuple[float, ...]:
    """
    Calculate the 8 perspective transform coefficients for PIL.

    Given 4 source points (corners of the poster) and 4 destination points
    (where they should appear in the output), solve the system:

        x' = (a*x + b*y + c) / (g*x + h*y + 1)
        y' = (d*x + e*y + f) / (g*x + h*y + 1)

    This requires solving 8 equations for 8 unknowns (a,b,c,d,e,f,g,h).

    Implementation:
        Use numpy to solve the linear system Ax = b where:
        A is an 8x8 matrix derived from the point correspondences
        b is the vector of destination coordinates
        x is the vector [a,b,c,d,e,f,g,h]

    Example for wall-mounted poster (nearly straight-on, slight angle):
        src = [(0,0), (500,0), (500,700), (0,700)]
        dst = [(10,5), (490,0), (495,700), (5,705)]  # slight trapezoid

    Example for desk-leaning (bottom wider than top):
        src = [(0,0), (500,0), (500,700), (0,700)]
        dst = [(30,0), (470,0), (510,700), (-10,700)]

    Returns:
        Tuple of 8 floats for use with Image.transform(PERSPECTIVE, coeffs).
    """
    import numpy as np

    matrix = []
    for (x, y), (X, Y) in zip(src_points, dst_points):
        matrix.append([x, y, 1, 0, 0, 0, -X*x, -X*y])
        matrix.append([0, 0, 0, x, y, 1, -Y*x, -Y*y])

    A = np.array(matrix, dtype=np.float64)
    b = np.array([coord for point in dst_points for coord in point],
                 dtype=np.float64)

    coefficients = np.linalg.solve(A, b)
    return tuple(coefficients)
```

### Procedural Room Element Drawing

Rather than requiring stock photos, we draw simplified room elements:

```python
def draw_bed_headboard(canvas: Image.Image, y_start: int) -> Image.Image:
    """
    Draw a simplified bed headboard at the bottom of the scene.

    Elements:
    - Dark wood-colored rectangle (headboard panel)
    - Lighter rectangles for pillows
    - Subtle blanket/duvet shape

    This creates the SUGGESTION of a bedroom without needing
    a photograph. The viewer's brain fills in the rest.
    """
    draw = ImageDraw.Draw(canvas)

    w = canvas.width
    # Headboard: dark rectangle
    headboard_color = "#3A2E28"  # dark wood brown
    draw.rectangle(
        [0, y_start, w, y_start + 120],
        fill=headboard_color
    )

    # Pillows: lighter rectangles
    pillow_color = "#E8E0D8"
    pillow_w = w // 3
    pillow_h = 60
    # Left pillow
    draw.rounded_rectangle(
        [w//4 - pillow_w//2, y_start + 30,
         w//4 + pillow_w//2, y_start + 30 + pillow_h],
        radius=10,
        fill=pillow_color
    )
    # Right pillow
    draw.rounded_rectangle(
        [3*w//4 - pillow_w//2, y_start + 30,
         3*w//4 + pillow_w//2, y_start + 30 + pillow_h],
        radius=10,
        fill=pillow_color
    )

    # Duvet: soft gradient below headboard
    for i in range(200):
        alpha = max(0, 255 - i * 2)
        duvet_color = (210, 200, 190, alpha)
        draw.line(
            [(0, y_start + 120 + i), (w, y_start + 120 + i)],
            fill=duvet_color[:3]
        )

    return canvas
```

### Procedural Starry Sky

```python
def generate_stars(
    canvas: Image.Image,
    num_stars: int = 200,
    seed: int = 42,
) -> Image.Image:
    """
    Add randomly scattered stars to a dark background.

    Star types:
    1. Tiny dots (80%): 1px white dots, varying opacity 30-80%
    2. Small stars (15%): 2px dots, opacity 50-90%
    3. Bright stars (5%): 3-4px with subtle glow (blurred white circle)

    Uses a fixed seed for reproducibility.
    """
    import random
    random.seed(seed)
    draw = ImageDraw.Draw(canvas)

    for i in range(num_stars):
        x = random.randint(0, canvas.width)
        y = random.randint(0, canvas.height)
        brightness = random.randint(100, 255)
        size_roll = random.random()

        if size_roll < 0.80:
            draw.point((x, y), fill=(brightness, brightness, brightness))
        elif size_roll < 0.95:
            draw.ellipse(
                [x-1, y-1, x+1, y+1],
                fill=(brightness, brightness, brightness)
            )
        else:
            # Bright star with glow
            draw.ellipse(
                [x-2, y-2, x+2, y+2],
                fill=(255, 255, 240)
            )

    return canvas
```

---

## Asset Acquisition Strategy

### Option A: Fully Procedural (Recommended -- Zero External Dependencies)

Generate ALL backgrounds and props procedurally using Pillow's drawing primitives.
This is the approach detailed above. Advantages:
- No copyright concerns
- No asset management
- Deterministic output
- Easy to tweak colors/proportions

The scenes intentionally use a "stylized/minimal" aesthetic rather than
photorealism. This actually looks MORE premium for marketing materials
(think Apple product shots -- clean, minimal, focused on the product).

### Option B: Stock Photo Hybrid (Optional Enhancement)

If photorealistic backgrounds are desired later, these free stock photo
sources can be used:

1. **Unsplash** (unsplash.com) -- Free, no attribution required
   - Search: "bedroom wall blank", "living room minimal wall"
   - Download at 1920x1280 or larger
   - Save to `assets/backgrounds/`

2. **Pexels** (pexels.com) -- Free, no attribution required
   - Search: "empty wall frame mockup", "desk workspace minimal"

3. **Pixabay** (pixabay.com) -- Free, no attribution required

For stock photos, the compositing approach changes:
1. Identify the "poster zone" in the photo (where the poster should go)
2. Define 4 corner points matching the wall/surface perspective
3. Use perspective_transform() to warp the poster to match
4. Composite using alpha blending
5. Apply color grading to match the photo's lighting

---

## Marketing Text Templates

### German (default)

```python
TEXT_DE = {
    "pinterest_pin": {
        "headline": "Personalisiertes Mond-Poster",
        "subheadline": "Die Nacht die alles veranderte",
        "price": "ab 29,99 EUR",
        "cta": "Jetzt gestalten",
        "features": [
            "Exakter Mond deines Datums",
            "Echte Sternenkarte",
            "Sofort-Download als PDF",
        ],
    },
    "instagram_post": {
        "hook": "Das perfekte Geschenk",
        "body": "Schenke den Mond einer besonderen Nacht",
        "cta": "Link in Bio",
        "hashtags": "#mondposter #geschenkidee #hochzeitsgeschenk #personalisiert",
    },
    "story_slide": {
        "headline": "Dein personalisierter Mond",
        "features": [
            "Wahle dein Datum",
            "Exakter Mond berechnet",
            "Sternenkarte inklusive",
            "Sofort als PDF",
        ],
        "cta": "Jetzt gestalten",
        "swipe_up": "Mehr erfahren",
    },
    "romantic": {
        "wedding": "Die Nacht unserer Hochzeit",
        "anniversary": "Unser besonderer Abend",
        "met": "Die Nacht als wir uns trafen",
        "born": "Die Nacht als du geboren wurdest",
    },
}
```

### English

```python
TEXT_EN = {
    "pinterest_pin": {
        "headline": "Personalized Moon Poster",
        "subheadline": "The night that changed everything",
        "price": "from $29.99",
        "cta": "Create yours now",
        "features": [
            "Exact moon phase for your date",
            "Real star map included",
            "Instant PDF download",
        ],
    },
    "instagram_post": {
        "hook": "The perfect gift",
        "body": "Give the moon from a special night",
        "cta": "Link in bio",
        "hashtags": "#moonposter #giftidea #weddinggift #personalized",
    },
    "story_slide": {
        "headline": "Your personalized moon",
        "features": [
            "Choose your date",
            "Exact moon phase calculated",
            "Star chart included",
            "Instant PDF download",
        ],
        "cta": "Create yours now",
        "swipe_up": "Learn more",
    },
    "romantic": {
        "wedding": "The night of our wedding",
        "anniversary": "Our special evening",
        "met": "The night we met",
        "born": "The night you were born",
    },
}
```

---

## Rendering Pipeline (per scene)

```
1. Load poster image (500x700 PNG)
         |
2. Apply framing (add_frame)
   - black/white/wood/gold frame
   - optional white mat border
         |
3. Generate background
   - Procedural wall/surface/gradient
   - OR load stock photo
         |
4. Perspective transform poster
   - Map poster corners to scene coordinates
   - Handles wall angle, desk lean, flat lay rotation
         |
5. Generate shadows
   - Wall shadow OR surface shadow
   - Matches the scene lighting direction
         |
6. Composite layers (back to front)
   - Background
   - Shadow layer
   - Poster (transformed)
   - Foreground props
   - Lighting overlay
   - Text overlays (social media scenes only)
   - Watermark
         |
7. Export to formats
   - Crop/fit to 1000x1500 (Pinterest)
   - Crop/fit to 1080x1080 (Instagram)
   - Save as JPEG quality 92
```

---

## Performance Expectations

- Each scene: ~0.5-2 seconds (purely CPU-bound image compositing)
- All 13 scenes, both formats: ~15-30 seconds total
- Memory: < 500MB peak (working with ~1600x1200 RGBA canvases)
- Output file sizes: ~200-400KB per JPEG at quality 92

---

## How to Get the Poster Input Image

The poster is rendered by the Next.js app as an HTML/SVG component. To get a
rasterized image for compositing, there are two approaches:

### Approach A: Browser Screenshot (Current Method)
The project already has `/poster-render` which renders the poster at 500x700px.
Use Puppeteer/Playwright to screenshot this page:

```bash
# Example with Playwright
npx playwright screenshot \
  "http://localhost:3000/poster-render?title=Die+Nacht+unserer+Hochzeit&names=Anna+%26+Max&date=2024-06-15&style=midnight" \
  poster_output.png \
  --viewport-size=500,700
```

### Approach B: Direct Rendering with Cairo/SVG
Convert the SVG component to a standalone SVG file, then rasterize with
CairoSVG or Inkscape. More complex but avoids needing a running Next.js server.

### Approach C: Pre-rendered Sample Posters
For testing, render a few sample posters and save them as PNGs. The marketing
script takes any PNG as input -- it does not need to know how the poster was made.

---

## Implementation Priority Order

Phase 1 -- Core (get images generating):
1. `config.py` + `poster_utils.py` + `export.py`
2. `backgrounds.py` (wall texture + gradient generators)
3. `shadows.py`
4. `scene_bedroom.py` (simplest mockup -- validate the pipeline)
5. `scene_living_room.py`

Phase 2 -- Expand scenes:
6. `scene_desk.py`
7. `scene_flat_lay.py`
8. `scene_gallery_wall.py`

Phase 3 -- Romantic scenes:
9. `scene_couple_stargazing.py`
10. `scene_wedding_table.py`
11. `scene_anniversary.py`
12. `scene_gift_wrap.py`
13. `scene_hands_holding.py`

Phase 4 -- Social media:
14. `text_overlays.py`
15. `social_pinterest_pin.py`
16. `social_instagram_post.py`
17. `social_story_slide.py`

Phase 5 -- Polish:
18. Color grading consistency across all scenes
19. Watermark integration
20. CLI argument handling and error reporting
21. Test with various poster styles (dark, midnight, blue)

---

## Testing

```bash
# Generate all scenes from a sample poster
python generate_marketing.py sample_poster.png

# Generate only bedroom scene for quick iteration
python generate_marketing.py sample_poster.png --scenes bedroom

# Generate only Pinterest format
python generate_marketing.py sample_poster.png --format pinterest

# Generate with English text
python generate_marketing.py sample_poster.png --text-lang en

# Generate specific social media scenes
python generate_marketing.py sample_poster.png --scenes pinterest_pin,instagram_post,story_slide
```

---

## Why This Approach (No AI)

1. **Deterministic**: Same input always produces same output. No API variability.
2. **Free**: Zero cost per image. No API credits to manage.
3. **Fast**: ~2 seconds per scene vs 30-60 seconds for AI generation.
4. **Reliable**: No API rate limits, downtime, or quota exhaustion.
5. **Controllable**: Exact control over poster placement, text, branding.
6. **Offline**: Works without internet connection.
7. **Quality**: Marketing images for platforms like Pinterest do not need
   photorealism. Clean, minimal, product-focused compositions perform better
   than busy AI-generated scenes. The poster IS the product -- everything
   else is just context.
