"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SiteNav from "../components/SiteNav";
import OrnateDivider from "../components/OrnateDivider";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.success) {
        router.push(data.role === "admin" ? "/admin/guests" : "/scan");
        router.refresh();
        // Deliberately leave isSubmitting true here: the button should stay
        // disabled/spinning through the navigation instead of flashing back
        // to an idle "Log In" state right before the page changes.
      } else {
        setError("Incorrect password");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out — check your connection and try again"
          : "Could not reach the server — try again",
      );
      setIsSubmitting(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBF9F5]">
      {/* Decorative floral corners, same restrained treatment as the home page */}
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

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 pt-24 sm:pt-20 pb-8">
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-0 border border-[#2E2A24]/15" />

          <div className="relative flex flex-col items-center text-center px-6 sm:px-10 py-10 sm:py-12">
            <OrnateDivider className="w-20 sm:w-24 h-auto text-[#B08D57] mb-8" />

            <p className="fade-up text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B08D57] mb-3">
              Staff Access
            </p>

            <h1 className="fade-up font-display italic text-2xl sm:text-3xl leading-tight mb-2 text-[#2E2A24]">
              Sign In
            </h1>

            <p
              className="fade-up text-xs sm:text-sm text-[#7A6F63] mb-8"
              style={{ animationDelay: "0.1s" }}
            >
              Enter your staff password to continue to Admin or Door Scan.
            </p>

            <form
              onSubmit={handleSubmit}
              className="fade-up w-full flex flex-col gap-4"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-left">
                <label
                  htmlFor="password"
                  className="block text-xs tracking-[0.1em] uppercase text-[#7A6F63] mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-[#2E2A24]/20 rounded-sm px-4 py-2.5 text-sm text-[#2E2A24] bg-white placeholder:text-[#2E2A24]/30 focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57] transition-colors disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2E2A24] text-[#FBF9F5] text-xs tracking-[0.14em] uppercase font-bold px-4 py-3 rounded-sm hover:bg-[#B08D57] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B08D57] focus-visible:ring-offset-2 disabled:opacity-70 disabled:hover:bg-[#2E2A24] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <span
                    className="inline-block w-3.5 h-3.5 border-2 border-[#FBF9F5]/40 border-t-[#FBF9F5] rounded-full animate-spin"
                    aria-hidden="true"
                  />
                )}
                {isSubmitting ? "Signing In…" : "Log In"}
              </button>

              {error && (
                <p className="text-xs text-[#9A4B3F] -mt-1" role="alert">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
