/**
 * Netlify Function: Create Stripe Checkout Session
 *
 * This function creates a Stripe Checkout session for the AORO T-shirt preorder.
 * It accepts a size and quantity selection and creates a checkout session with:
 * - Price ID from Stripe dashboard
 * - Size stored in metadata
 * - Shipping address collection
 * - UK-only shipping
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY (test or live secret key starting with sk_live_ or sk_test_)
 * - STRIPE_PRICE_ID_TSHIRT (price ID like price_...)
 */

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Step 1: Read and sanitize STRIPE_SECRET_KEY
  const rawKey = process.env.STRIPE_SECRET_KEY || '';
  const secretKey = rawKey.trim();

  // Detect whitespace issue
  if (rawKey !== secretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY had whitespace; trimmed');
  }

  // Step 2: Validate environment variables
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfigured: STRIPE_SECRET_KEY is missing' })
    };
  }

  // Step 3: Validate key prefix
  if (!secretKey.startsWith('sk_live_') && !secretKey.startsWith('sk_test_')) {
    console.error('Invalid STRIPE_SECRET_KEY prefix:', secretKey.substring(0, 3) + '...');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfigured: STRIPE_SECRET_KEY must start with sk_live_ or sk_test_' })
    };
  }

  // Step 4: Sanitize and validate STRIPE_PRICE_ID_TSHIRT
  const priceId = (process.env.STRIPE_PRICE_ID_TSHIRT || '').trim();
  if (!priceId || !priceId.startsWith('price_')) {
    console.error('Invalid STRIPE_PRICE_ID_TSHIRT:', priceId || '(empty)');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfigured: Missing/invalid STRIPE_PRICE_ID_TSHIRT' })
    };
  }

  // Safe debug logs (prefix only - no secrets exposed)
  console.log('STRIPE_SECRET_KEY prefix:', secretKey.substring(0, 8) + '...');
  console.log('STRIPE_PRICE_ID_TSHIRT:', priceId);
  console.log('Request origin:', event.headers.origin);

  // Initialize Stripe with sanitized key
  const stripe = require('stripe')(secretKey, {
    apiVersion: '2024-06-20',
  });

  try {
    const { size, quantity } = JSON.parse(event.body);

    // Validate size
    if (!size) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Size is required' })
      };
    }

    if (!['S', 'M', 'L', 'XL'].includes(size)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid size. Must be S, M, L, or XL' })
      };
    }

    // Validate quantity
    const qty = quantity || 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid quantity. Must be between 1 and 5' })
      };
    }

    // Build redirect URLs from request origin
    const origin = event.headers.origin || process.env.URL || 'https://aoro.run';
    const successUrl = `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/products/aoro-preorder-tshirt.html`;

    console.log('Creating checkout session:', {
      priceId,
      size,
      quantity: qty,
      successUrl,
      cancelUrl
    });

    // Generate idempotency key to prevent duplicate sessions on double-click
    const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      // Line items - using sanitized Price ID
      line_items: [
        {
          price: priceId,
          quantity: qty,
        },
      ],

      // Collect customer information
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB'], // UK only for initial launch
      },

      // Metadata - CRITICAL for order fulfillment
      // This data will be available in the webhook and Stripe dashboard
      metadata: {
        size: size,
        quantity: qty.toString(),
        product_slug: 'aoro-preorder-tshirt',
        preorder_note: 'ships in 3 weeks',
      },

      // Success and cancel URLs
      success_url: successUrl,
      cancel_url: cancelUrl,

      // Additional settings
      allow_promotion_codes: true, // Allow discount codes
    }, {
      idempotencyKey: idempotencyKey
    });

    // Log session creation (helpful for debugging)
    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      size: size,
      quantity: qty
    });

    // Return the checkout URL to redirect the customer
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      })
    };

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to create checkout session'
      })
    };
  }
};
