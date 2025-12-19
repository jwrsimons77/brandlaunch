/**
 * Netlify Function: Stripe Health Check
 *
 * Comprehensive health check that verifies:
 * 1. STRIPE_SECRET_KEY exists and has correct prefix
 * 2. STRIPE_PRICE_ID_TSHIRT exists and has correct format
 * 3. Stripe SDK can connect to Stripe API
 *
 * Usage: GET /.netlify/functions/stripe-health
 *
 * Returns:
 * {
 *   ok: true/false,
 *   checks: {
 *     secretKey: { valid: true/false, message: "..." },
 *     priceId: { valid: true/false, message: "..." },
 *     apiConnection: { valid: true/false, message: "..." }
 *   },
 *   timestamp: "2024-01-01T00:00:00.000Z"
 * }
 */

exports.handler = async (event) => {
  // Only accept GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const checks = {
    secretKey: { valid: false, message: '' },
    priceId: { valid: false, message: '' },
    apiConnection: { valid: false, message: '' }
  };

  let allChecksPass = true;

  // Check 1: Verify STRIPE_SECRET_KEY
  const rawKey = process.env.STRIPE_SECRET_KEY || '';
  const secretKey = rawKey.trim();

  if (!secretKey) {
    checks.secretKey = { valid: false, message: 'STRIPE_SECRET_KEY is not set' };
    allChecksPass = false;
  } else if (rawKey !== secretKey) {
    checks.secretKey = { valid: false, message: 'STRIPE_SECRET_KEY contains whitespace/newlines (needs trimming)' };
    allChecksPass = false;
  } else if (!secretKey.startsWith('sk_live_') && !secretKey.startsWith('sk_test_')) {
    checks.secretKey = {
      valid: false,
      message: `Invalid prefix: ${secretKey.substring(0, 3)}... (expected sk_live_ or sk_test_)`
    };
    allChecksPass = false;
  } else {
    const keyType = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
    checks.secretKey = {
      valid: true,
      message: `Valid ${keyType} key (${secretKey.substring(0, 8)}...)`
    };
  }

  // Check 2: Verify STRIPE_PRICE_ID_TSHIRT
  const priceId = (process.env.STRIPE_PRICE_ID_TSHIRT || '').trim();

  if (!priceId) {
    checks.priceId = { valid: false, message: 'STRIPE_PRICE_ID_TSHIRT is not set' };
    allChecksPass = false;
  } else if (!priceId.startsWith('price_')) {
    checks.priceId = { valid: false, message: `Invalid format: ${priceId} (expected price_...)` };
    allChecksPass = false;
  } else {
    checks.priceId = { valid: true, message: `Valid price ID: ${priceId}` };
  }

  // Check 3: Test Stripe API connection (only if secret key is valid)
  if (checks.secretKey.valid) {
    try {
      const stripe = require('stripe')(secretKey, {
        apiVersion: '2024-06-20',
      });

      // Make a simple API call to verify connection
      const balance = await stripe.balance.retrieve();

      checks.apiConnection = {
        valid: true,
        message: `Connected successfully (${balance.object} retrieved)`
      };
    } catch (error) {
      checks.apiConnection = {
        valid: false,
        message: `Stripe API error: ${error.message}`
      };
      allChecksPass = false;
    }
  } else {
    checks.apiConnection = {
      valid: false,
      message: 'Skipped (invalid secret key)'
    };
    allChecksPass = false;
  }

  // Log the check results
  console.log('Health check results:', {
    ok: allChecksPass,
    checks,
    timestamp: new Date().toISOString()
  });

  // Return the health check results
  return {
    statusCode: allChecksPass ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: JSON.stringify({
      ok: allChecksPass,
      checks,
      timestamp: new Date().toISOString()
    })
  };
};
