import { prisma } from "./lib/prisma";
import Image from "next/image";
import SiteNav from "./components/SiteNav";
import MemorialHeader from "./components/MemorialHeader";

export default async function HomePage() {
  const event = await prisma.event.findFirst({ orderBy: { createdAt: "asc" } });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No event has been set up yet.</p>
      </div>
    );
  }

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

      <SiteNav />

      {/* Invitation card frame */}
      <div className="relative min-h-screen flex items-start justify-center px-4 sm:px-8 pt-16 sm:pt-20 pb-8">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-0 border border-[#2E2A24]/15" />

          <div className="relative flex flex-col items-center text-center px-6 sm:px-10 py-10 sm:py-14">
            <MemorialHeader event={event} />

            <p
              className="fade-up font-display italic text-sm sm:text-base text-[#2E2A24]/75 leading-relaxed mt-24 sm:mt-28 mb-8 px-2"
              style={{ animationDelay: "0.7s" }}
            >
              &ldquo;...The hour is coming, those in the memorial tombs will
              hear his voice and come out&rdquo;
            </p>

            <p
              className="fade-up text-xs text-[#7A6F63]"
              style={{ animationDelay: "0.8s" }}
            >
              Entry is by invitation. Please check your WhatsApp for your
              personal invite and QR code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
