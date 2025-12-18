/**
 * Netlify Function: Create Stripe Checkout Session
 *
 * This function creates a Stripe Checkout session for the AORO T-shirt preorder.
 * It accepts a size selection and creates a checkout session with:
 * - Product details from Stripe product catalog
 * - Size stored in metadata
 * - Shipping address collection
 * - UK-only shipping with placeholder rate
 *
 * Environment variables required:
 * - STRIPE_SECRET_KEY (test or live)
 * - SITE_URL (for success/cancel redirects)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { size, productId, successUrl, cancelUrl } = JSON.parse(event.body);

    // Validate required fields
    if (!size) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Size is required' })
      };
    }

    if (!['S', 'M', 'L', 'XL'].includes(size)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid size selected' })
      };
    }

    // Product configuration
    // Price: £29.99 GBP (2999 pence)
    const PRODUCT_PRICE = 2999;
    const CURRENCY = 'gbp';
    const PRODUCT_ID = productId || 'prod_TcuU8J95P5EkVd';

    // Create Stripe Checkout Session
    // Using approach #1: Collect shipping address, set shipping to £0 for now
    // Shipping will be calculated and invoiced separately after order confirmation
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      // Line items - using manual price definition
      // Note: You can also use price IDs from Stripe dashboard if you create them
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product: PRODUCT_ID,
            unit_amount: PRODUCT_PRICE,
          },
          quantity: 1,
        },
      ],

      // Collect customer information
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB'], // UK only for v1 - expand later
      },

      // Custom fields for additional information (optional enhancement)
      // Uncomment if you want to collect phone number:
      // phone_number_collection: {
      //   enabled: true,
      // },

      // Metadata - CRITICAL for order fulfillment
      // This data will be available in the webhook and Stripe dashboard
      metadata: {
        size: size,
        product_id: PRODUCT_ID,
        product_slug: 'aoro-preorder-tshirt',
        preorder_note: 'ships in 3 weeks',
      },

      // Success and cancel URLs
      success_url: successUrl,
      cancel_url: cancelUrl,

      // Additional settings
      allow_promotion_codes: true, // Allow discount codes

      // Customer can't change quantity
      // submit_type: 'pay', // Default for payment mode
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
