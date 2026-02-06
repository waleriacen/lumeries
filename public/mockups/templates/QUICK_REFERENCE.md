# Quick Reference - Lumeries Templates

## File Locations
```
/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates/
├── template-midnight-stars.html
├── template-terracotta-boho.html
├── template-sage-gold.html
├── template-lavendel-romantic.html
├── template-showcase-triple.html
├── README.md
├── USAGE_GUIDE.md
└── QUICK_REFERENCE.md
```

## Template Overview

| Name | File | Style | Best For | Poster Size |
|------|------|-------|----------|-------------|
| Midnight Stars | `template-midnight-stars.html` | Celestial | Moon maps, astrology | 540x720 |
| Terracotta Boho | `template-terracotta-boho.html` | Bohemian | Boho art, nature | 540x720 |
| Sage Gold | `template-sage-gold.html` | Elegant | Weddings, botanical | 540x720 |
| Lavendel Romantic | `template-lavendel-romantic.html` | Romantic | Valentine's, weddings | 540x720 |
| Showcase Triple | `template-showcase-triple.html` | Professional | Product catalogs | 220x320 + 280x400 |

## Setting Poster Image

### Single Poster Templates
```javascript
// Edit the POSTER_URL variable in the script section
const POSTER_URL = 'https://your-image-url.jpg';
```

### Triple Showcase Template
```javascript
const POSTER_URLS = {
  left: 'https://your-image-url-1.jpg',
  center: 'https://your-image-url-2.jpg',
  right: 'https://your-image-url-3.jpg'
};

const PRICES = {
  left: '$24.99',
  center: '$29.99',
  right: '$24.99'
};
```

## Key CSS Classes

### All Templates
- `.canvas` - Main container (1080x1080px)
- `.poster-slot` - Poster image container (single templates)
- `.texture-overlay` - Subtle background texture

### Midnight Stars
- `.star-field` - Container for stars
- `.star` - Individual star element
- `.moon` - Crescent moon element
- `.nebula` - Soft glow behind poster
- `.constellations` - SVG constellation lines

### Terracotta Boho
- `.plant` - Pampas grass decorations
- `.arch-frame` - Rounded frame around poster
- `.sun-accent` - Rainbow circles
- `.dot-accent` - Small decorative dots

### Sage Gold
- `.gold-frame` - Main ornate frame
- `.corner-ornament` - Decorative corner elements
- `.leaf-accent` - Olive branch decorations
- `.confetti` - Gold dot accents

### Lavendel Romantic
- `.butterfly` - Animated butterfly elements
- `.romantic-frame` - Rounded frame
- `.flower-accent` - Floral line-art
- `.sparkle` - Glitter/sparkle dots

### Showcase Triple
- `.brand-title` - "LUMERIES" text at top
- `.poster-slot-1/2/3` - Three poster containers
- `.divider-line` - Gold separator lines
- `.price-badge` - Price tags below posters
- `.cta-section` - Call-to-action area

## Color Palettes

### Midnight Stars
- Primary: `#0a0e27` (midnight blue)
- Secondary: `#1a2847` (navy)
- Accent: `#ffd700` (gold)

### Terracotta Boho
- Primary: `#a0613e` (terracotta)
- Secondary: `#c8875f` (warm orange)
- Plants: `#e8d4b8` (cream)
- Frame: `#d4a373` (tan)

### Sage Gold
- Primary: `#7a8a70` (sage green)
- Secondary: `#9baa8f` (light sage)
- Frame: `#d4af37` (gold)

### Lavendel Romantic
- Primary: `#e6d9f0` (light lavender)
- Secondary: `#d8c4e8` (soft lavender)
- Butterflies: `#d4a5d4`, `#f0d9f0` (mauve shades)
- Flowers: `#c68ac8` (dark lavender)

### Showcase Triple
- Primary: `#0f0f0f` (near-black)
- Accent: `#d4af37` (gold)

## Animation Timing

### Midnight Stars
- Stars twinkle: 3s (fast) / 6s (slow)
- Moon float: 4s
- Nebula glow: static

### Terracotta Boho
- Plant sway: 6s
- Sun float: 5s

