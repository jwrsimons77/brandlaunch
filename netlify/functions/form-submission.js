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

    // Send templated email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AORO <hello@aoro.co.uk>',
        to: email,
        subject: 'Thanks for joining the climb',
        template: {
          name: 'welcome-cloud-piercers',
          data: { name }
        }
      })
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


