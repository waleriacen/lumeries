# Custom Poster Gift Shop - Vollautomatisches E-Commerce System

Ein vollständig automatisiertes Custom Poster Business mit Lead Magnet Funnel, Stripe-Integration und Email-Marketing-Automation.

## 🎯 Was ist das?

Eine Next.js-basierte E-Commerce-Plattform für personalisierte Poster mit:
- **Lead Magnet:** Kostenloses personalisiertes Star Map Poster
- **Premium Shop:** Verkauf von Custom Poster Designs (Star Maps, Spotify, Coordinates)
- **100% Automatisiert:** Von Lead-Erfassung bis Payment und Delivery
- **Minimale Kosten:** ~1€/Monat bis 10k Leads + nur Transaktionsgebühren

## 🚀 Features

### Lead Magnet Funnel
- ✅ Kostenlose personalisierte Star Map
- ✅ Live Preview während der Anpassung
- ✅ Instant Delivery per E-Mail
- ✅ Automatische Email-Sequenz (Tag 2, Tag 7)
- ✅ Kontakte gespeichert in Brevo + Supabase

### Premium Poster Shop
- ✅ 6 Produkt-Templates (3 fertig, 3 coming soon)
- ✅ Live-Vorschau mit Echtzeit-Updates
- ✅ Stripe Checkout Integration
- ✅ Automatische PDF-Generierung
- ✅ Instant Delivery nach Zahlung
- ✅ Order Tracking in Supabase

### Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS v4
- **Payments:** Stripe
- **Email:** Brevo (Transactional + Marketing)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (Serverless)
- **PDF Generation:** SVG → PDF (Server-side)

## 📁 Projekt-Struktur

```
teeinblue-clone/
├── app/
│   ├── page.tsx                      # Homepage mit Navigation
│   ├── free-poster/page.tsx          # Lead Magnet Landing Page
│   ├── custom-posters/page.tsx       # Premium Shop Landing Page
│   ├── success/page.tsx              # Stripe Success Seite
│   └── api/
│       ├── free-poster/route.ts      # Lead Magnet API
│       ├── create-checkout/route.ts  # Stripe Checkout API
│       ├── generate-pdf/route.ts     # PDF Generation API
│       └── stripe/webhook/route.ts   # Stripe Webhook Handler
├── components/
│   ├── CustomPosterShop.tsx          # Shop Component mit Modal
│   └── CustomPosterTemplates.tsx     # SVG Templates (Star Map, Spotify, Coordinates)
├── .env.local                        # Environment Variables (API Keys)
├── QUICK-START.md                    # 1-Stunden Launch Guide
├── AUTOMATION-SETUP.md               # Detaillierte Setup-Anleitung
└── README.md                         # Diese Datei
```

## 🎨 Verfügbare Poster-Templates

### 1. Star Map (✅ Fertig)
Zeigt den Sternenhimmel zu einem bestimmten Datum und Ort
- Deterministische Stern-Generierung (SSR-safe)
- Anpassbare Titel, Untertitel, Datum, Ort, Koordinaten
- Preis: €34.99

### 2. Spotify Song Poster (✅ Fertig)
Album-Cover-Style mit Song-Info
- Spotify-ähnliches Design mit Barcode
- Anpassbarer Song-Titel, Artist, Custom Text
- Preis: €29.99

### 3. Coordinates Poster (✅ Fertig)
GPS-Koordinaten eines besonderen Ortes
- Vintage Kompass-Design
- Anpassbare Koordinaten, Titel, Datum
- Preis: €24.99

### 4-6. Coming Soon
- Baby Birth Stats
- Custom Pet Portrait
- Modern Family Tree

## 🛠️ Installation & Setup

### 1. Abhängigkeiten installieren
```bash
npm install
```

**Installierte Packages:**
- `@getbrevo/brevo` - Email-Versand
- `@supabase/supabase-js` - Database
- `stripe` & `@stripe/stripe-js` - Payments
- `react-dom/server` - SSR für PDF-Generation

