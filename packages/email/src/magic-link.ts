import { sendEmail } from "./send"
import type { EmailRecipient, SendEmail } from "./types"

type SendMagicLinkEmailOptions = {
  to: string
  from: EmailRecipient
  url: string
}

export async function sendMagicLinkEmail(
  email: SendEmail,
  { to, from, url }: SendMagicLinkEmailOptions
) {
  return sendEmail(email, {
    to,
    from,
    subject: "Sign in to Pointly",
    html: `<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827;">
    <h1 style="font-size: 20px; margin-bottom: 16px;">Sign in to Pointly</h1>
    <p style="margin-bottom: 24px;">Click the button below to sign in. This link expires in 5 minutes.</p>
    <p style="margin-bottom: 24px;">
      <a href="${url}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
        Sign in to Pointly
      </a>
    </p>
    <p style="font-size: 14px; color: #6b7280;">If you did not request this email, you can ignore it.</p>
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${url}</p>
  </body>
</html>`,
    text: `Sign in to Pointly\n\nClick the link below to sign in. This link expires in 5 minutes.\n\n${url}\n\nIf you did not request this email, you can ignore it.`,
  })
}
