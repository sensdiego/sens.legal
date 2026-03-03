import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email = body?.email?.toString();

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return new Response(JSON.stringify({ error: 'Waitlist not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.contacts.create({
      email,
      audienceId,
    });

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to sens.legal',
      html: `<p>Thanks for joining the sens.legal waitlist.</p>
<p>We're building legal intelligence infrastructure for Brazilian law — semantic search over real court data, a knowledge graph on the FRBR ontology, anti-hallucination verification, and native LLM integration.</p>
<p>We'll reach out when early access is available.</p>
<p>— Diego Sens<br/>Founder, sens.legal</p>`,
    }).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to join waitlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
