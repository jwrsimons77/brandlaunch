/**
 * Netlify Function: Stripe Webhook Handler
 *
 * Handles Stripe webhook events, specifically:
 * - checkout.session.completed: Captures order details for fulfillment
 *
 * Order data captured:
 * - Customer email and name
 * - Shipping address
 * - Selected size (from metadata)
 * - Amount paid
 * - Stripe session ID and payment intent ID
 * - Timestamp
 *
 * Storage options (in order of preference):
 * 1. Google Sheets (configured via env vars)
 * 2. Email notification (fallback if FULFILLMENT_EMAIL is set)
 * 3. Console logging (always enabled for dev/debugging)
 *
 * Environment variables required:
 * - STRIPE_WEBHOOK_SECRET (test or live)
 * - STRIPE_SECRET_KEY (for retrieving session details)
 *
 * Optional environment variables:
 * - GOOGLE_SHEET_ID (for Google Sheets integration)
 * - GOOGLE_SERVICE_ACCOUNT_JSON (base64 encoded service account credentials)
 * - FULFILLMENT_EMAIL (email to send order notifications to)
 * - RESEND_API_KEY (if using email fallback)
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

  // Get Stripe signature from headers
  const signature = event.headers['stripe-signature'];

  if (!signature) {
    console.error('No Stripe signature found in headers');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature found' })
    };
  }

  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  console.log('Webhook event received:', {
    type: stripeEvent.type,
    id: stripeEvent.id
  });

  // Handle checkout.session.completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    try {
      // Retrieve full session details with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'customer', 'payment_intent']
      });

      // Extract order details
      const orderData = {
        // Customer info
        customerEmail: fullSession.customer_details?.email || 'N/A',
        customerName: fullSession.customer_details?.name || 'N/A',

        // Shipping address
        shippingAddress: {
          line1: fullSession.shipping_details?.address?.line1 || '',
          line2: fullSession.shipping_details?.address?.line2 || '',
          city: fullSession.shipping_details?.address?.city || '',
          state: fullSession.shipping_details?.address?.state || '',
          postalCode: fullSession.shipping_details?.address?.postal_code || '',
          country: fullSession.shipping_details?.address?.country || ''
        },

        // Product details from metadata
        size: fullSession.metadata?.size || 'N/A',
        productId: fullSession.metadata?.product_id || 'N/A',
        productSlug: fullSession.metadata?.product_slug || 'N/A',
        preorderNote: fullSession.metadata?.preorder_note || 'N/A',

        // Payment details
        amountTotal: fullSession.amount_total / 100, // Convert from pence to pounds
        currency: fullSession.currency?.toUpperCase() || 'GBP',
        paymentStatus: fullSession.payment_status,

        // Stripe IDs
        sessionId: fullSession.id,
        paymentIntentId: fullSession.payment_intent?.id || fullSession.payment_intent || 'N/A',
        customerId: fullSession.customer || 'N/A',

        // Timestamp
        timestamp: new Date().toISOString(),
        timestampReadable: new Date().toLocaleString('en-GB', {
          timeZone: 'Europe/London',
          dateStyle: 'full',
          timeStyle: 'long'
        })
      };

      // ALWAYS log to console (useful for dev and Netlify function logs)
      console.log('=== ORDER DETAILS ===');
      console.log(JSON.stringify(orderData, null, 2));
      console.log('====================');

      // Storage Option 1: Google Sheets (if configured)
      if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
          await saveToGoogleSheets(orderData);
          console.log('Order saved to Google Sheets');
        } catch (sheetsError) {
          console.error('Failed to save to Google Sheets:', sheetsError.message);
          // Continue to fallback options
        }
      }

      // Storage Option 2: Email notification (if configured)
      if (process.env.FULFILLMENT_EMAIL && process.env.RESEND_API_KEY) {
        try {
          await sendFulfillmentEmail(orderData);
          console.log('Fulfillment email sent');
        } catch (emailError) {
          console.error('Failed to send fulfillment email:', emailError.message);
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
      };

    } catch (error) {
      console.error('Error processing checkout session:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to process order' })
      };
    }
  }

  // For other event types, just acknowledge receipt
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

/**
 * Save order to Google Sheets
 * Requires: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 */
