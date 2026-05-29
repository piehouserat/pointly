import type { EmailRecipient, SendEmail, SendEmailMessage } from "./types"

export async function sendEmail(
  email: SendEmail,
  message: SendEmailMessage
) {
  return email.send(message)
}

type SendTestEmailOptions = {
  to: string
  from: EmailRecipient
}

export async function sendTestEmail(
  email: SendEmail,
  { to, from }: SendTestEmailOptions
) {
  return sendEmail(email, {
    to,
    from,
    subject: "Pointly test email",
    html: "<h1>Pointly test email</h1><p>Cloudflare Email Service is working.</p>",
    text: "Pointly test email\n\nCloudflare Email Service is working.",
  })
}
