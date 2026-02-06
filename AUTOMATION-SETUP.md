# Full Automation Setup Guide

## Stack Overview
✅ **Vercel** - Website + Backend + PDF Storage
✅ **Brevo** - E-Mails + Marketing + Datenbank
✅ **Supabase** - Datenbank + Analytics
✅ **Stripe** - Zahlungen
✅ **Domain** - 10€/Jahr

**Total Cost:** ~10-20€/Jahr bis 100k+ Leads

---

## Step 1: Brevo Setup (Email + Marketing + CRM)

### 1.1 Create Brevo Account
1. Go to [brevo.com](https://www.brevo.com/de/)
2. Sign up for **FREE Plan**:
   - 300 E-Mails/Tag kostenlos
   - Unbegrenzte Kontakte
   - Marketing Automation
   - Transactional Emails
3. Verify your email address

### 1.2 Get API Key
1. Go to **Settings** → **SMTP & API**
2. Click **Create a new API key**
3. Name: "Teeinblue Clone - Production"
4. Copy the key (starts with `xkeysib-...`)
5. Add to `.env.local`:
   ```
   BREVO_API_KEY=xkeysib-your-key-here
   ```

### 1.3 Verify Sender Domain (Optional but Recommended)
1. Go to **Senders, Domains & Dedicated IPs** → **Domains**
2. Add your domain (z.B. `custompostersgift.com`)
3. Add DNS records:
   - SPF: `v=spf1 include:spf.sendinblue.com ~all`
   - DKIM: (provided by Brevo)
4. Verification dauert 24-48h

### 1.4 Create Email Templates

**Template 1: Free Poster Delivery**
- Go to **Campaigns** → **Templates**
- Create new template: "Free Poster Delivery"
- Subject: `🎉 Your Free Custom Star Map is Ready!`
- Body:
  ```html
  <h1>Hi {{contact.FIRSTNAME}}!</h1>

  <p>Thank you for creating your custom star map! 🌟</p>

  <p><strong>Your personalized poster is attached to this email.</strong></p>

  <h3>What's Included:</h3>
  <ul>
    <li>✅ High-resolution PDF (300 DPI, print-ready)</li>
    <li>✅ PNG file for digital use</li>
    <li>✅ 3 sizes: 8x10, 11x14, 16x20 inches</li>
  </ul>

  <p><strong>How to Print:</strong><br>
  Take the PDF to any print shop (Costco, Staples, local printer) or print at home!</p>

  <hr>

  <p>💝 <strong>Love your poster?</strong> Check out our premium designs with even more customization options:</p>

  <a href="https://yoursite.com/custom-posters" style="display:inline-block;background:#7C3AED;color:white;padding:12px 30px;text-decoration:none;border-radius:25px;font-weight:bold;">Explore Premium Designs</a>

  <p style="color:#888;font-size:14px;margin-top:30px;">
  Questions? Just reply to this email - we're here to help!
  </p>
  ```

**Template 2: Follow-Up Day 2**
- Subject: `Did you print your star map? 🖨️`
- Upsell premium designs with 20% discount code

**Template 3: Follow-Up Day 7**
- Subject: `⭐ New Designs Just Dropped!`
- Showcase Spotify + Coordinates posters

### 1.5 Create Automation Workflow

1. Go to **Automation** → **Create a workflow**
2. Name: "Free Poster Lead Nurture"
3. Trigger: **Contact added to list "Free Poster Leads"**
4. Workflow:
   ```
   Contact added to "Free Poster Leads"
   ↓
   Send Email: "Free Poster Delivery" (immediately)
   ↓
   Wait: 2 days
   ↓
   Send Email: "Did you print?" (with 20% discount)
   ↓
   Wait: 5 days
   ↓
   Send Email: "New Designs" (showcase all products)
   ```

---

## Step 2: Supabase Setup (Database + Analytics)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new project:
   - Name: `teeinblue-clone`
   - Database Password: (save securely!)
   - Region: `Europe (Frankfurt)` (closest to Germany)
4. Wait 2 minutes for project creation

### 2.2 Get API Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`
   - **service_role key**: `eyJhbG...` (keep secret!)
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (only for server-side)
   ```

### 2.3 Create Database Schema

1. Go to **SQL Editor**
2. Run this SQL:

```sql
-- Leads Table (free poster downloads)
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  poster_type TEXT, -- 'star_map', 'spotify', 'coordinates'
  customization_data JSONB, -- Stores all customization inputs
  download_count INTEGER DEFAULT 0,
  last_download_at TIMESTAMP WITH TIME ZONE
);

-- Orders Table (paid purchases)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  product_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  customization_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'customize_start', 'download', 'purchase', etc.
  user_identifier TEXT, -- email or session ID
  page_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies (allow service role to do everything, restrict public)
CREATE POLICY "Service role full access" ON leads
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access" ON orders
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access" ON analytics_events
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

3. Click **Run**

