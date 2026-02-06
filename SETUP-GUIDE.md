# Custom Poster Shop - Setup Guide

## Option 1: Systeme.io (Günstigste Lösung - 27€/Monat)

### Was du brauchst:
- Systeme.io Startup Plan (27€/Monat)
- Canva Pro (11€/Monat) - optional für schnellere Bearbeitung
- Google Forms (kostenlos) für Personalisierungsdaten

### Setup-Schritte:

#### 1. Systeme.io Account erstellen
- Gehe zu systeme.io
- Wähle Startup Plan (27€/Monat)
- Verbinde Stripe/PayPal für Zahlungen

#### 2. Produkt erstellen
- Gehe zu "Products"
- Erstelle digitales Produkt:
  - Name: "Custom Star Map Poster"
  - Preis: 34.99€
  - Typ: Digital Product
  - Beschreibung kopieren von deiner Landing Page

#### 3. Sales Funnel erstellen
```
Step 1: Landing Page (mit deinem Design)
Step 2: Order Form (Checkout)
Step 3: Thank You Page + Personalisierungsformular
```

#### 4. E-Mail-Automation einrichten

**Automation 1: Nach Kauf**
```
Trigger: Tag "purchased_star_map" added
Wait: 0 minutes
Action: Send Email "Personalization Request"
```

**E-Mail-Template:**
```
Subject: ✅ Your Star Map is Almost Ready!

Hi {contact.first_name},

Thank you for your purchase! 🎉

To create your personalized star map, please fill out this form:
👉 [Google Form Link]

We need:
- Event date (when the stars aligned)
- Location (city or coordinates)
- Custom title (e.g., "Our Love Story")
- Custom subtitle (e.g., "Where it all began")

You'll receive your high-resolution files within 24 hours!

Questions? Just reply to this email.

Best regards,
[Your Name]
```

**Automation 2: Nach 24h Erinnerung (falls kein Formular ausgefüllt)**
```
Trigger: Tag "purchased_star_map" added
Wait: 24 hours
Condition: Does NOT have tag "details_received"
Action: Send Email "Gentle Reminder"
```

#### 5. Google Form erstellen
```
Titel: Star Map Personalization

Fragen:
1. Your Email Address (used at checkout)
2. Event Date (MM/DD/YYYY)
3. Location (City, Country OR Coordinates)
4. Custom Title (max 20 characters)
5. Custom Subtitle (max 30 characters)
6. Any special requests?

Responses → Google Sheets (automatisch)
```

#### 6. Manuelle Erfüllung (Start)
1. Öffne Google Sheet mit Bestellungen
2. Öffne deine Next.js App (localhost:3000/custom-posters)
3. Klicke "Customize Now"
4. Trage Kundendaten ein
5. Mache Screenshot oder nutze "Print to PDF" im Browser
6. Sende PDF per systeme.io Follow-up E-Mail

**Zeitaufwand: 5-10 Minuten pro Bestellung**

---

## Option 2: Vollautomatisch mit Next.js + Vercel (Fortgeschritten)

### Kostenlose/Günstige Stack:

**Hosting:**
- Vercel (kostenlos für Hobby-Projekte)

**Zahlungen:**
- Stripe (1,5% + 0,25€ pro Transaktion)

**E-Mail-Versand:**
- Resend.com (3.000 E-Mails/Monat kostenlos)

**Datenbank:**
- Supabase (kostenloser Plan)

**File Storage:**
- Vercel Blob Storage oder Supabase Storage

### Setup-Schritte:

#### 1. Stripe Integration

```bash
npm install stripe @stripe/stripe-js
```

**Environment Variables (.env.local):**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**API Route: app/api/checkout/route.ts**
```typescript
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const { productId, customData } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Custom Star Map Poster',
            images: ['https://your-domain.com/star-map-preview.jpg'],
          },
          unit_amount: 3499, // 34.99€
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/custom-posters`,
    metadata: {
      customData: JSON.stringify(customData),
    },
  });

  return NextResponse.json({ url: session.url });
}
```

#### 2. Resend E-Mail Integration

```bash
npm install resend
```

**API Route: app/api/send-files/route.ts**
```typescript
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, customerName, pdfUrl } = await req.json();

  await resend.emails.send({
    from: 'orders@yourdomain.com',
    to: email,
    subject: '🎨 Your Custom Poster is Ready!',
    html: `
      <h1>Hi ${customerName}!</h1>
      <p>Your personalized poster is ready! 🎉</p>
      <p><a href="${pdfUrl}">Download your files here</a></p>
      <p>Included:</p>
      <ul>
        <li>High-resolution PDF (300 DPI)</li>
        <li>PNG for digital use</li>
        <li>Print guide</li>
      </ul>
    `,
  });

  return NextResponse.json({ success: true });
}
```

#### 3. PDF-Generierung (Browser-basiert)

```typescript
// Client-side PDF generation
const generatePDF = async () => {
  const element = document.getElementById('poster-preview');

  // Option 1: html2canvas + jsPDF
  const canvas = await html2canvas(element);
  const pdf = new jsPDF();
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
  pdf.save('custom-poster.pdf');
};
```

---

## Empfehlung für den Start:

### Phase 1 (Monat 1-3): Systeme.io + Manuell
- **Kosten: 27€/Monat**
- Validiere deine Idee
- Sammle Kundenfeedback
- Optimiere Templates
- **Ziel: 20-50 Verkäufe/Monat**

### Phase 2 (Monat 4-6): Semi-Automatisch
- **Kosten: 50-100€/Monat**
- Füge Zapier hinzu für Automation
- Canva API für schnellere Generierung
- **Ziel: 100+ Verkäufe/Monat**

### Phase 3 (Monat 6+): Vollautomatisch
- **Kosten: 100-200€/Monat**
- Volle Next.js Integration
- Automatische PDF-Generierung
- Instant Delivery
- **Ziel: 500+ Verkäufe/Monat**

---

## Kosten-Vergleich:

### Systeme.io Start:
```
Systeme.io: 27€
Canva Pro: 11€ (optional)
Gesamt: 27-38€/Monat
```

### Next.js Vollautomatisch:
```
Vercel: 0€ (Hobby) oder 20€ (Pro)
Stripe: nur Transaktionsgebühren
Resend: 0€ (bis 3k E-Mails)
Supabase: 0€
Gesamt: 0-20€/Monat + 1,5% + 0,25€ pro Sale
```

### Break-Even-Analyse:
- Bei 10 Sales/Monat (349€ Umsatz): Systeme.io günstiger
- Bei 100+ Sales/Monat (3490€ Umsatz): Next.js günstiger

---

## Quick Start Checklist:

- [ ] Systeme.io Account erstellen
- [ ] Stripe/PayPal verbinden
- [ ] Produkt erstellen (Star Map - 34.99€)
- [ ] Google Form für Personalisierung erstellen
- [ ] E-Mail-Automation einrichten
- [ ] Erste Test-Bestellung durchführen
- [ ] Canva Templates vorbereiten
- [ ] Launch! 🚀

**Fragen? Lass mich wissen, welche Option du wählen möchtest!**
