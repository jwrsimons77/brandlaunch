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

    // Default HTML email (used if template ID not provided)
    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title>Welcome to AORO</title>
        <style>
          :root { color-scheme: light only; }
          body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333333; }
          table { border-collapse: collapse; }
          a { color: inherit; text-decoration: none; }
          @media (max-width: 600px) {
            .container { width: 100% !important; }
            .padding-responsive { padding: 32px 22px !important; }
            .btn { width: 100% !important; text-align: center !important; }
          }
        </style>
      </head>
      <body>
        <table role="presentation" width="100%" bgcolor="#f5f5f5">
          <tr>
            <td align="center" style="padding: 48px 16px;">
              <table role="presentation" width="600" class="container" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 28px rgba(15,32,39,0.12);">
                <tr>
                  <td style="background: linear-gradient(135deg, #0f2027 10%, #203a43 45%, #f97bd2 100%); padding: 56px 40px; text-align:center;">
                    <div style="display:inline-block; padding: 12px 20px; border:1px solid rgba(255,255,255,0.35); border-radius:999px; color:#ffffff; font-size:13px; letter-spacing:0.3em; text-transform:uppercase;">Cloud Piercers</div>
                    <h1 style="margin:24px 0 8px; color:#ffffff; font-size:36px; letter-spacing:-0.6px;">Welcome to AORO</h1>
                    <p style="margin:0; color:rgba(255,255,255,0.78); font-size:16px; line-height:1.6;">Adventure-ready gear. Sunrise brews. Crew-built missions.</p>
                  </td>
                </tr>
                <tr>
                  <td class="padding-responsive" style="padding:44px 40px 32px;">
                    <p style="margin:0 0 20px; font-size:18px; line-height:1.6;">Hey ${name},</p>
                    <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#455a64;">Thanks for joining the climb. You’re officially part of the Cloud Piercers crew—first to hear about limited drops, next basecamp coordinates, and the sunrise missions worth dragging your mates out for.</p>
                    <table role="presentation" width="100%" bgcolor="#fdf1fb" style="border-radius:12px; border-left:4px solid #f97bd2; margin:32px 0;">
                      <tr>
                        <td style="padding:26px 28px;">
                          <p style="margin:0 0 16px; font-size:16px; font-weight:600; color:#2c3e50;">Here’s what you’ll receive:</p>
                          <ul style="margin:0; padding-left:22px; color:#546e7a; font-size:15px; line-height:1.8;">
                            <li style="margin-bottom:10px;">Limited tee drops—mountain-bred, crew-tested</li>
                            <li style="margin-bottom:10px;">Pop-up basecamp coordinates &amp; coffee-fuelled hangs</li>
                            <li style="margin-bottom:10px;">Group adventures, sunrise missions, and trail intel</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#546e7a;">Keep your pack ready—we’ll send your next set of coordinates soon. Until then, brew something strong and plan the next climb.</p>
                    <table role="presentation" width="100%" style="margin:30px 0 10px;">
                      <tr>
                        <td>
                          <a href="https://www.aoro.co.uk" class="btn" style="display:inline-block; padding:16px 32px; background:#f97bd2; color:#0f2027; font-size:15px; font-weight:600; letter-spacing:0.08em; border-radius:999px; text-transform:uppercase;">Explore AORO</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:6px 0 0; font-size:13px; color:#9aa3ac; font-style:italic;">Zero spam. Just drop alerts, coordinates, and the occasional brew guide.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8f9fa; padding:34px; text-align:center;">
                    <p style="margin:0 0 12px; font-size:16px; font-weight:500; color:#2c3e50;">See you on the mountain,</p>
                    <p style="margin:0; font-size:15px; color:#455a64;">The AORO Crew</p>
                    <table role="presentation" width="100%" style="margin:26px 0 0;">
                      <tr>
                        <td align="center" style="font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#9aa3ac;">Stay Connected</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top:12px;">
                          <a href="https://www.instagram.com/aoro.cloud" style="margin:0 12px; color:#f97bd2; font-weight:600;">Instagram</a>
                          <span style="color:#cfd8dc;">•</span>
                          <a href="https://www.tiktok.com/@aoro.cloud" style="margin:0 12px; color:#f97bd2; font-weight:600;">TikTok</a>
                          <span style="color:#cfd8dc;">•</span>
                          <a href="https://www.aoro.co.uk" style="margin:0 12px; color:#f97bd2; font-weight:600;">aoro.co.uk</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:28px 0 0; font-size:12px; color:#9aa3ac;">AORO · Everywhere the crew meets the climb</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0; font-size:11px; color:#90a4ae;">You’re receiving this because you joined the AORO notify list.<br><a href="{{unsubscribe_url}}" style="color:#90a4ae;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const templateId = process.env.RESEND_TEMPLATE_ID;

    const emailPayload = {
      from: 'AORO <hello@aoro.co.uk>',
      to: email,
      subject: 'Thanks for joining the climb'
    };

    if (templateId) {
      emailPayload.template = {
        id: templateId,
        data: { name }
      };
    } else {
      emailPayload.html = htmlEmail;
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    console.log('Email sent via Resend', {
      status: response.status,
      id: result.id || null,
      to: email,
    });

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


