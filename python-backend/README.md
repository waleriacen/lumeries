# 🎨 Stable Diffusion Portrait Generator Backend

AI-powered portrait generation with Simpsons, Pixar, and Disney styles using Stable Diffusion + LoRA models.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd python-backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# Or: venv\Scripts\activate  # On Windows

# Install requirements
pip install -r requirements.txt
```

**Note:** First install will take 5-10 minutes (downloading ~4GB of AI models)

### 2. Start the Server

```bash
python sd_portrait_generator.py
```

Server will start on: **http://localhost:5000**

### 3. Test It

```bash
curl -X POST http://localhost:5000/api/generate-portrait \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a happy family of 4 people standing together",
    "style": "simpsons"
  }'
```

## 📡 API Endpoints

### `POST /api/generate-portrait`

Generate a portrait from text description.

**Request:**
```json
{
  "prompt": "a smiling woman with brown hair",
  "style": "pixar",
  "seed": 42,
  "steps": 30
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "style": "pixar"
}
```

**Styles:**
- `simpsons` - Simpsons cartoon style (yellow skin, simple lines)
- `pixar` - Pixar/Disney 3D animation style
- `disney` - Classic Disney 2D animation
- `default` - Realistic portrait

### `GET /api/styles`

Get list of available styles.

### `GET /health`

Health check endpoint.

## 🎨 Usage Examples

### Simpsons Family Portrait
```json
{
  "prompt": "a family of 4: dad, mom, boy, and girl, standing in front of their house",
  "style": "simpsons"
}
```

### Pixar Character
```json
{
  "prompt": "a cheerful young woman with red hair and green eyes, wearing a blue dress",
  "style": "pixar"
}
```

### Disney Princess Style
```json
{
  "prompt": "an elegant princess with long blonde hair in a pink gown",
  "style": "disney"
}
```

## ⚙️ Configuration

### Hardware Requirements

**Minimum:**
- CPU: Any modern CPU
- RAM: 8GB
- Disk: 10GB free

**Recommended:**
- GPU: NVIDIA GPU with 6GB+ VRAM (for fast generation)
- RAM: 16GB
- Disk: 20GB free

**Mac (Apple Silicon):**
- M1/M2/M3 Macs work great!
- Uses MPS (Metal Performance Shaders)
- ~20-40 seconds per image

### Speed Comparison

- **CPU:** 2-5 minutes per image
- **Apple Silicon (M1/M2):** 20-40 seconds
- **NVIDIA GPU (RTX 3060+):** 5-15 seconds

### Adjust Quality vs Speed

In `sd_portrait_generator.py`, adjust:

```python
num_inference_steps = 30  # Lower = faster (15-20), Higher = better quality (50+)
```

## 🔧 Troubleshooting

### "Out of Memory" Error

Reduce image size or use CPU:
```python
generator = PortraitGenerator(device="cpu")
```

### Slow Generation

- First run is slow (model download)
- Use GPU if available
- Reduce `num_inference_steps` to 20

### Import Errors

Make sure all dependencies are installed:
```bash
pip install --upgrade -r requirements.txt
```

## 📦 LoRA Models

The system uses LoRA (Low-Rank Adaptation) models for different styles:

**Simpsons Style:**
- Model: `ItsJayQz/Simpsons_Character_LoRa`
- Features: Yellow skin, simple cartoon lines

**Pixar Style:**
- Model: `artificialguybr/3DRenderStyle-SDXL-LoRA`
- Features: 3D rendered, big eyes, smooth lighting

**Disney Style:**
- Model: `artificialguybr/disney-pixar-cartoon`
- Features: Hand-drawn animation, vibrant colors

## 🌐 Integration with Next.js Frontend

The Python backend runs separately from Next.js. To connect:

1. Start Python server: `python sd_portrait_generator.py`
2. Start Next.js: `npm run dev`
3. Frontend calls `http://localhost:5000/api/generate-portrait`

Example React code:
```typescript
const generatePortrait = async () => {
  const response = await fetch('http://localhost:5000/api/generate-portrait', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'a happy family',
      style: 'simpsons',
    }),
  });
  const data = await response.json();
  // data.image contains base64 image
};
```

## 📝 License

This uses Stable Diffusion which is licensed for research and commercial use.
Check individual LoRA model licenses on Hugging Face.
