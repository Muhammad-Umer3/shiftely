/**
 * WhatsApp notification service using Twilio.
 * Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in .env
 */

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return null
  try {
    const twilio = require('twilio')
    return twilio(accountSid, authToken)
  } catch {
    return null
  }
}

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits.startsWith('+') ? phone : `+${digits}`
}

export class WhatsAppService {
  static async sendWhatsApp(
    to: string | null | undefined,
    body: string
  ): Promise<boolean> {
    const normalized = normalizePhone(to)
    if (!normalized) return false

    const client = getTwilioClient()
    const from = process.env.TWILIO_WHATSAPP_NUMBER
    if (!client || !from) {
      return false
    }

    try {
      await client.messages.create({
        body,
        from: `whatsapp:${from.replace(/^\s+|\s+$/g, '')}`,
        to: `whatsapp:${normalized}`,
      })
      return true
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return false
    }
  }
}
