# Lumeries System Dokumentation

> **Letzte Aktualisierung:** 22. Januar 2026
> **Status:** Produktiv auf lumeries.com (Vercel)

---

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Tech Stack](#tech-stack)
3. [Externe Services & API Keys](#externe-services--api-keys)
4. [API Routes](#api-routes)
5. [Seiten & Funktionen](#seiten--funktionen)
6. [Komponenten](#komponenten)
7. [Datenbank Schema (Supabase)](#datenbank-schema-supabase)
8. [Flows & Prozesse](#flows--prozesse)
9. [Bekannte Probleme & Lösungen](#bekannte-probleme--lösungen)
10. [Offene TODOs](#offene-todos)

---

## Übersicht

**Lumeries** ist eine automatisierte E-Commerce-Plattform für personalisierte Poster:
- **Hauptprodukt:** Kostenloses Mondphasen-Poster (Lead Magnet)
- **Premium:** Sternenkarten, Spotify-Poster, Koordinaten-Poster
- **Zielgruppe:** Paare (Hochzeit, Jahrestag, Geburtstag)

**Live URL:** https://lumeries.com (mit www Redirect)

---

## Tech Stack

| Kategorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 16.1.1 |
| Frontend | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Sprache | TypeScript | 5.x |
| Hosting | Vercel | - |
| Datenbank | Supabase (PostgreSQL) | - |
| Zahlungen | Stripe | - |
| E-Mail | Brevo (Sendinblue) | - |
| PDF | pdf-lib | 1.17.1 |
| Screenshots | Puppeteer + Chromium | 24.x |
| Astronomie | SunCalc | 1.9.0 |

---

## Externe Services & API Keys

### Supabase
- **URL:** `https://txfqrfjxvdlifjnawuvl.supabase.co`
- **Env Vars:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Status:** ✅ Funktioniert

### Stripe
- **Mode:** Live (Produktion)
- **Env Vars:**
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
  - `STRIPE_SECRET_KEY` (sk_live_...)
  - `STRIPE_WEBHOOK_SECRET` (whsec_...)
- **Webhook URL:** `https://lumeries.com/api/stripe/webhook`
- **Status:** ✅ Funktioniert

### Brevo (E-Mail)
- **Env Var:** `BREVO_API_KEY`
- **Verwendet für:**
  - Transaktionale E-Mails (Poster-Download)
  - Kontakt-Management (Leads in Liste)
- **Status:** ✅ Funktioniert

### Pinterest API
- **App ID:** 1543649
- **Env Vars:**
  - `PINTEREST_APP_ID`
  - `PINTEREST_APP_SECRET`
- **Redirect URI:** `https://lumeries.com/api/auth/pinterest/callback`
- **Access Level:** Trial (nur eigener Account testbar)
- **Status:** ⚠️ Trial Access - Standard Access beantragt (abgelehnt, Demo-Video erforderlich)

### Telegram (Support)
- **Env Vars:**
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
- **Verwendet für:** Chat-Benachrichtigungen an Admin
- **Status:** ✅ Funktioniert

### Nominatim (OpenStreetMap)
- **Keine API Key erforderlich**
- **Verwendet für:** Ortssuche & Koordinaten
- **Status:** ✅ Funktioniert

---

## API Routes

### Lead Generation & E-Mail

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/freebie-signup` | POST | Speichert Lead in Supabase, sendet E-Mail mit Download-Link | ✅ |
| `/api/free-poster` | POST | Alternative für Sternenkarten-Freebie | ✅ |

### Zahlungen

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/create-checkout` | POST | Erstellt Stripe Checkout Session | ✅ |
| `/api/stripe/webhook` | POST | Verarbeitet Stripe Events, speichert Order, sendet E-Mail | ✅ |

### Poster Generierung

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/generate-moon-pdf` | GET | Generiert hochauflösendes PDF (A4, A3, A2, etc.) | ✅ |
| `/api/generate-moon-image` | GET | Generiert SVG für Sternenkarten | ✅ |
| `/api/screenshot-poster` | GET | Puppeteer Screenshot für PNG Export | ✅ |
| `/api/generate-pdf` | GET | Legacy PDF Route | ✅ |

### Pinterest Integration

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/auth/pinterest` | GET | Startet OAuth Flow | ✅ |
| `/api/auth/pinterest/callback` | GET | OAuth Callback, Token Exchange | ✅ |
| `/api/pinterest/boards` | GET | Holt User Boards | ✅ |
| `/api/pinterest/create-pin` | POST | Erstellt Pin auf Board | ✅ |
| `/api/pinterest-icon` | GET | Generiert Pinterest Icon (400x400) | ✅ |

### Chat & Support

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/chat` | GET/POST | Live Chat Sessions & Messages | ✅ |
| `/api/admin/chat` | GET/POST | Admin Panel für Support | ✅ |
| `/api/support-chat` | POST | Einfaches Kontaktformular | ✅ |

### Sonstiges

| Route | Methode | Funktion | Status |
|-------|---------|----------|--------|
| `/api/transform-cartoon` | POST | Replicate AI Cartoon-Transformation | ✅ |
| `/googlef6057af554849a4b.html` | GET | Google Search Console Verifizierung | ✅ |

---

## Seiten & Funktionen

### Hauptseiten

| Pfad | Funktion | Sprachen |
|------|----------|----------|
| `/` | Homepage mit Mondposter-Generator, Live-Notifications, Pinterest-Button | DE, EN, FR, ES |
| `/free-moon-poster` | Redirect zu `/` | - |
| `/download` | Format-Auswahl & PNG Download | DE, EN, FR, ES |
| `/success` | Zahlungsbestätigung | DE, EN, FR, ES |
| `/privacy` | Datenschutzerklärung | DE |

### Shop Seiten

| Pfad | Funktion | Status |
|------|----------|--------|
| `/custom-posters` | Premium Poster Shop | ✅ |
| `/moon-poster` | Mondposter Builder | ✅ |
| `/wedding-printables` | Hochzeits-Poster | ✅ |
| `/family-portrait` | Familien-Portrait | ✅ |
| `/cartoon-transform` | Foto zu Cartoon | ✅ |
| `/ideas` | Inspiration/Galerie | ✅ |

### Admin & Debug

| Pfad | Funktion |
|------|----------|
| `/admin/chat` | Support Dashboard |
| `/moon-test` | Debug für Mondphasen |
| `/poster-render` | Isoliertes Poster Rendering |

---

## Komponenten

### Core Poster

| Komponente | Datei | Funktion |
|------------|-------|----------|
| MoonPoster | `components/MoonPoster.tsx` | Rendert Mondposter mit SunCalc |
| PosterCanvas | `components/PosterCanvas.tsx` | Fabric.js Canvas |
| PremiumStarMap | `components/PremiumStarMap.tsx` | Sternenkarte |
| CelestialBackground | `components/CelestialBackground.tsx` | Sternenhimmel Hintergrund |

### UI Komponenten

| Komponente | Datei | Funktion |
|------------|-------|----------|
| PinterestConnect | `components/PinterestConnect.tsx` | OAuth Button + Pin Creator |
| ChatWidget | `components/ChatWidget.tsx` | Floating Support Chat |
| CustomPosterShop | `components/CustomPosterShop.tsx` | Shop Interface |

---

## Datenbank Schema (Supabase)

### Tabelle: `leads`
```sql
id              UUID PRIMARY KEY
email           TEXT NOT NULL
first_name      TEXT
poster_type     TEXT DEFAULT 'moon'
customization   JSONB
download_count  INTEGER DEFAULT 0
created_at      TIMESTAMP DEFAULT NOW()
```

### Tabelle: `orders`
```sql
id                  UUID PRIMARY KEY
email               TEXT NOT NULL
stripe_payment_id   TEXT
product_name        TEXT
amount              INTEGER
customization_data  JSONB
created_at          TIMESTAMP DEFAULT NOW()
```

### Tabelle: `chat_sessions`
```sql
id              UUID PRIMARY KEY
email           TEXT
language        TEXT DEFAULT 'de'
is_online       BOOLEAN DEFAULT TRUE
is_archived     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
last_activity   TIMESTAMP DEFAULT NOW()
```

### Tabelle: `chat_messages`
```sql
id          UUID PRIMARY KEY
session_id  UUID REFERENCES chat_sessions(id)
content     TEXT
sender      TEXT ('user' oder 'admin')
created_at  TIMESTAMP DEFAULT NOW()
```

### Tabelle: `analytics_events`
```sql
id              UUID PRIMARY KEY
event_type      TEXT
user_identifier TEXT
metadata        JSONB
created_at      TIMESTAMP DEFAULT NOW()
```

---

## Flows & Prozesse

### 1. Lead Magnet Flow (Kostenlos Poster)

```
User öffnet lumeries.com
    ↓
Passt Poster an (Datum, Namen, Ort, Tagline)
    ↓
Gibt E-Mail + Vorname ein
    ↓
Klickt "Kostenloses Poster erhalten"
    ↓
POST /api/freebie-signup
    ├── Speichert in Supabase `leads`
    ├── Erstellt/Updated Brevo Kontakt
    └── Sendet E-Mail mit Download-Link
    ↓
Redirect zu /download?token=xxx
    ↓
Client generiert PNG (html2canvas)
    ↓
User lädt Poster herunter
```

### 2. Pinterest OAuth Flow

```
User klickt "Mit Pinterest verbinden"
    ↓
GET /api/auth/pinterest
    → Redirect zu pinterest.com/oauth
    ↓
User autorisiert App
    ↓
Pinterest redirected zu /api/auth/pinterest/callback?code=xxx
    ├── Exchange code → access_token
    ├── Fetch user info
    └── Redirect zu /?pinterest_token=xxx&pinterest_user=xxx
    ↓
Frontend speichert Token in State
    ↓
User klickt "Auf Board pinnen"
    ├── GET /api/pinterest/boards (lädt Boards)
    └── POST /api/pinterest/create-pin (erstellt Pin)
```

### 3. Stripe Payment Flow

```
User wählt Premium Poster
    ↓
Passt an + klickt "Kaufen"
    ↓
POST /api/create-checkout
    → Erstellt Stripe Session mit Metadata
    ↓
Stripe Checkout öffnet sich
    ↓
User zahlt
    ↓
Stripe sendet Webhook zu /api/stripe/webhook
    ├── Event: checkout.session.completed
    ├── Speichert Order in Supabase
    ├── Generiert PDF/PNG
    └── Sendet E-Mail mit Download-Link
    ↓
Redirect zu /success?session_id=xxx
```

---

## Bekannte Probleme & Lösungen

### Problem: Pinterest API "App ID not configured"
**Ursache:** Environment Variables fehlten auf Vercel
**Lösung:**
```bash
npx vercel env add PINTEREST_APP_ID production
npx vercel env add PINTEREST_APP_SECRET production
npx vercel --prod  # Redeploy
```
**Status:** ✅ Gelöst

### Problem: Google Search Console zeigt alten Content
**Ursache:** www vs non-www Redirect, Cache
**Lösung:**
1. Beide Properties (mit/ohne www) in GSC hinzufügen
2. "URL prüfen" → "Live URL testen" → "Indexierung anfordern"
**Status:** ✅ Gelöst

### Problem: Pinterest Standard Access abgelehnt
**Ursache:** Demo zeigte keine Pinterest-Integration/OAuth Flow
**Lösung:**
1. OAuth Flow implementiert (jetzt live)
2. Screen Recording des kompletten Flows erstellen
3. Erneut beantragen mit Video
**Status:** ⏳ Ausstehend

### Problem: Nominatim API Timeout
**Ursache:** Gelegentliche Überlastung
**Lösung:** Debouncing (300ms) + Error Handling implementiert
**Status:** ✅ Gelöst

---

## Offene TODOs

### Priorität: Hoch
- [ ] Pinterest Standard Access beantragen (mit Demo-Video)
- [ ] Google Indexierung überprüfen (nach ein paar Tagen)

### Priorität: Mittel
- [ ] Video-Generierung für Social Media (Kling 2.6 API evaluiert - $0.195/5s Video)
- [ ] Instagram Share Button hinzufügen
- [ ] TikTok Integration prüfen

### Priorität: Niedrig
- [ ] A/B Test für CTA Button Text
- [ ] Weitere Poster-Templates
- [ ] Referral System

---

## Vercel Environment Variables

```
BREVO_API_KEY                      ✅ Gesetzt
NEXT_PUBLIC_SITE_URL               ✅ https://lumeries.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✅ pk_live_...
STRIPE_SECRET_KEY                  ✅ sk_live_...
STRIPE_WEBHOOK_SECRET              ✅ whsec_...
NEXT_PUBLIC_SUPABASE_URL           ✅ https://txfqrfjxvdlifjnawuvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY      ✅ Gesetzt
SUPABASE_SERVICE_ROLE_KEY          ✅ Gesetzt
TELEGRAM_BOT_TOKEN                 ✅ Gesetzt
TELEGRAM_CHAT_ID                   ✅ Gesetzt
PINTEREST_APP_ID                   ✅ 1543649
PINTEREST_APP_SECRET               ✅ Gesetzt
```

---

## Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `app/page.tsx` | Hauptseite mit Poster-Generator |
| `app/api/freebie-signup/route.ts` | Lead Capture API |
| `app/api/auth/pinterest/route.ts` | Pinterest OAuth Start |
| `app/api/auth/pinterest/callback/route.ts` | Pinterest OAuth Callback |
| `components/PinterestConnect.tsx` | Pinterest UI Komponente |
| `components/MoonPoster.tsx` | Mondposter Renderer |
| `lib/translations.ts` | Alle Übersetzungen (DE, EN, FR, ES) |
| `.env.local` | Lokale Environment Variables |

---

## Deployment

```bash
# Build testen
npm run build

# Deploy zu Vercel
npx vercel --prod

# Environment Variable hinzufügen
npx vercel env add VARIABLE_NAME production

# Environment Variables auflisten
npx vercel env ls
```

---

## Kontakt & Support

- **Website:** https://lumeries.com
- **E-Mail:** contact@lumeries.com
- **Admin Chat:** https://lumeries.com/admin/chat
