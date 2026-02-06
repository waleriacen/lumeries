#!/bin/bash

# Template Screenshot Capture Script
# This script demonstrates the setup for capturing template screenshots

TEMPLATE_DIR="/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates"
PREVIEW_DIR="${TEMPLATE_DIR}/previews"
SCRIPT_DIR="/sessions/sleepy-peaceful-franklin/mnt/poster"

# Create previews directory
mkdir -p "$PREVIEW_DIR"

echo "Template Screenshot Capture"
echo "============================"
echo ""
echo "Template Directory: $TEMPLATE_DIR"
echo "Preview Directory: $PREVIEW_DIR"
echo ""

# Array of templates
templates=(
  "template-rosa-gold.html"
  "template-beton-silber.html"
  "template-botanical.html"
  "template-marmor-gold.html"
  "template-ziegel-minimal.html"
  "template-midnight-stars.html"
  "template-terracotta-boho.html"
  "template-sage-gold.html"
  "template-lavendel-romantic.html"
  "template-showcase-triple.html"
)

echo "Analyzing ${#templates[@]} templates..."
echo ""

for template in "${templates[@]}"; do
  filepath="$TEMPLATE_DIR/$template"

  if [ ! -f "$filepath" ]; then
    echo "⚠️  SKIP: $template - file not found"
    continue
  fi

  # Get file size
  size=$(ls -lh "$filepath" | awk '{print $5}')

  # Check for specific content
  has_svg="No"
  has_canvas="No"
  has_svg_content=$(grep -c "<svg" "$filepath" 2>/dev/null || echo 0)
  has_canvas_content=$(grep -c "<canvas" "$filepath" 2>/dev/null || echo 0)

  [ "$has_svg_content" -gt 0 ] && has_svg="Yes"
  [ "$has_canvas_content" -gt 0 ] && has_canvas="Yes"

  echo "✓ $template"
  echo "  Size: $size"
  echo "  Contains SVG: $has_svg"
  echo "  Contains Canvas: $has_canvas"
  echo ""
done

echo "Next Steps for Screenshot Capture:"
echo "===================================="
echo ""
echo "Option 1: Using Playwright (Recommended)"
echo "  $ npx playwright install chromium"
echo "  $ node capture-with-playwright.js"
echo ""
echo "Option 2: Using Puppeteer"
echo "  $ npm install puppeteer"
echo "  $ node capture-with-puppeteer.js"
echo ""
echo "Option 3: Using Chrome/Chromium directly"
echo "  $ google-chrome --headless --screenshot --window-size=1080,1080 file://$(template path)"
echo ""
echo "Option 4: View in Web Browser"
echo "  $ node serve-templates.js"
echo "  Then visit: http://localhost:8765"
echo "  Use browser's built-in screenshot tools"
