export type EmailAddress = {
  email: string
  name?: string
}

export type EmailRecipient = string | EmailAddress

export type SendEmailMessage = {
  to: EmailRecipient | Array<EmailRecipient>
  from: EmailRecipient
  subject: string
  html?: string
  text?: string
  cc?: EmailRecipient | Array<EmailRecipient>
  bcc?: EmailRecipient | Array<EmailRecipient>
  replyTo?: EmailRecipient
}

export type EmailSendResult = {
  messageId: string
}

/** Cloudflare Email Service Workers binding. */
export type SendEmail = {
  send(message: SendEmailMessage): Promise<EmailSendResult>
}
