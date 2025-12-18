# AORO Stripe Checkout Integration - Setup Guide

Complete setup guide for the AORO T-Shirt Preorder Stripe integration.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [New Files Added](#new-files-added)
3. [Existing Files Modified](#existing-files-modified)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Local Development Setup](#local-development-setup)
6. [Webhook Testing](#webhook-testing)
7. [Production Deployment](#production-deployment)
8. [Order Fulfillment Options](#order-fulfillment-options)
9. [Testing Checklist](#testing-checklist)

---

## 🎯 Overview

This integration provides:

- **Product Page**: `/products/aoro-preorder-tshirt.html`
- **Stripe Checkout**: Size selection (S/M/L/XL), £29.99 GBP
- **Shipping**: Address collection, calculated post-purchase
- **Order Capture**: Webhook stores order details (console logs + optional Google Sheets/Email)
- **Success/Cancel Pages**: Clean post-checkout experience

**Key Features**:
- ✅ Fully isolated (no existing files modified except package.json)
- ✅ Mobile-first, premium design inspired by Represent
- ✅ Size stored in Stripe metadata
- ✅ Shipping address collected
- ✅ Ready for test mode first, then production

---

## 📁 New Files Added

### Product Page
- `products/aoro-preorder-tshirt.html` - Premium product page with size selector

### Netlify Functions
- `netlify/functions/create-checkout-session.js` - Creates Stripe Checkout session
- `netlify/functions/stripe-webhook.js` - Handles webhook events and order storage

### Success/Cancel Pages
- `success.html` - Order confirmation page
- `cancelled.html` - Order cancellation page

### Configuration Files
- `package.json` - Dependencies (Stripe SDK)
- `.env.example` - Environment variable template
- `STRIPE_SETUP_GUIDE.md` - This setup guide

### Dependencies Installed
- `node_modules/` - Stripe SDK and dependencies (added to `.gitignore`)
- `package-lock.json` - Lock file

---

## ✏️ Existing Files Modified

**NONE** - The integration is fully isolated as requested.

The only file modified is:
- `package.json` - **Created new** (didn't exist before)

---

## 🔐 Environment Variables Setup

### For Local Development (Test Mode)

Create a `.env` file in the project root:

```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SITE_URL=http://localhost:8888

# Optional: Email notifications
FULFILLMENT_EMAIL=your-email@example.com
RESEND_API_KEY=re_your_resend_key_here
```

**Where to get test keys**:
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. For webhook secret, see [Webhook Testing](#webhook-testing) section

### For Netlify Production (Live Mode)

Set these in Netlify dashboard: **Site settings → Environment variables**

```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
SITE_URL=https://aoro.co.uk

# Optional: Order fulfillment
FULFILLMENT_EMAIL=orders@aoro.co.uk
RESEND_API_KEY=re_your_resend_key
```

**Live Publishable Key** (already provided):
```
pk_live_51SfeQtJJQW40EwHJGkWPHY5jIegB2qK2y42bV1ZTJDgcaZ9MKdsdgvkSBbEjOvQlVWGFEwJOVsfSmbFMYDqJYvPX00NHClSNjs
```

---

## 💻 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `stripe` - Official Stripe Node.js SDK
- `netlify-cli` - For local development server

### 2. Create `.env` File

```bash
cp .env.example .env
```

Then edit `.env` with your test Stripe keys.

### 3. Start Local Development Server

```bash
npm run dev
```

Or using Netlify CLI directly:

```bash
netlify dev
```

The site will be available at: `http://localhost:8888`

### 4. Test the Product Page

Visit: `http://localhost:8888/products/aoro-preorder-tshirt.html`

- Select a size
- Click "Preorder Now"
- Should redirect to Stripe Checkout (test mode)

---

## 🎣 Webhook Testing

Webhooks are critical for capturing order details. Use Stripe CLI for local testing.

### 1. Install Stripe CLI

**macOS**:
```bash
brew install stripe/stripe-cli/stripe
```

**Linux**:
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use package manager
```

**Windows**:
Download from: https://github.com/stripe/stripe-cli/releases

### 2. Login to Stripe

```bash
stripe login
```

This opens a browser to authorize the CLI.

### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

**Important**: Copy the webhook signing secret from the output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Add this to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 4. Test Complete Flow

1. Keep `stripe listen` running in one terminal
2. Run `netlify dev` in another terminal
3. Visit product page and complete a test purchase
4. Use Stripe test card: `4242 4242 4242 4242`
5. Check the `stripe listen` terminal for webhook events
6. Check Netlify function logs for order details

**Expected output in webhook logs**:
```json
{
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "size": "M",
  "shippingAddress": {...},
  "amountTotal": 29.99,
  "sessionId": "cs_test_...",
  ...
}
```

---

## 🚀 Production Deployment

### 1. Create Live Webhook Endpoint in Stripe

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://aoro.co.uk/.netlify/functions/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### 2. Set Netlify Environment Variables

In Netlify dashboard (**Site settings → Environment variables**):

```bash
STRIPE_SECRET_KEY=sk_live_your_actual_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
SITE_URL=https://aoro.co.uk
```

Optional (for order notifications):
```bash
FULFILLMENT_EMAIL=orders@aoro.co.uk
RESEND_API_KEY=re_your_resend_key
```

### 3. Deploy to Netlify

```bash
git add .
git commit -m "Add Stripe preorder integration"
git push origin your-branch
```

Or trigger a manual deploy in Netlify dashboard.

### 4. Test on Production

1. Visit: `https://aoro.co.uk/products/aoro-preorder-tshirt.html`
2. Complete a **test purchase** first (use test card in test mode)
3. Then switch to live mode and test with a real card (or refund immediately)

**Test cards**: https://stripe.com/docs/testing#cards

---

## 📊 Order Fulfillment Options

The webhook handler supports multiple order storage options:

### Option 1: Console Logs (Default - Always Enabled)

All orders are logged to Netlify function logs:
- View in: **Netlify dashboard → Functions → stripe-webhook → Logs**
- Look for: `=== ORDER DETAILS ===`

### Option 2: Google Sheets (Recommended for Fulfillment)

**Benefits**: Easy to view, share, and process orders

**Setup**:

1. **Create Google Sheet**:
   - Create a new Google Sheet
   - Name first sheet "Orders"
   - Add headers in row 1:
     ```
     Timestamp | Email | Name | Size | Address Line 1 | Address Line 2 | City | State | Postal Code | Country | Amount | Currency | Payment Status | Session ID | Payment Intent
     ```

2. **Create Service Account**:
   - Go to: https://console.cloud.google.com/
   - Create new project (or use existing)
   - Enable **Google Sheets API**
   - Create **Service Account** credentials
   - Download JSON key file

3. **Share Sheet with Service Account**:
   - Open your Google Sheet
   - Click **Share**
   - Add service account email (from JSON file)
   - Give **Editor** access

4. **Set Netlify Environment Variables**:
   ```bash
   GOOGLE_SHEET_ID=your_sheet_id_from_url
   GOOGLE_SERVICE_ACCOUNT_JSON=base64_encoded_json_here
   ```

   To encode the JSON:
   ```bash
   cat service-account.json | base64 -w 0
   ```

5. **Install Google APIs Package**:
   ```bash
   npm install googleapis
   ```

6. **Uncomment Google Sheets Code**:
   - Open: `netlify/functions/stripe-webhook.js`
   - Find the `saveToGoogleSheets` function
   - Uncomment the implementation code

### Option 3: Email Notifications (Fallback)

**Setup**:

1. Get Resend API key: https://resend.com/api-keys
2. Set environment variables:
   ```bash
   FULFILLMENT_EMAIL=orders@aoro.co.uk
   RESEND_API_KEY=re_your_key_here
   ```

Orders will be emailed as formatted HTML to the specified address.

---

## ✅ Testing Checklist

### Before Going Live

- [ ] Test mode works locally with `stripe listen`
- [ ] Product page loads correctly
- [ ] Size selection is required before checkout
- [ ] Stripe Checkout opens with correct amount (£29.99)
- [ ] Shipping address is collected
- [ ] Success page shows after payment
- [ ] Cancel page shows when payment is cancelled
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Order details logged correctly (check Netlify logs)
- [ ] Metadata includes: size, product_id, product_slug, preorder_note
- [ ] Test with all sizes: S, M, L, XL

### Production Testing

- [ ] Live webhook endpoint created in Stripe dashboard
- [ ] Environment variables set in Netlify
- [ ] Test purchase with test card in live mode
- [ ] Order appears in fulfillment system (Sheets/Email/Logs)
- [ ] Customer receives Stripe confirmation email
- [ ] Refund test order if real card used

### Mobile Testing

- [ ] Product page responsive on mobile
- [ ] Size selector easy to tap
- [ ] Checkout button accessible
- [ ] Success/cancel pages display correctly

---

## 🔍 Troubleshooting

### "Failed to create checkout session"

- **Check**: Stripe secret key is set correctly
- **Check**: SITE_URL is set (needed for redirects)
- **Check**: Netlify function logs for error details

### "Invalid signature" webhook error

- **Check**: Webhook secret matches Stripe CLI output (local)
- **Check**: Webhook secret matches Stripe dashboard (production)
- **Check**: Using correct Stripe account (test vs live)

### Webhook not receiving events

- **Local**: Ensure `stripe listen` is running
- **Production**: Check webhook endpoint URL in Stripe dashboard
- **Check**: Netlify function deployed successfully
- **Check**: Function logs for any errors

### Orders not appearing in Google Sheets

- **Check**: Service account has Editor access to sheet
- **Check**: Sheet ID is correct
- **Check**: `googleapis` package installed
- **Check**: Service account JSON is correctly base64 encoded
- **Check**: Google Sheets code is uncommented in webhook handler

---

## 📞 Support

**Questions?**
- Email: hello@aoro.co.uk
- Stripe Docs: https://stripe.com/docs
- Netlify Functions Docs: https://docs.netlify.com/functions/overview/

---

## 🎉 You're Ready!

The integration is complete and isolated. Your existing site remains untouched.

**Quick Start**:
1. Set environment variables
2. Run `netlify dev`
3. Test locally with Stripe CLI
4. Deploy to production
5. Start taking preorders!

Welcome to the Cloud Piercer Collective. ☁️
