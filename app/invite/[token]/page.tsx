import { prisma } from "../../lib/prisma";
import QRCode from "qrcode";
import { notFound } from "next/navigation";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { guest: { include: { event: true } } },
  });

  if (!invite) return notFound();

  const { guest } = invite;
  const { event } = guest;

  // The QR code encodes the token — this is what security will scan
  const qrDataUrl = await QRCode.toDataURL(token, { width: 300, margin: 2 });

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">
        In Loving Memory
      </p>
      <h1 className="text-2xl font-bold mb-1">{event.deceasedName}</h1>
      {event.deceasedAge && (
        <p className="text-gray-600 mb-4">Age {event.deceasedAge}</p>
      )}

      <p className="mb-6 text-gray-700">{event.description}</p>

      <div className="border rounded-lg p-4 mb-6 text-left">
        <p><strong>Date:</strong> {event.eventDate.toDateString()}</p>
        {event.eventTime && <p><strong>Time:</strong> {event.eventTime}</p>}
        {event.venue && <p><strong>Venue:</strong> {event.venue}</p>}
      </div>

      <div className="border-t pt-6">
        <p className="text-lg font-semibold">{guest.fullName}</p>
        <p className="text-sm text-gray-500 mb-4">
          Invite ID: {invite.id.slice(-8).toUpperCase()}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Your entry QR code"
          className="mx-auto"
        />
        <p className="text-xs text-gray-400 mt-2">
          Present this QR code at the door. Valid for one entry only.
        </p>
      </div>
    </div>
  );
}