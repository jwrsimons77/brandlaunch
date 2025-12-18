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
 * - STRIPE_SECRET_KEY (test or live secret key)
 * - STRIPE_PRICE_ID_TSHIRT (price ID like price_...)
 */

// Initialize Stripe - this will throw an error if STRIPE_SECRET_KEY is missing
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

exports.handler = async (event) => {
  // Debug logs (safe - no secrets exposed)
  console.log('STRIPE_SECRET_KEY present:', !!process.env.STRIPE_SECRET_KEY);
  console.log('STRIPE_PRICE_ID_TSHIRT present:', !!process.env.STRIPE_PRICE_ID_TSHIRT);
  console.log('Request origin:', event.headers.origin);

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Validate environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Missing STRIPE_SECRET_KEY' })
    };
  }

  if (!process.env.STRIPE_PRICE_ID_TSHIRT) {
    console.error('STRIPE_PRICE_ID_TSHIRT is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Missing STRIPE_PRICE_ID_TSHIRT' })
    };
  }

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

    // Get Price ID from environment
    const priceId = process.env.STRIPE_PRICE_ID_TSHIRT;
    console.log('Using priceId:', priceId);

    // Build redirect URLs from request origin
    const origin = event.headers.origin || process.env.URL || 'https://aoro.run';
    const successUrl = `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/products/aoro-preorder-tshirt.html`;

    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      // Line items - using Price ID from environment
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
    });

    // Log session creation (helpful for debugging)
    console.log('Checkout session created:', {
      sessionId: session.id,
      size: size,
      amount: PRODUCT_PRICE,
      currency: CURRENCY,
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
    console.error('Error creating checkout session:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to create checkout session'
      })
    };
  }
};