### 2. Accounts erstellen
Du brauchst kostenlose Accounts bei:
- [Brevo](https://brevo.com) - Email Marketing
- [Supabase](https://supabase.com) - Database
- [Stripe](https://stripe.com) - Payments
- [Vercel](https://vercel.com) - Hosting

### 3. Environment Variables
Kopiere die API-Keys in `.env.local`:

```env
# Brevo
BREVO_API_KEY=xkeysib-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase Database Setup
Führe das SQL-Schema aus (siehe [QUICK-START.md](./QUICK-START.md)):
- `leads` Tabelle
- `orders` Tabelle
- `analytics_events` Tabelle

### 5. Lokal testen
```bash
npm run dev
```

Öffne:
- [http://localhost:3000/free-poster](http://localhost:3000/free-poster) - Teste Lead Magnet
- [http://localhost:3000/custom-posters](http://localhost:3000/custom-posters) - Teste Premium Shop

### 6. Deployment
```bash
git init
git add .
git commit -m "Initial commit"
git push

# Dann auf Vercel deployen
```

**Detaillierte Anleitung:** Siehe [QUICK-START.md](./QUICK-START.md)

## 💰 Kosten-Breakdown

### Kostenlos bis 10k Leads/Monat
- **Vercel:** FREE (Hobby Plan)
- **Brevo:** FREE (300 Emails/Tag)
- **Supabase:** FREE (500MB Database)
- **Stripe:** Nur Transaktionsgebühren (1.5% + €0.25)
- **Domain:** ~€10/Jahr

**Total: ~€1/Monat + Transaktionsgebühren**

### Bei 100k+ Leads/Monat
- Vercel: €20/Monat
- Brevo: €49/Monat
- Supabase: €25/Monat
- Stripe: Transaktionsgebühren
- Domain: ~€1/Monat

**Total: ~€95/Monat**

## 📊 Analytics & Tracking

### Supabase Queries
```sql
-- Gesamt-Leads
SELECT COUNT(*) FROM leads;

-- Conversion Rate
SELECT
  (SELECT COUNT(*) FROM orders)::float /
  (SELECT COUNT(*) FROM leads)::float * 100
AS conversion_rate;

-- Gesamt-Umsatz
SELECT SUM(amount) FROM orders WHERE status = 'completed';

-- Beste Produkte
SELECT product_name, COUNT(*), SUM(amount) AS revenue
FROM orders
GROUP BY product_name
ORDER BY revenue DESC;
```

### Email Performance (Brevo Dashboard)
- Öffnungsrate
- Klickrate
- Conversions

### Stripe Dashboard
- Zahlungen
- Umsatz
- Kunden

## 🔄 Email-Automation Flow

### Kostenloser Poster Download
1. **Tag 0:** "Your Free Poster is Ready!" (Instant)
2. **Tag 2:** "Did you print it?" + 20% Discount Code
3. **Tag 7:** "New Designs Just Dropped!" (Upsell)

### Premium Poster Purchase
1. **Sofort:** Order Confirmation + Download Links
2. **Tag 7:** "Need help printing?" (Support)
3. **Tag 30:** "Share your poster!" (Social Proof)

## 🚀 Go Live Checklist

- [ ] Alle Accounts erstellt (Brevo, Supabase, Stripe)
- [ ] Database-Schema eingerichtet
- [ ] `.env.local` mit allen Keys befüllt
- [ ] Lokal getestet (Free + Premium Flow)
- [ ] Email-Templates in Brevo erstellt
- [ ] Marketing-Automation eingerichtet
- [ ] Auf Vercel deployed
- [ ] Stripe Webhook konfiguriert
- [ ] Domain verbunden (optional)
- [ ] Stripe Live Keys aktiviert
- [ ] 🎉 **LIVE!**

## 📚 Dokumentation

- **[QUICK-START.md](./QUICK-START.md)** - Launch in 1 Stunde
- **[AUTOMATION-SETUP.md](./AUTOMATION-SETUP.md)** - Detaillierte Setup-Anleitung mit Email-Templates
- **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Ursprüngliche manuelle vs. automatische Optionen

## 🛟 Support & Troubleshooting

### Häufige Probleme

**Email kommt nicht an:**
- Spam-Ordner checken
- Brevo Dashboard → Logs → Send Status
- Sender-Email verifizieren

**Stripe Webhook funktioniert nicht:**
- Webhook URL korrekt? `https://your-site.com/api/stripe/webhook`
- `STRIPE_WEBHOOK_SECRET` in Vercel hinzugefügt?
- Stripe Dashboard → Webhooks → Event Logs

**Database Fehler:**
- SQL-Schema ausgeführt?
- Supabase Keys korrekt?
- Row Level Security Policies korrekt?

### Logs anschauen
- **Vercel:** `https://vercel.com/your-project/deployments`
- **Supabase:** Dashboard → Logs
- **Stripe:** Dashboard → Webhooks → View events
- **Brevo:** Dashboard → Logs

## 🎯 Nächste Schritte

1. **Email-Templates optimieren** - A/B Tests durchführen
2. **Mehr Poster-Templates** - Baby Stats, Pet Portrait, Family Tree
3. **SEO optimieren** - Meta Tags, Sitemap, Blog
4. **Paid Ads** - Facebook, Google Ads für Traffic
5. **Affiliate-Programm** - 20% Commission für Referrals
6. **Subscription-Model** - Monthly Club für neue Designs

## 📄 Lizenz

Privates Projekt - Alle Rechte vorbehalten

## 🙋 Support

Bei Fragen:
1. Siehe [QUICK-START.md](./QUICK-START.md) für Setup-Hilfe
2. Siehe [AUTOMATION-SETUP.md](./AUTOMATION-SETUP.md) für Email-Templates
3. Check Vercel/Supabase/Stripe Logs
4. Google für spezifische Error Messages

---

**Viel Erfolg mit deinem Custom Poster Business! 🚀**