### Sage Gold
- Frame glow pulse: 5s
- Confetti fade: 4s

### Lavendel Romantic
- Butterfly flutter: 4s, 4.5s, 5s, 5s, 6s (staggered)
- Sparkle twinkle: 2s, 2.2s, 2.5s, 2.7s (varied)

### Showcase Triple
- Center poster lift: 4s
- Border glow: 4s

## Customization Quick Tips

### Change Background Color
```css
.canvas {
  background: linear-gradient(135deg, #color1 0%, #color2 50%, #color3 100%);
}
```

### Change Frame Border Color
```css
.arch-frame { border-color: #new-color; }
.gold-frame { border-color: #new-color; }
.romantic-frame { border-color: #new-color; }
```

### Speed Up/Slow Down Animations
```css
/* Original: animation: float 4s ease-in-out infinite; */
/* Faster: change 4s to 2s */
/* Slower: change 4s to 6s */
.moon { animation: float 2s ease-in-out infinite; }
```

### Disable Animations
```css
.moon { animation: none; }
.star { animation: none; }
.butterfly { animation: none; }
```

### Change Opacity
```css
.star { opacity: 0.8; } /* More visible */
.plant { opacity: 0.5; } /* More transparent */
```

## Puppeteer Usage

### Basic Script
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.goto('file:///path/to/template.html');
  await page.screenshot({ path: 'mockup.png' });
  await browser.close();
})();
```

### With Poster URL
```javascript
await page.evaluate(() => {
  window.POSTER_URL = 'https://example.com/poster.jpg';
});
await page.waitForTimeout(500); // Wait for render
await page.screenshot({ path: 'mockup.png' });
```

### Batch Process All Templates
```javascript
const templates = [
  'template-midnight-stars.html',
  'template-terracotta-boho.html',
  'template-sage-gold.html',
  'template-lavendel-romantic.html',
  'template-showcase-triple.html'
];

for (const template of templates) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.goto(`file:///path/to/${template}`);
  const name = template.replace('.html', '.png');
  await page.screenshot({ path: `output/${name}` });
  await page.close();
}
```

## Poster Slot Positioning

### Single Templates (Centered)
```css
.poster-slot {
  position: absolute;
  width: 540px;
  height: 720px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### Triple Template (Multiple)
```css
.poster-slot-1 { width: 220px; height: 320px; }
.poster-slot-2 { width: 280px; height: 400px; } /* Center, larger */
.poster-slot-3 { width: 220px; height: 320px; }
```

## Browser DevTools Tips

1. **Open in Chrome**: Right-click > Inspect Element
2. **Device Emulation**: Press `Ctrl+Shift+M` for mobile view
3. **Edit Live CSS**: Click on any rule in Styles panel
4. **Test Animations**: Pause/step through in Animations panel
5. **Performance**: Use Lighthouse for performance audit

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Image not showing | Check POSTER_URL value and file path |
| Animations choppy | Reduce number of animated elements or use longer duration |
| Colors look off | Test in different browsers (color space differences) |
| Text overflowing | Reduce font-size or letter-spacing |
| Frame looks pixelated | Ensure viewport is exactly 1080x1080px |

## Feature Checklist

Template features matrix:

| Feature | Midnight Stars | Boho | Sage Gold | Romantic | Triple |
|---------|---|---|---|---|---|
| Animated background | ✓ | ✓ | ✗ | ✓ | ✗ |
| Gold accents | ✓ | ✓ | ✓ | ✗ | ✓ |
| SVG decorations | ✓ | ✓ | ✓ | ✓ | ✗ |
| Multiple poster slots | ✗ | ✗ | ✗ | ✗ | ✓ |
| Price badges | ✗ | ✗ | ✗ | ✗ | ✓ |
| CTA button | ✗ | ✗ | ✗ | ✗ | ✓ |
| Text elements | ✗ | ✗ | ✗ | ✗ | ✓ |

## Further Documentation

- **README.md** - Complete feature overview
- **USAGE_GUIDE.md** - Detailed customization guide
- **TEMPLATES_SUMMARY.txt** - Full specification document

---

Last updated: February 6, 2026
