// Sail-Oid Hamlet Welcome Email
// Fires when someone claims their berth in the marina

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { email, name, hamlet } = JSON.parse(event.body);
    if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log('No Resend API key — skipping email');
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Email skipped (no API key)' }) };
    }

    const firstName = name ? name.split(' ')[0] : 'friend';
    const hamletUrl = `https://sail-oid.co.uk/hamlet/${hamlet}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Berth is Ready — Sail-Oid Village</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #071e33; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0c2a44; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">

    <div style="background: linear-gradient(180deg, #071e33 0%, #0c3547 40%, #0e6080 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #0ea5e9;">
      <div style="font-size: 52px; margin-bottom: 10px;">⛵</div>
      <h1 style="color: #bae6fd; margin: 0; font-size: 28px; font-weight: 800;">Your Berth is Ready, ${firstName}!</h1>
      <p style="color: rgba(186,230,253,0.6); margin: 10px 0 0 0; font-size: 16px;">Sail-Oid Marina Village</p>
    </div>

    <div style="padding: 32px 30px;">
      <p style="color: #bae6fd; font-size: 17px; line-height: 1.7;">
        Dave the RAVE has logged your arrival. Your berth is in the marina — your boat, your kit, your story. The tide's in. Lines are fast.
      </p>

      <div style="background: rgba(14,96,128,0.2); border-radius: 14px; padding: 22px; margin: 24px 0; border-left: 4px solid #0ea5e9;">
        <h3 style="color: #38bdf8; margin: 0 0 12px 0; font-size: 17px;">What you can do from your berth:</h3>
        <ul style="color: #7dd3fc; margin: 0; padding-left: 20px; line-height: 2;">
          <li>Identify any boat, sail, engine or piece of kit with AI</li>
          <li>Ask Dave anything — RAVE to the sea, 30 years afloat</li>
          <li>Add your kit locker, your YouTube video, your eBay stall</li>
          <li>Connect with other sailors, racers, and live-aboards</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${hamletUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #071e33; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">
          View Your Berth →
        </a>
      </div>

      <p style="color: #7dd3fc; font-size: 15px; line-height: 1.7;">
        Your edit link was shown on the confirmation screen — bookmark it. That's how you add kit, video, and your eBay stall. Lost it? Reply here and we'll sort you out.
      </p>

      <hr style="border: none; border-top: 1px solid rgba(14,165,233,0.15); margin: 28px 0;">

      <p style="color: rgba(186,230,253,0.4); font-size: 14px; text-align: center; line-height: 1.7;">
        Support the village on <a href="https://www.patreon.com/chrisptee" style="color: #38bdf8;">Patreon from £3/mo</a> to unlock everything.<br>
        Keeps the marina lights on.
      </p>
    </div>

    <div style="background: #071e33; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(14,165,233,0.15);">
      <p style="color: rgba(186,230,253,0.55); margin: 0; font-size: 15px; font-style: italic;">
        "World domination through kindness. One ember at a time."
      </p>
      <p style="color: rgba(186,230,253,0.25); margin: 12px 0 0 0; font-size: 12px;">
        Sail-Oid Marina Village · Part of <a href="https://feelfamous.co.uk" style="color: #38bdf8;">FeelFamous</a><br>
        Questions? Reply to this email or WhatsApp: <a href="https://wa.me/447976884254" style="color: #38bdf8;">07976 884254</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Sail-Oid <welcome@sail-oid.co.uk>',
        to: email,
        subject: `Your berth is ready, ${firstName}! ⛵`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend error:', response.status, errorText);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Email queued' }) };
    }

    const result = await response.json();
    console.log('Sail-Oid hamlet welcome sent:', result.id, 'to:', email);
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Email sent', id: result.id }) };

  } catch (error) {
    console.error('hamlet-welcome error:', error);
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Email queued', error: error.message }) };
  }
};