### 2.4 Test Connection
Run this in SQL Editor:
```sql
SELECT * FROM leads LIMIT 5;
```
Should return empty results (no error).

---

## Step 3: Stripe Setup (Payments)

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up / Log in
3. Activate your account:
   - Business details
   - Bank account (for payouts)
   - Identity verification

### 3.2 Get API Keys
1. Go to **Developers** → **API keys**
2. Copy **Test Mode** keys first:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### 3.3 Create Products in Stripe Dashboard
1. Go to **Products** → **Add product**
2. Create products:

**Product 1: Custom Star Map Poster**
- Name: `Custom Star Map Poster`
- Price: `€34.99`
- Type: `One-time`
- Description: `Personalized star map showing constellations on your special date`

**Product 2: Spotify Song Poster**
- Name: `Custom Spotify Song Poster`
- Price: `€29.99`

**Product 3: Coordinates Poster**
- Name: `Custom Coordinates Poster`
- Price: `€29.99`

3. Copy **Price IDs** (e.g., `price_1234abcd`)

### 3.4 Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yoursite.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy **Webhook Secret**: `whsec_...`
5. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 3.5 Test Mode
- Use test card: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- ZIP: any 5 digits

When ready to go live, switch to **Live Mode** keys.

---

## Step 4: Vercel Deployment

### 4.1 Push to GitHub
```bash
cd /Users/waleria/Desktop/teeinblue-clone
git init
git add .
git commit -m "Initial commit - Full automation setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teeinblue-clone.git
git push -u origin main
```

### 4.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **Import Project**
4. Select your `teeinblue-clone` repository
5. Configure:
   - Framework: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.3 Add Environment Variables in Vercel
Go to **Settings** → **Environment Variables**, add:

```
BREVO_API_KEY=xkeysib-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.4 Deploy
Click **Deploy** - wait 2-3 minutes.

Your site will be live at: `https://teeinblue-clone.vercel.app`

---

## Step 5: Domain Setup

### 5.1 Buy Domain
Buy from:
- **Namecheap** (~10€/year)
- **Cloudflare Registrar** (~8€/year)
- **Google Domains** (~12€/year)

Recommended domain ideas:
- `custompostersgift.com`
- `mypersonalizedart.com`
- `starmapposters.com`

### 5.2 Connect to Vercel
1. In Vercel, go to **Settings** → **Domains**
2. Add your domain: `custompostersgift.com`
3. Add DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 24-48h for DNS propagation

---

## Step 6: Testing the Full Flow

### 6.1 Test Free Poster Flow
1. Go to `https://yoursite.com/free-poster`
2. Customize a star map
3. Enter email address
4. Click "Download Free Poster"
5. Check:
   - ✅ Email received from Brevo
   - ✅ PDF attached and correct
   - ✅ Lead saved in Supabase
   - ✅ Contact created in Brevo

### 6.2 Test Premium Purchase Flow
1. Go to `https://yoursite.com/custom-posters`
2. Click "Buy Now" on a product
3. Use test card: `4242 4242 4242 4242`
4. Complete purchase
5. Check:
   - ✅ Stripe payment successful
   - ✅ Order saved in Supabase
   - ✅ PDF delivery email sent via Brevo
   - ✅ Webhook received

### 6.3 Test Automation Workflow
1. Wait 2 days after free poster download
2. Check if Day 2 email arrives
3. Wait 5 more days
4. Check if Day 7 email arrives

---

## Cost Summary

### Monthly Costs:

**Free Tier (0-10k Leads/Monat):**
- Vercel: **0€** (Hobby Plan)
- Brevo: **0€** (Free Plan - 300 emails/day)
- Supabase: **0€** (Free Plan - 500MB database)
- Stripe: **0€** (only 1.5% + 0.25€ per transaction)
- Domain: **~1€/Monat** (~10€/year)

**Total: ~1€/Monat + transaction fees**

---

**At 10k+ Leads/Monat:**
- Vercel: **0-20€** (Pro if needed)
- Brevo: **0-19€** (Lite Plan for more emails)
- Supabase: **0€** (still free, 500k+ DB rows supported)
- Stripe: transaction fees only
- Domain: ~1€

**Total: ~1-40€/Monat**

---

**At 100k+ Leads/Monat:**
- Vercel: **20€**
- Brevo: **49€** (Business Plan)
- Supabase: **25€** (Pro Plan)
- Stripe: transaction fees
- Domain: ~1€

**Total: ~95€/Monat**

---

## Next Steps

1. ✅ Create accounts (Brevo, Supabase, Stripe)
2. ✅ Run SQL schema in Supabase
3. ✅ Set up Brevo email templates
4. ✅ Create Stripe products
5. ✅ Add all API keys to `.env.local`
6. ✅ Test locally: `npm run dev`
7. ✅ Deploy to Vercel
8. ✅ Connect domain
9. ✅ Test full flow
10. 🚀 Launch marketing!

---

## Support

Fragen? Check:
- Brevo Docs: https://developers.brevo.com
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Vercel Docs: https://vercel.com/docs
