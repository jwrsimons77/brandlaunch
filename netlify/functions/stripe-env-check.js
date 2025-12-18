/**
 * Netlify Function: Stripe Environment Check
 *
 * Diagnostic endpoint to verify Stripe environment variables are set.
 * This does NOT expose the actual values - only checks if they exist.
 *
 * Usage: GET /.netlify/functions/stripe-env-check
 *
 * Returns:
 * {
 *   hasSecretKey: true/false,
 *   hasPriceId: true/false,
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

  // Check environment variables (but don't expose values!)
  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
  const hasPriceId = !!process.env.STRIPE_PRICE_ID_TSHIRT;

  // Log the check (for Netlify function logs)
  console.log('Environment check:', {
    hasSecretKey,
    hasPriceId,
    timestamp: new Date().toISOString()
  });

  // Return the diagnostic info
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: JSON.stringify({
      hasSecretKey,
      hasPriceId,
      timestamp: new Date().toISOString()
    })
  };
};
