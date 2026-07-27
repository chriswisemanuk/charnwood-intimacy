/*
  Cloudflare Worker: serves the static site and processes the booking and
  contact forms via Brevo transactional email, mirroring the setup used on
  the Charnwood Counselling WordPress site.

  Required configuration (see README):
    - Secret  BREVO_API_KEY   your Brevo API key (set with `wrangler secret put
                              BREVO_API_KEY` or in the Cloudflare dashboard under
                              the Worker's Settings > Variables & Secrets)
    - Var     SENDER_EMAIL    verified Brevo sender (e.g. talk@charnwoodintimacy.co.uk)
    - Var     SENDER_NAME     e.g. "Charnwood Intimacy"
    - Var     NOTIFY_EMAIL    where form submissions are delivered (e.g. talk@charnwoodintimacy.co.uk)
    - Secret  TURNSTILE_SECRET_KEY  the SECRET key for the Turnstile widget
                              (the site key is public and lives in src/consts.ts).
                              If this secret is not set, Turnstile verification is
                              skipped so the forms keep working, and a warning is
                              logged. Set it as soon as the widget is created.
*/

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const TURNSTILE_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const FORMS = {
  '/api/booking': {
    subjectToPractice: 'Charnwood Intimacy Booking Request Form',
    subjectToClient: 'Charnwood Intimacy Booking Request Received',
    clientMessage: [
      'Thank you for completing a booking request with Charnwood Intimacy.',
      "We will get back to you as soon as we can to discuss your request and find a suitable time for an assessment to take place.",
      "If you have any questions in the meantime, don't hesitate to get in touch.",
    ],
    redirect: '/booking-thank-you/',
    fields: [
      ['name', 'Your Name'],
      ['email', 'Your Email'],
      ['phone', 'Your Mobile'],
      ['Sessions to take place', 'I would prefer my sessions to take place'],
      ['Ideal start', 'When would you ideally like to start?'],
      ['Preferred days', 'What days would you prefer sessions to take place?'],
      ['Preferred times', 'What time(s) of day are best for you?'],
      ['About you', 'About'],
    ],
  },
  '/api/contact': {
    subjectToPractice: 'Charnwood Intimacy Contact Form',
    subjectToClient: 'Charnwood Intimacy - Message Received',
    clientMessage: [
      'Thank you for getting in touch with Charnwood Intimacy.',
      'We will get back to you as soon as we can.',
    ],
    redirect: '/contact-thank-you/',
    fields: [
      ['name', 'Your Name'],
      ['email', 'Your Email'],
      ['phone', 'Mobile Number'],
      ['message', 'Your Message'],
    ],
  },
};

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/*
  Verify the Turnstile token server-side. The widget on its own proves nothing:
  a bot can post any string to this endpoint, so the token must be checked
  against Cloudflare. Tokens are single use and expire after five minutes.
*/
async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.log('TURNSTILE_SECRET_KEY not set, skipping verification');
    return { ok: true, skipped: true };
  }
  if (!token) {
    return { ok: false, reason: 'missing-token' };
  }

  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.append('remoteip', ip);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(TURNSTILE_ENDPOINT, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    const result = await res.json();
    if (!result.success) {
      console.log('Turnstile rejected:', (result['error-codes'] || []).join(', '));
      return { ok: false, reason: 'failed' };
    }
    return { ok: true };
  } catch (e) {
    console.log('Turnstile verification error:', e.message);
    return { ok: false, reason: 'error' };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendBrevo(env, payload) {
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo ${res.status}: ${text.slice(0, 300)}`);
  }
}

async function handleForm(request, env, config, origin) {
  const data = await request.formData();

  // Honeypot first: it costs nothing and stops naive bots before we spend a
  // Turnstile verification on them. Pretend success so they learn nothing.
  if (data.get('botcheck')) {
    return { ok: true };
  }

  const turnstile = await verifyTurnstile(request, env, data.get('cf-turnstile-response'));
  if (!turnstile.ok) {
    return { ok: false, error: 'Verification failed. Please try again.' };
  }

  const clientEmail = (data.get('email') || '').toString().trim();
  const clientName = (data.get('name') || '').toString().trim();
  if (!clientEmail || !clientName) {
    return { ok: false, error: 'Missing required fields.' };
  }

  // Practice notification: a simple table of everything submitted
  const rows = config.fields
    .map(([key, label]) => {
      const values = data.getAll(key).map((v) => v.toString().trim()).filter(Boolean);
      if (!values.length) return '';
      return `<tr><td style="padding:6px 14px 6px 0;vertical-align:top;"><strong>${esc(label)}</strong></td>` +
             `<td style="padding:6px 0;white-space:pre-wrap;">${esc(values.join(', '))}</td></tr>`;
    })
    .filter(Boolean)
    .join('');

  const sender = { email: env.SENDER_EMAIL, name: env.SENDER_NAME || 'Charnwood Intimacy' };

  await sendBrevo(env, {
    sender,
    to: [{ email: env.NOTIFY_EMAIL }],
    replyTo: { email: clientEmail, name: clientName },
    subject: config.subjectToPractice,
    htmlContent:
      `<html><body style="font-family:Georgia,serif;color:#1d2327;">` +
      `<table cellpadding="0" cellspacing="0">${rows}</table>` +
      `</body></html>`,
  });

  // Confirmation to the client. If this fails, the practice still has the
  // enquiry, so treat it as non-fatal.
  try {
    const paragraphs = config.clientMessage
      .map((p) => `<p style="margin:0 0 1em 0;">${esc(p)}</p>`)
      .join('');
    await sendBrevo(env, {
      sender,
      to: [{ email: clientEmail, name: clientName }],
      replyTo: { email: env.NOTIFY_EMAIL },
      subject: config.subjectToClient,
      htmlContent:
        `<html><body style="font-family:Georgia,serif;color:#1d2327;">${paragraphs}</body></html>`,
    });
  } catch (e) {
    console.log('Client confirmation failed:', e.message);
  }

  return { ok: true };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const config = FORMS[url.pathname];

    if (config && request.method === 'POST') {
      let result;
      try {
        result = await handleForm(request, env, config, url.origin);
      } catch (e) {
        console.log('Form error:', e.message);
        result = { ok: false, error: 'Sending failed.' };
      }

      const wantsJson = (request.headers.get('accept') || '').includes('application/json');
      if (wantsJson) {
        return new Response(JSON.stringify({ success: result.ok }), {
          status: result.ok ? 200 : 500,
          headers: { 'content-type': 'application/json' },
        });
      }
      // Plain form post (no JavaScript): redirect to the thank-you page
      if (result.ok) {
        return Response.redirect(url.origin + config.redirect, 303);
      }
      return Response.redirect(url.origin + '/contact/?error=1', 303);
    }

    return env.ASSETS.fetch(request);
  },
};
