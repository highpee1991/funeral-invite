import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendInviteWhatsApp(
  guestPhone: string,
  guestName: string,
  inviteLink: string
) {
  // Twilio numbers must be in international format with no spaces, e.g. +2348012345678
  const to = `whatsapp:${guestPhone}`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to,
    body: `Hello ${guestName}, you're invited to Sister Emunefe Ajeno Sarah burial. Please view your personal invitation and entry QR code here: ${inviteLink}\n\nPresent this at the door — valid for one entry only.`,
  });
}