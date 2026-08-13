import { prisma } from "../../lib/prisma";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import Image from "next/image";
import MemorialHeader from "../../components/MemorialHeader";
import OrnateDivider from "../../components/OrnateDivider";

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

  // The QR code encodes the token -- this is what security will scan
  const qrDataUrl = await QRCode.toDataURL(token, { width: 300, margin: 2 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBF9F5]">
      {/* Decorative floral corner, muted to sit inside the restrained palette */}
      <Image
        src="/floral-corner.png"
        alt=""
        width={400}
        height={400}
        className="pointer-events-none select-none absolute -top-6 -left-8 w-36 sm:w-52 md:w-64 h-auto opacity-[0.18] grayscale sepia-[0.3]"
        priority
      />
      <Image
        src="/floral-corner.png"
        alt=""
        width={400}
        height={400}
        className="pointer-events-none select-none absolute -bottom-6 -right-8 w-36 sm:w-52 md:w-64 h-auto opacity-[0.18] grayscale sepia-[0.3] rotate-180"
      />

      {/* No SiteNav here on purpose -- this page is only ever reached via a
          guest's personal link, never navigated to from a menu. */}

      {/* Invitation card frame */}
      <div className="relative min-h-screen flex items-start justify-center px-4 sm:px-8 pt-10 sm:pt-14 pb-10">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-0 border border-[#2E2A24]/15" />

          <div className="relative flex flex-col items-center text-center px-6 sm:px-10 py-10 sm:py-14">
            <MemorialHeader event={event} />

            <OrnateDivider className="w-20 sm:w-24 h-auto text-[#B08D57]/70 mt-10 sm:mt-12 mb-6" />

            <p
              className="fade-up font-display italic text-sm sm:text-base text-[#2E2A24]/75 leading-relaxed mb-10 px-2"
              style={{ animationDelay: "0.7s" }}
            >
              &ldquo;...The hour is coming, those in the memorial tombs will
              hear his voice and come out&rdquo;
            </p>

            {/* Personal invite section */}
            <p
              className="fade-up text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B08D57] mb-2"
              style={{ animationDelay: "0.8s" }}
            >
              This Invitation Is Extended To
            </p>
            <p
              className="fade-up font-display italic text-xl sm:text-2xl text-[#2E2A24] mb-8"
              style={{ animationDelay: "0.85s" }}
            >
              {guest.fullName}
            </p>

            <div
              className="fade-up bg-white border border-[#2E2A24]/12 rounded-sm p-5 sm:p-6 mb-4"
              style={{ animationDelay: "0.9s" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Your entry QR code"
                className="mx-auto w-44 h-44 sm:w-48 sm:h-48"
              />
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#7A6F63] mt-3">
                Invite ID: {invite.id.slice(-8).toUpperCase()}
              </p>
            </div>

            <p
              className="fade-up text-xs text-[#7A6F63] max-w-xs"
              style={{ animationDelay: "0.95s" }}
            >
              Present this QR code at the door. Valid for one entry only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
