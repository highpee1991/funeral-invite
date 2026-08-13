import Image from "next/image";
import OrnateDivider from "./OrnateDivider";
import FloralSprig from "./FloralSprig";
import type { Event } from "../generated/prisma/client";

/**
 * The "Sister {name} (née Oku)" ... photo ... date/time/venue block shared
 * by the homepage and each guest's personal invite page, so both stay in
 * sync automatically. All content is pulled from the Event record passed
 * in -- nothing here is event-specific hardcoding except the "Sister" title
 * and "(née Oku)" maiden name, which were requested as fixed text for this
 * specific memorial.
 */
export default function MemorialHeader({ event }: { event: Event }) {
  return (
    <>
      <OrnateDivider className="w-24 sm:w-28 h-auto text-[#B08D57] mb-8" />

      <p
        className="fade-up text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B08D57] mb-3"
        style={{ animationDelay: "0.1s" }}
      >
        Celebrating the Life of
      </p>

      <h1
        className="font-display italic fade-up text-3xl sm:text-4xl md:text-5xl leading-tight mb-2 text-[#2E2A24]"
        style={{ animationDelay: "0.2s" }}
      >
        Sister {event.deceasedName}{" "}
        <span className="text-xl sm:text-2xl">(née Oku)</span>
      </h1>

      {(event.deceasedYearRange || event.deceasedAge) && (
        <p
          className="fade-up text-sm sm:text-base font-bold text-[#2E2A24] mb-8"
          style={{ animationDelay: "0.3s" }}
        >
          {event.deceasedYearRange || `Age ${event.deceasedAge}`}
        </p>
      )}

      <div
        className="fade-up relative mx-auto mb-8 w-48 sm:w-56"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full border-2 border-[#B08D57] overflow-hidden shadow-[0_6px_24px_rgba(46,42,36,0.15)] bg-white z-10">
          <Image
            src="/portrait.jpg"
            alt={event.deceasedName}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 flex items-start justify-center gap-0 opacity-[0.14]">
          <FloralSprig />
          <FloralSprig flip />
        </div>
      </div>

      <div
        className="fade-up space-y-1 text-sm"
        style={{ animationDelay: "0.6s" }}
      >
        <p className="font-display italic text-base sm:text-lg text-[#2E2A24]">
          {event.eventDate.toDateString()}
        </p>
        {event.eventTime && (
          <p className="text-[#B08D57]">{event.eventTime}</p>
        )}
        {event.venue && (
          <p className="whitespace-pre-line font-semibold text-[#57647A] leading-snug pt-1">
            {event.venue}
          </p>
        )}
      </div>
    </>
  );
}
