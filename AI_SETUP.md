# 🤖 AI Portrait Generator - Setup Guide

Generiere Simpsons, Pixar & Disney-Style Portraits mit Stable Diffusion!

## 🚀 Schnellstart (5 Minuten)

### 1. Python Backend installieren

```bash
# Terminal öffnen
cd ~/Desktop/teeinblue-clone/python-backend

# Setup-Skript ausführen
./setup.sh

# ODER manuell:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Hinweis:** Erster Install dauert 5-10 Minuten (lädt ~4GB AI-Modelle)

### 2. Backend starten

```bash
cd ~/Desktop/teeinblue-clone/python-backend
source venv/bin/activate
python sd_portrait_generator.py
```

Du siehst:
```
🎨 Stable Diffusion Portrait Generator API
============================================================
📍 Endpoints:
   POST http://localhost:5000/api/generate-portrait
   GET  http://localhost:5000/api/styles
   GET  http://localhost:5000/health
```

### 3. Frontend nutzen

Öffne im Browser:
```
http://localhost:3000/ai-generator
```

**Fertig!** 🎉

## 📖 Verwendung

### Im Browser:

1. Gehe zu http://localhost:3000/ai-generator
2. Wähle einen Stil (Simpsons, Pixar, Disney)
3. Beschreibe das gewünschte Portrait:
   - "a happy family: dad with glasses, mom with blonde hair, 2 kids"
   - "a young woman with red curly hair wearing a blue dress"
4. Klicke "Generate AI Portrait"
5. Warte 30-60 Sekunden
6. Download oder nutze das Bild!

### Via API:

```bash
curl -X POST http://localhost:5000/api/generate-portrait \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a family of 4 people in simpsons style",
    "style": "simpsons",
    "steps": 30
  }'
```

## 🎨 Verfügbare Stile

| Stil | Beschreibung | Beispiel-Prompt |
|------|-------------|-----------------|
| **simpsons** | Klassischer Simpsons-Cartoon (gelbe Haut) | "a dad with brown hair in simpsons style" |
| **pixar** | Pixar/Disney 3D Animation | "a cheerful girl with big eyes, pixar style" |
| **disney** | Klassische Disney 2D Animation | "a princess with long hair, disney cartoon" |
| **default** | Foto-realistisch | "a professional portrait of a man" |

## ⚙️ Systemanforderungen

### Minimum (funktioniert, aber langsam):
- ✅ 8GB RAM
- ✅ 10GB freier Speicher
- ✅ Jeder moderne CPU
- ⏱️ **Zeit:** 2-5 Minuten pro Bild

### Empfohlen (schnell!):
- ✅ 16GB RAM
- ✅ Apple M1/M2/M3 Mac ODER NVIDIA GPU (6GB+ VRAM)
- ⚡ **Zeit:** 20-60 Sekunden pro Bild

## 🔧 Problemlösung

### "Backend nicht erreichbar"
```bash
# Prüfe ob Backend läuft:
curl http://localhost:5000/health

# Falls nicht, starte es:
cd python-backend
source venv/bin/activate
python sd_portrait_generator.py
```

### "Out of Memory" Fehler
Reduziere Qualität in `sd_portrait_generator.py`:
```python
num_inference_steps = 20  # Statt 30
```

Oder nutze CPU statt GPU:
```python
generator = PortraitGenerator(device="cpu")
```

### Langsame Generierung
- **Erste Generation:** Normal! Modelle werden geladen
- **Dandanach immer noch langsam:**
  - Nutze GPU falls verfügbar
  - Reduziere `num_inference_steps` auf 20

### Python-Fehler beim Install
```bash
# Python 3.10+ erforderlich
python3 --version

# Falls älter, installiere Python 3.11:
brew install python@3.11
```

## 📦 Was wird installiert?

**AI-Modelle (automatisch):**
- Stable Diffusion 1.5 (~4GB)
- LoRA-Gewichte für Simpsons/Pixar (~500MB)

**Python-Pakete:**
- PyTorch (Deep Learning)
- Diffusers (Stable Diffusion)
- Transformers (Text-zu-Bild)
- Flask (API Server)

**Gesamt:** ~5-6GB

## 🌐 Integration

### React/Next.js Integration:

```typescript
const generatePortrait = async (prompt: string, style: string) => {
  const response = await fetch('http://localhost:5000/api/generate-portrait', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style }),
  });

  const data = await response.json();
  return data.image; // Base64 image
};
```

### In dein Produkt einbinden:

1. Portrait generieren
2. Als PNG exportieren
3. Im Product Designer hochladen
4. Auf T-Shirt/Poster platzieren!

## 💡 Pro-Tipps

✅ **Gute Prompts:**
- "a family of 4: bearded dad, blonde mom, teenage son, young daughter, standing together"
- "a smiling woman with curly red hair and green eyes, wearing glasses"
- "a dog and cat sitting together, friendly cartoon style"

❌ **Schlechte Prompts:**
- "family" (zu vage)
- "lots of people" (zu viele Personen = schlechtes Ergebnis)
- "super realistic photo" für Simpsons-Style (Stil-Konflikt)

## 🔒 Datenschutz

✅ **100% Lokal:** Alle Bilder werden auf deinem Computer generiert
✅ **Keine Cloud:** Keine Daten werden hochgeladen
✅ **Privat:** Nur du siehst deine Generierungen

## 📝 Nächste Schritte

1. ✅ Teste verschiedene Stile
2. ✅ Experimentiere mit Prompts
3. ✅ Integriere in deine Produkte
4. 🚀 Verkaufe personalisierte Produkte!

## 🆘 Support

Bei Problemen:
1. Prüfe [python-backend/README.md](python-backend/README.md)
2. Teste `curl http://localhost:5000/health`
3. Schaue in Terminal-Logs vom Backend

---

**Viel Spaß beim Generieren!** 🎨✨
