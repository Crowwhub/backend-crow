import { NotificationType } from 'generated/prisma';

export interface DigestLine {
  type: NotificationType;
  count: number;
  /** Human label already pluralized, e.g. "3 new messages". */
  label: string;
}

export interface DigestSummary {
  /** Optional greeting name. */
  name?: string | null;
  lines: DigestLine[];
  total: number;
  /** Destination for the CTA button. */
  appUrl: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// Singular/plural copy per notification type. `n` is the count.
const COPY: Record<NotificationType, (n: number) => string> = {
  NEW_MESSAGE: (n) => `${n} new message${n === 1 ? '' : 's'}`,
  COLLAB_REQUEST: (n) =>
    `${n} collaboration request${n === 1 ? '' : 's'}`,
  PROJECT_INVITE: (n) => `${n} new project invite${n === 1 ? '' : 's'}`,
  NEW_MATCH: (n) => `${n} new match${n === 1 ? '' : 'es'}`,
  PROFILE_INTERACTION: (n) =>
    `${n} new profile interaction${n === 1 ? '' : 's'}`,
};

// Stable display order for the lines in the email.
const ORDER: NotificationType[] = [
  'NEW_MESSAGE',
  'COLLAB_REQUEST',
  'PROJECT_INVITE',
  'NEW_MATCH',
  'PROFILE_INTERACTION',
];

/** Build the human label for a (type, count) pair. */
export function labelFor(type: NotificationType, count: number): string {
  return COPY[type](count);
}

/** Sort digest lines into the canonical display order. */
export function orderLines(lines: DigestLine[]): DigestLine[] {
  return [...lines].sort(
    (a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type),
  );
}

export function renderDigestEmail(summary: DigestSummary): RenderedEmail {
  const subject = 'You have new activity on CrowHub';
  const lines = orderLines(summary.lines);
  const greeting = summary.name ? `Hi ${escapeHtml(summary.name)},` : 'Hi there,';

  const bulletsHtml = lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;font-size:16px;color:#1a1a1a;">• ${escapeHtml(
          l.label,
        )}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px 36px;max-width:480px;">
            <tr>
              <td style="font-size:22px;font-weight:700;color:#111;padding-bottom:8px;">CrowHub</td>
            </tr>
            <tr>
              <td style="font-size:16px;color:#444;padding-bottom:20px;">${greeting}</td>
            </tr>
            <tr>
              <td style="font-size:16px;color:#444;padding-bottom:12px;">Here's what you missed:</td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${bulletsHtml}</table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;">
                <a href="${encodeURI(summary.appUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 28px;border-radius:10px;">Open CrowHub</a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:28px;font-size:12px;color:#999;">You're receiving this because there was new activity on your CrowHub account. We only send a summary every few hours — never an email per event.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    greeting.replace(/<[^>]+>/g, ''),
    '',
    "Here's what you missed:",
    ...lines.map((l) => `• ${l.label}`),
    '',
    `Open CrowHub: ${summary.appUrl}`,
  ].join('\n');

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
