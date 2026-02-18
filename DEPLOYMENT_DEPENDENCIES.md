# 🚀 Deployment Dependencies Guide

This document outlines all external services and dependencies required to deploy Shiftely.

---

## 📋 Required Services (Must Have)

### 1. **PostgreSQL Database** ⚠️ CRITICAL
**Purpose**: Primary data storage for all application data

**Options:**
- **Supabase** (Recommended - Free tier available)
  - Free tier: 500MB database, 2GB bandwidth
  - Easy setup, built-in connection pooling
  - URL: https://supabase.com
  
- **Railway** (Alternative)
  - Free tier: $5 credit/month
  - Simple PostgreSQL setup
  - URL: https://railway.app

- **Neon** (Alternative)
  - Free tier: 0.5GB storage
  - Serverless PostgreSQL
  - URL: https://neon.tech

- **Vercel Postgres** (If deploying to Vercel)
  - Integrated with Vercel
  - Pay-as-you-go pricing
  - URL: https://vercel.com/storage/postgres

**Setup:**
1. Create a PostgreSQL database
2. Copy the connection string
3. Add to environment variables as `DATABASE_URL`

**Example:**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

---

### 2. **Vercel (Hosting)** ⚠️ CRITICAL
**Purpose**: Application hosting and deployment

**Features:**
- Free tier available
- Automatic deployments from Git
- Built-in analytics (no Google Analytics needed)
- Edge functions support
- Automatic SSL certificates

**Setup:**
1. Sign up at https://vercel.com
2. Connect your GitHub/GitLab/Bitbucket repository
3. Configure environment variables
4. Deploy

**Cost:** Free tier available (suitable for MVP)

---

### 3. **Stripe** ⚠️ CRITICAL (For Payments)
**Purpose**: Subscription payments and billing

**Required:**
- Stripe Account (https://stripe.com)
- API Keys (Test and Live)
- Webhook endpoint configuration

**Setup Steps:**
1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for free account
   - Complete business verification (for live mode)

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Copy **Publishable key** (starts with `pk_`)
   - Copy **Secret key** (starts with `sk_`)
   - Use test keys for development, live keys for production

3. **Set Up Webhook**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook signing secret (starts with `whsec_`)

4. **Create Products & Prices**
   - Dashboard → Products
   - Create products matching your tiers:
     - Growth: $29/month
     - Pro: $79/month
   - Note the Price IDs (starts with `price_`)

**Environment Variables:**
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Cost:** 2.9% + $0.30 per transaction (standard Stripe fees)

---

### 4. **Resend** ⚠️ CRITICAL (For Email)
**Purpose**: Send transactional emails (verification, password reset, notifications)

**Setup:**
1. Sign up at https://resend.com
2. Verify your domain (or use their test domain)
3. Get API key from dashboard

**Environment Variable:**
```
RESEND_API_KEY=re_...
```

**Cost:** 
- Free tier: 3,000 emails/month
- Paid: $20/month for 50,000 emails

**Email Types Used:**
- Email verification
- Password reset
- Welcome emails
- Schedule notifications
- Shift swap notifications

---

### 5. **Google Gemini** ⚠️ CRITICAL (For AI Features)
**Purpose**: AI-powered schedule suggestions and employee recommendations

**Setup:**
1. Sign up at https://aistudio.google.com
2. Create a new API key
3. Get API key from API Keys section

**Environment Variable:**
```
GEMINI_API_KEY=your-api-key-here
```

**Cost:**
- Free tier: 15 requests per minute (RPM), 1 million tokens per day
- Paid tier: Pay-per-use pricing
- Gemini 1.5 Pro: ~$1.25 per 1M input tokens, ~$5.00 per 1M output tokens
- Gemini 1.5 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
- Estimated: Free tier sufficient for MVP, $5-20/month for higher usage

**Note:** AI features will fail gracefully if API key is not set (but features won't work)

---

### 6. **NextAuth.js Configuration** ⚠️ CRITICAL
**Purpose**: Authentication and session management

**Required Environment Variables:**
```
NEXTAUTH_URL=https://shiftely.com (or your domain)
NEXTAUTH_SECRET=<generate-random-string>
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use online generator:
# https://generate-secret.vercel.app/32
```

**Cost:** Free (no external service needed)

---

## 🔧 Optional Services

### 7. **Custom Domain** (Recommended)
**Purpose**: Professional branding

**Setup:**
1. Purchase domain (e.g., from Namecheap, Google Domains, etc.)
2. Configure DNS in Vercel
3. Update `NEXTAUTH_URL` to your custom domain

**Cost:** ~$10-15/year

---

### 8. **Email Domain** (Optional but Recommended)
**Purpose**: Professional email addresses (e.g., noreply@shiftely.com)

**Options:**
- Use Resend's domain verification (free)
- Or set up custom domain with Resend

**Cost:** Free with Resend

---

## 📦 Complete Environment Variables List

Create a `.env.local` file (for local development) and add these to Vercel's environment variables (for production):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://shiftely.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# Google Gemini (AI Features)
GEMINI_API_KEY="your-api-key-here"
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Set up PostgreSQL database
- [ ] Create Stripe account and get API keys
- [ ] Create Resend account and get API key
- [ ] Create Google Gemini account and get API key
- [ ] Generate NEXTAUTH_SECRET
- [ ] Purchase domain (optional)
- [ ] Set up domain DNS (if using custom domain)

### Vercel Deployment
- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Configure database connection
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Set up Stripe webhook endpoint
- [ ] Test deployment

### Post-Deployment
- [ ] Verify database connection
- [ ] Test user registration
- [ ] Test email sending
- [ ] Test Stripe checkout (use test mode first)
- [ ] Test AI features
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (if applicable)

---

## 💰 Estimated Monthly Costs

### Free Tier (MVP/Small Scale)
- **Vercel**: Free (Hobby plan)
- **Supabase**: Free (500MB database)
- **Resend**: Free (3,000 emails/month)
- **Stripe**: 2.9% + $0.30 per transaction
- **Google Gemini**: Free tier available, ~$5-20/month for higher usage
- **Total**: ~$5-20/month + transaction fees

### Paid Tier (Growth)
- **Vercel**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Resend**: $20/month (50K emails)
- **Stripe**: Transaction fees only
- **Google Gemini**: ~$20-50/month (if exceeding free tier)
- **Total**: ~$85-115/month + transaction fees

---

## 🔐 Security Considerations

1. **Never commit `.env` files** to Git
2. **Use different keys** for development and production
3. **Rotate secrets** periodically
4. **Enable 2FA** on all service accounts
5. **Use environment variables** in Vercel (not hardcoded)
6. **Set up monitoring** for API usage and costs

---

## 📚 Service Documentation Links

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Resend**: https://resend.com/docs
- **Google Gemini**: https://ai.google.dev/docs
- **NextAuth.js**: https://next-auth.js.org
- **Prisma**: https://www.prisma.io/docs

---

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check SSL mode (use `?sslmode=require` for production)
- Verify database is accessible from Vercel's IP ranges

### Email Not Sending
- Verify Resend API key
- Check domain verification status
- Review Resend dashboard for errors

### Stripe Webhooks Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- Review Stripe dashboard → Webhooks → Events

### AI Features Not Working
- Verify Gemini API key is set
- Check Gemini API quota/limits
- Review API usage in Google AI Studio dashboard

---

## 📝 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Run locally
npm run dev

# 5. Deploy to Vercel
# Push to GitHub, then connect to Vercel
```

---

**Need Help?** Check individual service documentation or the main README.md file.
