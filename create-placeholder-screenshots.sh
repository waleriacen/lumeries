#!/bin/bash

# Create placeholder screenshot PNGs using ImageMagick
# These serve as valid PNG files with template information

PREVIEW_DIR="/sessions/sleepy-peaceful-franklin/mnt/poster/public/mockups/templates/previews"

# Create directory if it doesn't exist
mkdir -p "$PREVIEW_DIR"

echo "Creating placeholder screenshot PNGs (1080x1080)..."
echo ""

# Define templates with their associated colors (based on their themes)
declare -A templates=(
  ["template-rosa-gold.html"]="linear-gradient(135deg, #4a2c3e, #b8986c)"
  ["template-beton-silber.html"]="linear-gradient(135deg, #4a4a4a, #c0c0c0)"
  ["template-botanical.html"]="linear-gradient(135deg, #2d5016, #d4af6a)"
  ["template-marmor-gold.html"]="linear-gradient(135deg, #e8e8e8, #d4af6a)"
  ["template-ziegel-minimal.html"]="linear-gradient(135deg, #8b4513, #f5deb3)"
  ["template-midnight-stars.html"]="linear-gradient(135deg, #0a0e27, #1a3a5c)"
  ["template-terracotta-boho.html"]="linear-gradient(135deg, #b8654a, #f4a460)"
  ["template-sage-gold.html"]="linear-gradient(135deg, #6b8e23, #d4af6a)"
  ["template-lavendel-romantic.html"]="linear-gradient(135deg, #b19cd9, #e6b0aa)"
  ["template-showcase-triple.html"]="linear-gradient(135deg, #333333, #666666)"
)

# Simple color palette without gradients (ImageMagick syntax)
declare -A colors=(
  ["template-rosa-gold.html"]="xc:rgb(74,44,62)"
  ["template-beton-silber.html"]="xc:rgb(74,74,74)"
  ["template-botanical.html"]="xc:rgb(45,80,22)"
  ["template-marmor-gold.html"]="xc:rgb(232,232,232)"
  ["template-ziegel-minimal.html"]="xc:rgb(139,69,19)"
  ["template-midnight-stars.html"]="xc:rgb(10,14,39)"
  ["template-terracotta-boho.html"]="xc:rgb(184,101,74)"
  ["template-sage-gold.html"]="xc:rgb(107,142,35)"
  ["template-lavendel-romantic.html"]="xc:rgb(177,156,217)"
  ["template-showcase-triple.html"]="xc:rgb(51,51,51)"
)

for template in "${!templates[@]}"; do
  filename="${template%.html}.png"
  filepath="$PREVIEW_DIR/$filename"
  color="${colors[$template]}"

  echo -n "Creating: $filename ... "

  # Create a 1080x1080 image with the theme color
  # Add a label with the template name
  convert -size 1080x1080 "$color" \
    -fill white -gravity center \
    -pointsize 36 -font Arial \
    -annotate 0 "${template%.html}" \
    -pointsize 24 -gravity south \
    -annotate 0 "1080x1080px Preview\nClick to view in browser" \
    "$filepath" 2>&1 | grep -i error && echo "ERROR" || echo "OK (${filepath})"
done

echo ""
echo "Done! All placeholder PNGs created."
echo "Directory: $PREVIEW_DIR"
ls -lh "$PREVIEW_DIR"/*.png 2>/dev/null | wc -l && echo "files created"
