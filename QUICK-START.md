# Quick Start Guide - Launch in 1 Hour

This guide will help you launch your custom poster business with full automation in about 1 hour.

## ✅ What You've Built

Your application now has:
- 🎨 Free poster lead magnet ([/free-poster](http://localhost:3000/free-poster))
- 🛒 Premium poster shop ([/custom-posters](http://localhost:3000/custom-posters))
- ⚡ Full Stripe payment integration
- 📧 Automated email delivery via Brevo
- 📊 Database tracking with Supabase
- 🎯 Live preview customization

---

## 🚀 Deployment Steps (30-60 minutes)

### Step 1: Create Service Accounts (15 minutes)

#### 1.1 Brevo Account
1. Go to [brevo.com](https://www.brevo.com/de/) → Sign up (FREE)
2. Verify your email
3. Go to **Settings** → **SMTP & API** → Create API key
4. Copy the key (starts with `xkeysib-...`)

#### 1.2 Supabase Account
1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Create new project: "teeinblue-clone"
3. Wait 2 minutes for setup
4. Go to **Settings** → **API**
5. Copy:
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` public key
   - `service_role` key (keep secret!)

#### 1.3 Stripe Account
1. Go to [stripe.com](https://stripe.com) → Sign up
2. Complete business verification
3. Go to **Developers** → **API keys**
4. Copy **Test mode** keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

---

### Step 2: Update .env.local (5 minutes)

Open [.env.local](.env.local) and add your keys:

```env
# Brevo
BREVO_API_KEY=xkeysib-YOUR_KEY_HERE

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### Step 3: Set Up Database (5 minutes)

1. Open Supabase dashboard → **SQL Editor**
2. Copy and paste this SQL:

```sql
-- Leads Table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  poster_type TEXT,
  customization_data JSONB,
  download_count INTEGER DEFAULT 0,
  last_download_at TIMESTAMP WITH TIME ZONE
);

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  product_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  customization_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_identifier TEXT,
  page_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
```

3. Click **Run** → Should complete without errors

---

### Step 4: Test Locally (10 minutes)

```bash
cd /Users/waleria/Desktop/teeinblue-clone
npm run dev
```

Open [http://localhost:3000/free-poster](http://localhost:3000/free-poster)

**Test Free Poster:**
1. Customize a star map
2. Enter your real email
3. Click "Get My Free Poster"
4. Check your email inbox

**Test Premium Purchase:**
1. Go to [http://localhost:3000/custom-posters](http://localhost:3000/custom-posters)
2. Click "Customize Now" on any product
3. Fill in email + name + customization
4. Click "Buy Now"
5. Use test card: `4242 4242 4242 4242`
6. Complete purchase
7. Check your email for delivery

---

### Step 5: Deploy to Vercel (15 minutes)

#### 5.1 Push to GitHub
```bash
cd /Users/waleria/Desktop/teeinblue-clone
git init
git add .
git commit -m "Initial commit - Full automation"
git branch -M main

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/teeinblue-clone.git
git push -u origin main
```

#### 5.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Import Project**
3. Select your `teeinblue-clone` repository
4. Add Environment Variables:
   - Copy ALL from your `.env.local`
   - Paste in Vercel settings
   - **Important:** Change `NEXT_PUBLIC_SITE_URL` to your Vercel URL
5. Click **Deploy** → Wait 2-3 minutes

---

### Step 6: Configure Stripe Webhook (10 minutes)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-vercel-app.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Webhook Secret** (starts with `whsec_...`)
7. Add to Vercel env vars:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```
8. Redeploy on Vercel

---

### Step 7: Go Live with Stripe (5 minutes)

When you're ready to accept real payments:

1. Complete Stripe account activation
2. Go to **Developers** → **API keys**
3. Switch to **Live mode**
4. Copy **Live keys**:
   - `pk_live_...`
   - `sk_live_...`
5. Update Vercel env vars with live keys
6. Create new webhook for live mode
7. Redeploy

---

## 🎯 What's Working Now

### Lead Magnet Funnel
1. User visits `/free-poster`
2. Customizes star map
3. Enters email
4. Instant delivery to email
5. Contact saved in Brevo + Supabase
6. Marketing automation starts (Day 2, Day 7 emails)

### Premium Sales Flow
1. User visits `/custom-posters`
2. Customizes poster
3. Stripe checkout
4. Payment processed
5. Order saved in Supabase
6. Instant delivery email via Brevo
7. Analytics tracked

---

## 📊 Check Your Stats

### Brevo Dashboard
- [brevo.com](https://app.brevo.com) → Dashboard
- See: Email opens, clicks, contacts

### Supabase Dashboard
- [supabase.com](https://app.supabase.com) → Your project
- **Table Editor** → View leads, orders, analytics
- Run queries:
  ```sql
  -- Total leads
  SELECT COUNT(*) FROM leads;

  -- Total revenue
  SELECT SUM(amount) FROM orders WHERE status = 'completed';

  -- Popular products
  SELECT product_name, COUNT(*)
  FROM orders
  GROUP BY product_name
  ORDER BY COUNT(*) DESC;
  ```

### Stripe Dashboard
- [stripe.com](https://dashboard.stripe.com) → Dashboard
- See: Payments, customers, revenue

---

## 🚨 Troubleshooting

### "API key invalid" error
- Check your `.env.local` or Vercel env vars
- Make sure keys don't have extra spaces
- Restart dev server: `npm run dev`

### Email not arriving
- Check spam folder
- Verify sender email in Brevo
- Check Brevo dashboard for send errors
- Make sure `BREVO_API_KEY` is correct

### Stripe webhook not working
- Check webhook URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` in env
- Test webhook in Stripe dashboard
- Check Vercel function logs

### Database errors
- Verify Supabase keys are correct
- Check if tables were created (SQL Editor)
- Make sure Row Level Security policies allow inserts

---

## 💰 Cost Breakdown

### First 1,000 Leads
- Vercel: **FREE**
- Brevo: **FREE** (300 emails/day)
- Supabase: **FREE**
- Stripe: **Only transaction fees** (1.5% + €0.25)
- Domain: **~€10/year**

**Total: ~€1/month + transaction fees**

---

## 🎨 Next Steps

### 1. Create Brevo Email Templates
See [AUTOMATION-SETUP.md](./AUTOMATION-SETUP.md) for detailed templates

### 2. Set Up Marketing Automation
- Day 0: Free poster delivery
- Day 2: "Did you print it?" + 20% discount
- Day 7: "New designs" showcase

### 3. Add Domain
- Buy domain from Namecheap/Cloudflare (~€10/year)
- Connect to Vercel
- Update `NEXT_PUBLIC_SITE_URL` to your domain

### 4. Customize Design
- Update colors in Tailwind config
- Add your logo
- Change email sender name
- Customize poster templates

### 5. Add More Products
- Edit `CustomPosterShop.tsx`
- Create new templates in `CustomPosterTemplates.tsx`
- Update product list

---

## 📚 Documentation Links

- **Brevo Docs:** https://developers.brevo.com
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## 🆘 Need Help?

Check these files for detailed guides:
- [AUTOMATION-SETUP.md](./AUTOMATION-SETUP.md) - Full setup with email templates
- [SETUP-GUIDE.md](./SETUP-GUIDE.md) - Original setup options

**Technical Issues:**
- Vercel Logs: `https://vercel.com/your-project/deployments`
- Supabase Logs: Supabase Dashboard → Logs
- Stripe Webhook Logs: Stripe Dashboard → Webhooks → View events

---

## ✅ Launch Checklist

- [ ] Brevo account created + API key added
- [ ] Supabase project created + database schema set up
- [ ] Stripe account created + test keys added
- [ ] `.env.local` updated with all keys
- [ ] Tested free poster locally
- [ ] Tested premium purchase locally
- [ ] Pushed code to GitHub
- [ ] Deployed to Vercel
- [ ] Added environment variables in Vercel
- [ ] Configured Stripe webhook
- [ ] Tested on live site
- [ ] Created email templates in Brevo
- [ ] Set up marketing automation
- [ ] Switched to Stripe live keys
- [ ] 🚀 LAUNCHED!

---

**Congratulations! You now have a fully automated custom poster business! 🎉**
