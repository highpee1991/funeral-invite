"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import SiteNav from "../components/SiteNav";
import HeadcountBadge from "../components/HeadcountBadge";
import LogoutButton from "../components/LogoutButton";

type InviteStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";

type ScanResult = {
  valid: boolean;
  reason?: string;
  inviteId?: string;
  guestName?: string;
  status?: InviteStatus;
};

/**
 * Triple-coded so a decision never depends on reading ability alone:
 * a command word (not a status noun), a color, and an icon shape are
 * always shown together. Exactly one action button is ever visible,
 * so there is never a wrong button sitting on screen to tap.
 */
const STATUS_CONFIG: Record<
  InviteStatus,
  {
    command: string;
    sub: string;
    border: string;
    bg: string;
    text: string;
    iconBg: string;
    icon: "check" | "caution" | "cross";
    action: { label: string; endpoint: "checkin" | "checkout" } | null;
  }
> = {
  NOT_CHECKED_IN: {
    command: "ALLOW ENTRY",
    sub: "Has not entered yet",
    border: "border-[#3E6A4C]",
    bg: "bg-[#EAF3EC]",
    text: "text-[#3E6A4C]",
    iconBg: "bg-[#3E6A4C]",
    icon: "check",
    action: { label: "Check In", endpoint: "checkin" },
  },
  CHECKED_OUT: {
    command: "ALLOW ENTRY",
    sub: "Re-entry — already checked out once",
    border: "border-[#3E6A4C]",
    bg: "bg-[#EAF3EC]",
    text: "text-[#3E6A4C]",
    iconBg: "bg-[#3E6A4C]",
    icon: "check",
    action: { label: "Check In", endpoint: "checkin" },
  },
  CHECKED_IN: {
    command: "ALREADY INSIDE",
    sub: "Do not check in again",
    border: "border-[#2E5C8A]",
    bg: "bg-[#E8EEF5]",
    text: "text-[#2E5C8A]",
    iconBg: "bg-[#2E5C8A]",
    icon: "caution",
    action: { label: "Check Out", endpoint: "checkout" },
  },
};

function StatusIcon({ shape }: { shape: "check" | "caution" | "cross" }) {
  if (shape === "check") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" aria-hidden="true">
        <path
          d="M5 12.5l4.5 4.5L19 7"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (shape === "cross") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // caution: a triangle, deliberately a different silhouette than the
  // circular check/cross so the shape reads correctly at a glance.
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" aria-hidden="true">
      <path d="M12 4.5l9 15.5H3l9-15.5z" fill="white" />
      <rect x="11.1" y="10" width="1.8" height="5" rx="0.9" fill="#2E5C8A" />
      <circle cx="12" cy="17" r="1" fill="#2E5C8A" />
    </svg>
  );
}

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;
    let isStarted = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (scanningRef.current) return;
          scanningRef.current = true;

          const res = await fetch("/api/invite-status", {
            method: "POST",
            body: JSON.stringify({ token: decodedText }),
          });
          const data: ScanResult = await res.json();
          setResult(data);
          setActionMessage(null);

          setTimeout(() => {
            scanningRef.current = false;
          }, 1500);
        },
        () => {},
      )
      .then(() => {
        isStarted = true;
      })
      .catch((err) => console.error("Camera start failed:", err));

    return () => {
      if (isStarted && scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  async function handleAction(endpoint: "checkin" | "checkout") {
    if (!result?.inviteId || actionPending) return;
    setActionPending(true);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ inviteId: result.inviteId }),
      });
      const data = await res.json();

      if (data.success) {
        const newStatus: InviteStatus =
          endpoint === "checkin" ? "CHECKED_IN" : "CHECKED_OUT";
        setResult((prev) => (prev ? { ...prev, status: newStatus } : prev));
        setActionMessage(
          endpoint === "checkin" ? "Entry recorded" : "Exit recorded",
        );
      } else {
        // Someone else likely actioned this invite a moment ago (e.g. two
        // door staff scanning the same guest). Reflect the server's real
        // status rather than leaving stale buttons on screen.
        setActionMessage(data.message ?? "Could not complete — rescan to retry");
      }
    } catch {
      setActionMessage("Network error — rescan to retry");
    } finally {
      setActionPending(false);
    }
  }

  const config = result?.valid && result.status ? STATUS_CONFIG[result.status] : null;

  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      <SiteNav />

      <main className="max-w-md mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 text-center">
        <div className="flex items-start justify-between gap-4 mb-1">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B08D57]">
            Door Access Control
          </p>
          <LogoutButton />
        </div>

        <h1 className="font-display italic text-3xl sm:text-4xl text-[#2E2A24] mb-4">
          Door Scanner
        </h1>

        <div className="flex justify-center mb-6">
          <HeadcountBadge />
        </div>

        <p className="text-xs tracking-[0.08em] uppercase font-semibold text-[#7A6F63] mb-3">
          Align QR Code Within Frame
        </p>

        <div
          id="reader"
          className="mb-6 mx-auto w-full max-w-xs aspect-square rounded-md overflow-hidden border-2 border-[#2E2A24]/15 shadow-[0_4px_24px_rgba(46,42,36,0.1)] bg-black [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
        />

        {result && (
          <div
            className={`fade-up rounded-md border-2 p-5 sm:p-6 text-left ${
              result.valid ? `${config!.border} ${config!.bg}` : "border-[#9A4B3F] bg-[#F7EAE8]"
            }`}
          >
            {result.valid && config ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${config.iconBg}`}
                  >
                    <StatusIcon shape={config.icon} />
                  </span>
                  <div>
                    <p
                      className={`font-black text-2xl sm:text-3xl leading-none tracking-tight ${config.text}`}
                    >
                      {config.command}
                    </p>
                    <p className="text-xs font-semibold text-[#7A6F63] mt-1">
                      {config.sub}
                    </p>
                  </div>
                </div>

                <p className="font-display italic text-xl sm:text-2xl text-[#2E2A24] mb-5 pb-5 border-b border-[#2E2A24]/10">
                  {result.guestName}
                </p>

                {config.action && (
                  <button
                    onClick={() => handleAction(config.action!.endpoint)}
                    disabled={actionPending}
                    className={`w-full text-white text-sm font-bold tracking-[0.04em] uppercase px-4 py-4 rounded-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      config.action.endpoint === "checkin"
                        ? "bg-[#3E6A4C] hover:bg-[#345C40]"
                        : "bg-[#2E5C8A] hover:bg-[#264C73]"
                    }`}
                  >
                    {actionPending ? "Recording…" : config.action.label}
                  </button>
                )}
              </>
            ) : !result.valid ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#9A4B3F] shrink-0">
                  <StatusIcon shape="cross" />
                </span>
                <div>
                  <p className="font-black text-2xl sm:text-3xl leading-none tracking-tight text-[#9A4B3F]">
                    DO NOT ALLOW ENTRY
                  </p>
                  <p className="text-xs font-semibold text-[#7E3C32] mt-1">
                    {result.reason ?? "Invalid invite"}
                  </p>
                </div>
              </div>
            ) : null}

            {actionMessage && (
              <p className="mt-4 pt-4 border-t border-[#2E2A24]/10 text-sm font-semibold text-[#2E2A24]">
                {actionMessage}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
