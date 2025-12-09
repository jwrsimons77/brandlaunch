const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only respond to POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Extract form data
    const name = data.payload.data.name;
    const email = data.payload.data.email;

    // Your beautiful branded HTML email
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header with mountain gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2c5364 0%, #203a43 50%, #0f2027 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Welcome to AORO</h1>
                    <p style="margin: 10px 0 0 0; color: #e0e0e0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Cloud Piercers</p>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 18px; line-height: 1.6;">
                      Hey ${name},
                    </p>
                    <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.7;">
                      Thanks for joining the climb. You're now part of the Cloud Piercers community and first in line for what's coming next.
                    </p>
                    
                    <!-- What you'll receive -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #2c5364; padding: 20px; margin: 30px 0;">
                      <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; font-weight: 600;">You'll receive intel on:</p>
                      <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">Limited tee drops</li>
                        <li style="margin-bottom: 8px;">Pop-up basecamp locations</li>
                        <li style="margin-bottom: 8px;">Group adventures and sunrise missions</li>
                      </ul>
                    </div>

                    <p style="margin: 30px 0 0 0; color: #555555; font-size: 15px; line-height: 1.7;">
                      We'll send coordinates for the next drop straight to your inbox.
                    </p>
                    <p style="margin: 10px 0 0 0; color: #888888; font-size: 14px; font-style: italic;">
                      Zero spam. Just drop alerts, coordinates, and the occasional brew guide.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: 500;">See you on the mountain,</p>
                    <p style="margin: 0; color: #555555; font-size: 15px;">The AORO Team</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
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
        from: 'AORO <onboarding@resend.dev>',
        to: email,
        subject: 'Thanks for joining the climb',
        html: htmlEmail
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};


