# Lumeries Poster Mockup Templates

Beautiful, professional HTML mockup templates for showcasing posters on Etsy-style listings. All templates are 1080x1080px (Instagram square format) and use pure CSS/SVG decorations.

## Templates Created

### 1. **template-midnight-stars.html** - "Mitternachtsblau + Sterne"
- **Style**: Celestial/Mystical
- **Features**:
  - Deep midnight blue to navy gradient background
  - Animated star field (150 stars, varied sizes and colors)
  - Subtle nebula glow behind poster
  - Crescent moon SVG (gold) with floating animation
  - Constellation line patterns
  - Thin silver frame around poster with corner accents
  - Stars with twinkling animations
- **Best For**: Moon maps, star charts, celestial art, horoscopes

### 2. **template-terracotta-boho.html** - "Terracotta + Boho Trockenblumen"
- **Style**: Bohemian/Desert
- **Features**:
  - Warm terracotta/burnt orange textured background
  - Pampas grass SVG decorations in three corners (cream/beige)
  - Arch-shaped frame around poster (boho aesthetic)
  - Sun/rainbow accent circles with gradient
  - Small dot accents scattered
  - Gentle swaying animation for plants
  - Earth-tone palette: terracotta, cream, tan, dusty pink
- **Best For**: Boho art, dried flowers, nature themes, bohemian lifestyle

### 3. **template-sage-gold.html** - "Salbeigrün + Goldrahmen"
- **Style**: Elegant/Organic
- **Features**:
  - Muted sage green background with subtle texture
  - Ornate gold rectangular frame (3px border with glow effect)
  - Decorative circular corner ornaments (gold)
  - Gold leaf/olive branch accents on left and right sides
  - Scattered gold confetti dots (varied sizes)
  - Pulsing glow animation on frame
  - Elegant yet organic feel
- **Best For**: Wedding posters, botanical art, nature themes, elegant designs

### 4. **template-lavendel-romantic.html** - "Lavendel + Schmetterling Romantik"
- **Style**: Romantic/Dreamy
- **Features**:
  - Soft lavender gradient background with subtle radial texture
  - Five animated butterflies (various sizes) in shades of lavender and mauve
  - Ornamental rounded frame with soft border
  - Delicate floral line-art accents in four corners
  - Sparkle/glitter dots (6 dots with twinkling animations)
  - Smooth flutter animations for butterflies
  - Romantic, feminine, and dreamy aesthetic
- **Best For**: Valentine's Day, anniversaries, romantic art, wedding invitations, feminine designs

### 5. **template-showcase-triple.html** - "Split-Screen 3 Produkte Showcase"
- **Style**: Professional/Catalog
- **Features**:
  - Dark elegant background (near-black with gradient)
  - THREE poster slots: two side ones (220x320px) + one featured center (280x400px)
  - "LUMERIES" brand title at top (elegant serif, gold, letter-spaced)
  - Gold borders on all poster slots
  - Gold divider lines separating the sections
  - Price badges below each poster (customizable text)
  - Call-to-action section at bottom with "Discover the Collection" heading
  - "Shop Now" button
  - Subtle animations: center poster lifts gently, borders have glow effect
  - Professional shop/catalog appearance
- **Best For**: Product catalogs, multi-product showcases, shop displays, promotional content

## Technical Specifications

### File Structure
All templates follow this structure:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Pure CSS styling */
    body { width: 1080px; height: 1080px; overflow: hidden; }
    .poster-slot { /* Centered, ~50-60% of canvas */ }
    .poster-slot img { width: 100%; height: 100%; object-fit: cover; }
  </style>
</head>
<body>
  <div class="canvas">
    <!-- Decorative layers + poster slot -->
  </div>
  <script>
    const POSTER_URL = ''; // Set poster image URL here
  </script>
</body>
</html>
```

### Design Features
- **Pure CSS/SVG**: No external images - all decorations are CSS gradients, borders, and inline SVGs
- **Responsive Decorations**: Using CSS filters, blend modes, and animations
- **Poster Slot**: `.poster-slot` div (or `.poster-slot-1/2/3` for triple template) centered with flexible sizing
- **Image Support**: Images load via `src` attribute, with `display: none` until loaded
- **Animations**: Subtle CSS animations using `@keyframes` for professional movement
- **Accessibility**: Proper semantic HTML with alt text on images

### Customization
Each template includes a `POSTER_URL` variable in the script section. Set this to your poster image URL:
```javascript
const POSTER_URL = 'https://your-image-url.jpg';
```

For the triple showcase template, customize:
```javascript
const POSTER_URLS = {
  left: 'url1',
  center: 'url2',
  right: 'url3'
};

const PRICES = {
  left: '$24.99',
  center: '$29.99',
  right: '$24.99'
};
```

## Usage with Puppeteer

These templates are designed to be screenshotted with Puppeteer:

```javascript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080 });
await page.goto('file:///path/to/template.html');
await page.screenshot({ path: 'mockup.png' });
```

## Design Philosophy

These templates combine:
- **Professional Aesthetics**: Inspired by successful Etsy listings and Canva templates
- **Premium Feel**: Using gold accents, subtle gradients, and animations
- **Brand Consistency**: All templates work beautifully with the "Lumeries" brand
- **Versatility**: Five distinct styles cover romance, nature, elegance, mystique, and professional showcase
- **Performance**: Pure CSS/SVG means fast loading and no image dependencies

## Directory
```
/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates/
├── template-midnight-stars.html
├── template-terracotta-boho.html
├── template-sage-gold.html
├── template-lavendel-romantic.html
├── template-showcase-triple.html
└── README.md (this file)
```

---

Created: February 6, 2026
Brand: Lumeries Poster E-commerce
Format: 1080x1080px (Instagram Square)
