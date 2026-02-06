# Lumeries Mockup Templates - Usage Guide

## Quick Start

### 1. Loading a Poster Image

Each template has a simple script variable to set your poster URL:

```javascript
const POSTER_URL = 'https://example.com/poster.jpg';
```

When the page loads, the script will automatically display the image in the `.poster-slot` div.

### 2. Triple Showcase Template

The `template-showcase-triple.html` has three poster slots and is configured differently:

```javascript
const POSTER_URLS = {
  left: 'https://example.com/poster1.jpg',
  center: 'https://example.com/poster2.jpg',
  right: 'https://example.com/poster3.jpg'
};

const PRICES = {
  left: '$24.99',
  center: '$29.99',
  right: '$24.99'
};
```

The script updates the price badges automatically. You can also customize the CTA button action.

## Template Dimensions

All single-poster templates:
- **Canvas**: 1080x1080px
- **Poster Slot**: 540x720px (centered)
- **Vertical Orientation**: Optimized for portrait poster layouts

Triple Showcase template:
- **Canvas**: 1080x1080px
- **Left Poster**: 220x320px
- **Center Poster**: 280x400px (featured)
- **Right Poster**: 220x320px

## CSS Customization

### Changing Colors

**Midnight Stars** - Update the gradient in `.canvas`:
```css
.canvas {
  background: linear-gradient(135deg, #0a0e27 0%, #1a2847 50%, #0d1828 100%);
}
```

**Terracotta Boho** - Update earth tones:
```css
.canvas {
  background: linear-gradient(135deg, #a0613e 0%, #c8875f 50%, #9d5e3a 100%);
}
```

**Sage Gold** - Update sage green and gold:
```css
.gold-frame {
  border: 4px solid #d4af37; /* Gold color */
}
.canvas {
  background: linear-gradient(135deg, #7a8a70 0%, #9baa8f 50%, #708560 100%);
}
```

**Lavendel Romantic** - Update lavender palette:
```css
.canvas {
  background: linear-gradient(135deg, #e6d9f0 0%, #d8c4e8 50%, #dccfea 100%);
}
.butterfly {
  fill: #d4a5d4; /* Butterfly color */
}
```

**Showcase Triple** - Update brand colors:
```css
.brand-title,
.cta-button {
  color: #d4af37; /* Gold */
}
```

### Adjusting Animations

All templates use CSS animations. To slow down or speed up, modify the duration:

```css
/* Star twinkling - currently 3s, make it slower with 6s */
.star.anim-fast {
  animation: twinkle 6s infinite;
}

/* Butterfly flutter - currently 4s to 6s, adjust as needed */
.butterfly.b1 {
  animation: flutter 8s ease-in-out infinite;
}
```

To disable animations entirely, remove the `animation` property or set `animation: none;`

## SVG Elements

All decorative elements are inline SVGs, making them easy to customize:

**Star (Midnight Stars)**:
```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#ffd700"/>
</svg>
```

**Pampas Grass (Terracotta Boho)**:
```html
<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50 140 Q 50 100 52 30" stroke="#e8d4b8" stroke-width="2"/>
  <circle cx="52" cy="30" r="13" fill="#e8d4b8" opacity="0.6"/>
</svg>
```

**Butterfly (Lavendel Romantic)**:
```html
<ellipse cx="35" cy="40" rx="20" ry="28" fill="#d4a5d4"/>
<ellipse cx="50" cy="50" rx="8" ry="35" fill="#b08ab0"/>
```

## Advanced Customization

### Adding More Elements

To add more stars, plants, or butterflies:

1. **JavaScript-generated** (Midnight Stars):
```javascript
function generateStars() {
  const starCount = 150; // Increase this number
  // ... rest of generation code
}
```

2. **Hardcoded SVG** (Boho, Gold, Romantic):
Copy-paste the SVG element and adjust positioning:
```html
<svg class="plant top-left" style="...">
  <!-- Copy and modify -->
</svg>
```

### Changing Frame Styles

**Arch Frame** (Boho):
```css
.arch-frame {
  border-radius: 60px; /* Increase for more rounded, decrease for sharp */
}
```

**Gold Frame** (Sage Gold):
```css
.gold-frame {
  border: 4px solid #d4af37;
  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.3);
}
```

**Rounded Frame** (Romantic):
```css
.romantic-frame {
  border-radius: 50px; /* Adjust roundness */
  border: 3px solid rgba(200, 160, 220, 0.6);
}
```

### Opacity and Transparency

Adjust element visibility by changing `opacity` values (0-1):

```css
.star { opacity: 0.6; } /* 60% visible */
.butterfly { opacity: 0.7; } /* 70% visible */
.plant { opacity: 0.7; } /* 70% visible */
```

## Puppeteer Integration

### Basic Screenshot

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  
  // Set poster URL before screenshot
  await page.goto('file:///path/to/template-midnight-stars.html');
  
  // Wait for image to load
  await page.waitForSelector('.poster-slot img[src]');
  
  // Take screenshot
  await page.screenshot({ path: 'mockup.png' });
  
  await browser.close();
})();
```

### With Dynamic Image Loading

```javascript
await page.goto(`file:///path/to/template.html?posterUrl=${encodeURIComponent(posterUrl)}`);

// In the HTML template:
const params = new URLSearchParams(window.location.search);
const POSTER_URL = params.get('posterUrl') || '';
```

### Batch Processing

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
  await page.screenshot({ path: `mockups/${template.replace('.html', '.png')}` });
  await page.close();
}
```

## Browser Compatibility

- **Chrome/Chromium**: Full support ✓
- **Firefox**: Full support ✓
- **Safari**: Full support ✓
- **Edge**: Full support ✓

All templates use standard CSS (flexbox, grid, gradients) and SVG that work across all modern browsers.

## Performance Notes

- **File Sizes**: 250-450 lines of code each
- **Load Time**: <500ms (no external dependencies)
- **Rendering**: Instant (pure CSS/SVG)
- **Animations**: GPU-accelerated (smooth 60fps)

## Troubleshooting

### Poster not showing?
1. Verify the `POSTER_URL` is set correctly
2. Check that the image file exists
3. Check browser console for errors
4. Ensure CORS is not blocking the image

### Animations look choppy?
1. Verify hardware acceleration is enabled in browser
2. Try reducing the number of animated elements
3. Increase animation duration (slower = smoother perception)

### Colors don't look right?
1. Check color code format (#RRGGBB)
2. Verify opacity/alpha values (0-1 range)
3. Test in multiple browsers (color space differences)

### Text not displaying?
1. Verify font-family fallbacks
2. Check letter-spacing isn't too large
3. Ensure text color contrasts with background

---

For more information, see README.md
