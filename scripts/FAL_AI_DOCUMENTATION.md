# fal.ai API Dokumentation fuer Poster-Mockups

## Schnellstart

### 1. API Key bekommen

1. Gehe zu **https://fal.ai**
2. Registriere dich (GitHub oder Google Login moeglich)
3. Navigiere zu **https://fal.ai/dashboard/keys**
4. Klicke auf "Create Key"
5. Kopiere den Key

**WICHTIG:** Du bekommst **$10 kostenlose Credits** beim Registrieren!

### 2. Environment Variable setzen

```bash
# In der Shell
export FAL_KEY="dein-api-key-hier"

# Oder in .env.local
FAL_KEY=dein-api-key-hier
```

### 3. Script ausfuehren

```bash
# Python Version
pip install requests
python scripts/fal-test.py

# TypeScript Version
npx ts-node scripts/fal-test.ts

# Oder mit bun
bun run scripts/fal-test.ts
```

---

## Verfuegbare img2img Modelle

### FLUX Modelle (Beste Qualitaet)

| Modell | API Endpoint | Kosten | Geschwindigkeit | Qualitaet |
|--------|-------------|--------|-----------------|-----------|
| FLUX.1 [schnell] | `fal-ai/flux/schnell` | ~$0.003 | Sehr schnell | Gut |
| FLUX.1 [dev] img2img | `fal-ai/flux/dev/image-to-image` | ~$0.025-0.05 | Langsam | Sehr gut |
| FLUX Pro Fill | `fal-ai/flux-pro/v1/fill` | ~$0.05 | Langsam | Beste |

### SDXL Modelle (Guenstiger)

| Modell | API Endpoint | Kosten | Geschwindigkeit | Qualitaet |
|--------|-------------|--------|-----------------|-----------|
| SDXL img2img | `fal-ai/fast-sdxl/image-to-image` | ~$0.01-0.02 | Mittel | Gut |
| SDXL ControlNet | `fal-ai/fast-sdxl-controlnet-canny` | ~$0.02 | Mittel | Gut |
| SDXL Inpainting | `fal-ai/fast-sdxl/inpainting` | ~$0.02 | Mittel | Gut |

### Spezialisierte Modelle

| Modell | API Endpoint | Kosten | Anwendung |
|--------|-------------|--------|-----------|
| IP-Adapter | `fal-ai/ip-adapter-face-id` | ~$0.02 | Stil-Transfer |
| RealVisXL | `fal-ai/realvisxl-v3-turbo` | ~$0.015 | Photorealismus |

---

## Kostenrechnung

Mit **$10 kostenlosen Credits** kannst du ungefaehr:

- **~3000+ FLUX Schnell** Generierungen
- **~500-1000 SDXL** Generierungen
- **~200-400 FLUX dev** Generierungen
- **~200 FLUX Pro Fill** Generierungen

### Beispiel fuer Poster-Mockup Produktion:

Angenommen du generierst 100 Mockups pro Monat:

| Modell | Kosten/Monat |
|--------|-------------|
| FLUX Schnell | ~$0.30 |
| SDXL img2img | ~$1-2 |
| FLUX dev | ~$2.50-5 |

---

## Beste Modelle fuer "Poster in Raum" Mockups

### Option 1: FLUX Fill/Inpainting (EMPFOHLEN)

**Bester Ansatz fuer professionelle Mockups!**

```python
result = fal_request(
    'https://queue.fal.run/fal-ai/flux-pro/v1/fill',
    'POST',
    {
        'image_url': room_with_empty_frame_url,  # Raum-Foto
        'mask_url': mask_url,  # Weiss = wo das Poster hin soll
        'prompt': 'moon phases astronomy poster in elegant black frame',
        'seed': 42,
    }
)
```

**Vorteile:**
- Beste Qualitaet
- Natuerliche Integration ins Bild
- Korrekte Beleuchtung und Schatten

**Nachteile:**
- Benoetigt vorbereitetes Raum-Bild mit Maske
- Teurer (~$0.05)

### Option 2: ControlNet (Struktur erhalten)

