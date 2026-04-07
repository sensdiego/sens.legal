import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'silo@sens.legal';
const portalBase = process.env.PORTAL_BASE_URL ?? 'https://sens.legal';

function client(): Resend | null {
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendApprovedEmail(args: { to: string; name: string }): Promise<void> {
  const resend = client();
  if (!resend) return;

  await resend.emails.send({
    from: fromAddr,
    to: args.to,
    subject: "You're in — Silo Technical Data Room",
    text: `Welcome, ${args.name}.

Your access to the Silo technical data room has been approved. Visit
${portalBase}/inside to start.

The data room is structured as 7 chapters meant to be read in order;
total reading time is roughly 30 minutes. Each chapter is also designed
to stand alone if you'd rather skim.

If anything is unclear, write to diego@sens.legal.

— Silo`,
  });
}

// Note: the new-request notification email is inlined in
// portal/src/pages/api/auth/callback.ts (Task E5) because that file
// already imports Resend directly and the message is single-use.
