"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Site nav bar.
 *
 * Transparent with a faint hairline while at the top of the page; gains a
 * soft frosted-glass background, a firmer hairline, and a subtle shadow
 * once the page scrolls, so it stays legible over content on every screen
 * size from phone through desktop.
 *
 * Links: Home (/) on the left, Admin (/admin/guests) and Door Scan (/scan)
 * grouped on the right, separated by a thin divider. The active route is
 * highlighted in gold with an underline. /admin and /scan are already
 * role-gated by middleware.ts (redirect to /login if unauthorized), so
 * showing the links here is presentation only -- no auth logic added.
 * /login itself is still reachable directly by URL; it's just not linked
 * from this nav.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkBase =
    "relative py-2 text-[11px] sm:text-xs tracking-[0.14em] uppercase font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B08D57] focus-visible:ring-offset-2 rounded-sm";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const linkClass = (href: string) =>
    `${linkBase} ${
      isActive(href)
        ? "text-[#B08D57]"
        : "text-[#1F1B16] hover:text-[#B08D57]"
    } after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-[#B08D57] after:transition-all after:duration-300 ${
      isActive(href) ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-20 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-[#2E2A24]/12 shadow-[0_1px_12px_rgba(46,42,36,0.06)]"
          : "bg-white/0 border-b border-[#2E2A24]/8"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className={linkClass("/")}>
          Home
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* prefetch={false}: these are auth-gated pages, and /scan in
              particular pulls in the heavy html5-qrcode camera bundle.
              Letting Next.js prefetch them in the background (e.g. while
              this nav sits on the login page) can tie up compilation/
              network right as someone is trying to log in, making the
              login submit appear to hang. Nothing is lost by disabling
              prefetch here since these routes require a real navigation
              (and a cookie check) anyway. */}
          <Link href="/admin/guests" prefetch={false} className={linkClass("/admin")}>
            Admin
          </Link>
          <span className="h-3 w-px bg-[#2E2A24]/15" aria-hidden="true" />
          <Link href="/scan" prefetch={false} className={linkClass("/scan")}>
            Door Scan
          </Link>
        </div>
      </div>
    </nav>
  );
}
