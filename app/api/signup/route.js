export async function POST(request) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return Response.json({ success: false, error: 'Name and email are required' }, { status: 400 });
    }

    const [firstName, ...lastParts] = name.trim().split(' ');
    const lastName = lastParts.join(' ');
    const results = { mailchimp: null, square: null };
    const errors = [];

    // --- MAILCHIMP ---
    try {
      const MC_KEY = process.env.MAILCHIMP_API_KEY;
      const MC_LIST = process.env.MAILCHIMP_LIST_ID;
      const MC_SERVER = process.env.MAILCHIMP_SERVER;

      if (MC_KEY && MC_LIST && MC_SERVER) {
        const mcResp = await fetch(
          `https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST}/members`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from('any:' + MC_KEY).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: email,
              status: 'subscribed',
              merge_fields: { FNAME: firstName, LNAME: lastName, PHONE: phone || '' },
            }),
          }
        );
        const mcData = await mcResp.json();
        if (mcResp.ok || mcData.title === 'Member Exists') {
          results.mailchimp = 'success';
        } else {
          throw new Error(mcData.detail || 'Mailchimp error');
        }
      } else {
        results.mailchimp = 'skipped';
      }
    } catch (err) {
      console.error('Mailchimp error:', err.message);
      errors.push('Mailchimp: ' + err.message);
      results.mailchimp = 'error';
    }

    // --- SQUARE ---
    try {
      const SQ_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

      if (SQ_TOKEN) {
        const sqResp = await fetch('https://connect.squareup.com/v2/customers', {
          method: 'POST',
          headers: {
            'Square-Version': '2024-01-18',
            Authorization: `Bearer ${SQ_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            given_name: firstName,
            family_name: lastName || undefined,
            email_address: email,
            phone_number: phone || undefined,
            note: 'Website signup - Lighthouse Family',
            idempotency_key: email + '-' + Date.now(),
          }),
        });
        const sqData = await sqResp.json();
        if (sqResp.ok) {
          results.square = 'success';
        } else {
          throw new Error(JSON.stringify(sqData.errors));
        }
      } else {
        results.square = 'skipped';
      }
    } catch (err) {
      console.error('Square error:', err.message);
      errors.push('Square: ' + err.message);
      results.square = 'error';
    }

    const anySuccess = results.mailchimp === 'success' || results.square === 'success';
    const bothSkipped = results.mailchimp === 'skipped' && results.square === 'skipped';

    return Response.json({
      success: anySuccess || bothSkipped,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Signup route error:', err);
    return Response.json({ success: false, error: 'Server error' }, { status: 500 });
  }
  }
