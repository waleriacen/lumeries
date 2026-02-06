#!/bin/bash
# Setup script for Stable Diffusion Portrait Generator

echo "🎨 Setting up Stable Diffusion Portrait Generator"
echo "=================================================="
echo ""

# Check Python version
echo "📍 Checking Python version..."
python3 --version

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo ""
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo ""
echo "📦 Installing Python dependencies..."
echo "⚠️  This will take 5-10 minutes (downloading AI models ~4GB)"
echo ""
pip install -r requirements.txt

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo "=================================================="
echo ""
echo "To start the server:"
echo "  1. source venv/bin/activate"
echo "  2. python sd_portrait_generator.py"
echo ""
echo "Server will run on: http://localhost:5000"
echo ""