async function saveToGoogleSheets(orderData) {
  // This is a placeholder for Google Sheets integration
  // To implement:
  // 1. Install googleapis: npm install googleapis
  // 2. Decode service account JSON: Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString()
  // 3. Authenticate with Google Sheets API
  // 4. Append row to sheet

  // Example implementation (uncomment and install googleapis to use):
  /*
  const { google } = require('googleapis');

  // Decode service account credentials
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString()
  );

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Prepare row data
  const row = [
    orderData.timestamp,
    orderData.customerEmail,
    orderData.customerName,
    orderData.size,
    orderData.shippingAddress.line1,
    orderData.shippingAddress.line2,
    orderData.shippingAddress.city,
    orderData.shippingAddress.state,
    orderData.shippingAddress.postalCode,
    orderData.shippingAddress.country,
    orderData.amountTotal,
    orderData.currency,
    orderData.paymentStatus,
    orderData.sessionId,
    orderData.paymentIntentId
  ];

  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Orders!A:O', // Adjust sheet name and range as needed
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [row]
    }
  });
  */

  console.log('Google Sheets integration not yet implemented - see function comments for setup');
  throw new Error('Google Sheets not configured');
}

/**
 * Send fulfillment email
 * Requires: FULFILLMENT_EMAIL, RESEND_API_KEY
 */
async function sendFulfillmentEmail(orderData) {
  const fulfillmentEmail = process.env.FULFILLMENT_EMAIL;

  if (!fulfillmentEmail) {
    throw new Error('FULFILLMENT_EMAIL not configured');
  }

  // Format shipping address
  const shippingAddressFormatted = [
    orderData.shippingAddress.line1,
    orderData.shippingAddress.line2,
    orderData.shippingAddress.city,
    orderData.shippingAddress.state,
    orderData.shippingAddress.postalCode,
    orderData.shippingAddress.country
  ].filter(Boolean).join(', ');

  // Email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0A0A0A; color: white; padding: 20px; text-align: center; }
        .content { background: #f5f5f5; padding: 30px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: 600; width: 180px; color: #666; }
        .detail-value { flex: 1; }
        .highlight { background: #FF8B94; color: white; padding: 2px 8px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New AORO Preorder</h1>
        </div>
        <div class="content">
          <p><strong>New t-shirt preorder received!</strong></p>

          <div class="order-details">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">${orderData.customerName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${orderData.customerEmail}</div>
            </div>

            <h3 style="margin-top: 30px;">Order Details</h3>
            <div class="detail-row">
              <div class="detail-label">Size:</div>
              <div class="detail-value"><span class="highlight">${orderData.size}</span></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Amount Paid:</div>
              <div class="detail-value">${orderData.currency} £${orderData.amountTotal.toFixed(2)}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Payment Status:</div>
              <div class="detail-value">${orderData.paymentStatus}</div>
            </div>

            <h3 style="margin-top: 30px;">Shipping Address</h3>
            <div class="detail-row">
              <div class="detail-value">${shippingAddressFormatted}</div>
            </div>

            <h3 style="margin-top: 30px;">Stripe Details</h3>
            <div class="detail-row">
              <div class="detail-label">Session ID:</div>
              <div class="detail-value" style="font-family: monospace; font-size: 12px;">${orderData.sessionId}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Payment Intent:</div>
              <div class="detail-value" style="font-family: monospace; font-size: 12px;">${orderData.paymentIntentId}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Order Time:</div>
              <div class="detail-value">${orderData.timestampReadable}</div>
            </div>
          </div>

          <p><strong>Note:</strong> ${orderData.preorderNote}</p>
          <p style="color: #666; font-size: 14px;">Remember to calculate and invoice shipping based on the customer's location.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'AORO Orders <orders@aoro.co.uk>',
      to: fulfillmentEmail,
      subject: `New AORO Preorder - Size ${orderData.size} - ${orderData.customerName}`,
      html: emailHtml
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to send email');
  }

  console.log('Fulfillment email sent:', result.id);
}