```python
result = fal_request(
    'https://queue.fal.run/fal-ai/fast-sdxl-controlnet-canny',
    'POST',
    {
        'image_url': poster_image_url,
        'prompt': 'framed poster on wall in modern living room',
        'controlnet_conditioning_scale': 0.5,  # 0.3-0.7 empfohlen
    }
)
```

**Vorteile:**
- Behaelt Poster-Struktur
- Guenstiger (~$0.02)

**Nachteile:**
- Poster-Details koennen verloren gehen
- Ergebnis weniger vorhersehbar

### Option 3: Klassisches img2img (Schnell & Einfach)

```python
result = fal_request(
    'https://queue.fal.run/fal-ai/fast-sdxl/image-to-image',
    'POST',
    {
        'image_url': poster_image_url,
        'prompt': 'elegant poster in frame on white wall, living room',
        'strength': 0.6,  # 0.5-0.7 empfohlen
    }
)
```

**Vorteile:**
- Einfachste Implementierung
- Guenstig (~$0.01-0.02)

**Nachteile:**
- Poster wird stark veraendert
- Nicht fuer Produktion geeignet

---

## Empfehlung fuer Produktion

### Der BESTE Ansatz ist ein Hybrid-Workflow:

1. **Erstelle statische Mockup-Templates**
   - Fotografiere Raeume mit leerem Bilderrahmen
   - Oder kaufe Stock-Photos von Raeumen

2. **Nutze klassisches Compositing**
   - Setze das Poster per Code in den Rahmen ein
   - Nutze perspektivische Transformation

3. **Optional: AI fuer Feinschliff**
   - FLUX Fill fuer natuerliche Schatten
   - Nur wenn noetig

### Beispiel-Workflow:

```
[Poster Image] + [Room Template]
        |
        v
  [Compositing Script]
        |
        v
  [Optional: fal.ai FLUX Fill fuer Schatten]
        |
        v
  [Fertiges Mockup]
```

---

## Alternative Mockup-Services

Falls fal.ai img2img nicht ausreicht:

| Service | Preis | Qualitaet | Anmerkung |
|---------|-------|-----------|-----------|
| **Placeit.net** | $8/Monat oder $3/Mockup | Hoch | Viele Templates |
| **Smartmockups** | $14/Monat | Hoch | Gute API |
| **Renderforest** | $9/Monat | Mittel | Einfach zu nutzen |
| **Mockup World** | Kostenlos | Variiert | Manuelle Arbeit |

---

## API Referenz

### Basis-URL
```
https://queue.fal.run/{model-id}
```

### Headers
```
Authorization: Key YOUR_FAL_KEY
Content-Type: application/json
```

### Async Queue Flow

1. **Request senden** -> Bekommt `request_id`, `status_url`, `response_url`
2. **Status pruefen** -> GET auf `status_url`
3. **Ergebnis holen** -> GET auf `response_url` wenn Status = COMPLETED

### Gemeinsame Parameter

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `prompt` | string | Text-Beschreibung des gewuenschten Ergebnisses |
| `negative_prompt` | string | Was vermieden werden soll |
| `image_url` | string | URL oder Data-URL des Input-Bildes |
| `strength` | float | 0.0-1.0, wie stark das Bild veraendert wird |
| `guidance_scale` | float | Wie streng dem Prompt gefolgt wird (7-10 typisch) |
| `num_inference_steps` | int | Anzahl der Schritte (mehr = bessere Qualitaet) |
| `seed` | int | Fuer reproduzierbare Ergebnisse |
| `sync_mode` | bool | true = warte auf Ergebnis, false = async Queue |

---

## Troubleshooting

### "Unauthorized" Error
- Pruefe ob FAL_KEY gesetzt ist
- Pruefe ob der Key korrekt ist (keine Leerzeichen)

### "Rate Limited" Error
- Warte ein paar Sekunden
- Verwende async Queue statt sync_mode

### Schlechte Qualitaet
- Erhoehe `num_inference_steps`
- Passe `strength` an (0.5-0.7 fuer img2img)
- Verbessere den Prompt

### Poster nicht erkennbar
- Reduziere `strength` (0.4-0.5)
- Verwende ControlNet statt reinem img2img
- Beschreibe das Poster im Prompt
