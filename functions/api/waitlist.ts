// Cloudflare Pages Function that accepts a waitlist signup and forwards
// the email to MailerLite's Subscribers API.
//
// Required environment variables (set in Cloudflare Pages → Settings → Environment variables):
//   MAILERLITE_API_TOKEN   (encrypted)  — scope: subscribers:write
//   MAILERLITE_GROUP_ID    (plain)      — numeric group ID to add subscribers to
//
// Opt-in behavior (single vs double) is configured on the MailerLite group,
// not here. The API call does not force a status.

interface Env {
  MAILERLITE_API_TOKEN: string;
  MAILERLITE_GROUP_ID: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let email: string;
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  if (!env.MAILERLITE_API_TOKEN || !env.MAILERLITE_GROUP_ID) {
    console.error('MAILERLITE_API_TOKEN or MAILERLITE_GROUP_ID not configured');
    return json({ ok: false, error: 'Waitlist is not yet configured.' }, 503);
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MAILERLITE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        groups: [env.MAILERLITE_GROUP_ID],
      }),
    });

    // MailerLite returns 200 for new subscribers and 200/201 for updates.
    // Duplicates are not an error — MailerLite upserts by email.
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('MailerLite API error:', response.status, errorBody);
      return json({ ok: false, error: 'Something went wrong. Please try again.' }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('Waitlist submit error:', error);
    return json({ ok: false, error: 'Network error. Please try again.' }, 502);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
