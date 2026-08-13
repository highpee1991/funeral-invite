"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import SiteNav from "../components/SiteNav";
import HeadcountBadge from "../components/HeadcountBadge";
import LogoutButton from "../components/LogoutButton";

type ScanResult = {
  valid: boolean;
  reason?: string;
  inviteId?: string;
  guestName?: string;
  status?: string;
};

const STATUS_LABEL: Record<string, string> = {
  NOT_CHECKED_IN: "Not Checked In",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
};

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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

  async function handleCheckIn() {
    if (!result?.inviteId) return;
    const res = await fetch("/api/checkin", {
      method: "POST",
      body: JSON.stringify({ inviteId: result.inviteId }),
    });
    const data = await res.json();
    setActionMessage(data.message);
  }

  async function handleCheckOut() {
    if (!result?.inviteId) return;
    const res = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ inviteId: result.inviteId }),
    });
    const data = await res.json();
    setActionMessage(data.message);
  }

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
              result.valid
                ? "border-[#3E6A4C] bg-[#EAF3EC]"
                : "border-[#9A4B3F] bg-[#F7EAE8]"
            }`}
          >
            {result.valid ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3E6A4C] text-white text-sm font-bold shrink-0">
                    ✓
                  </span>
                  <span className="text-[11px] tracking-[0.1em] uppercase font-bold text-[#3E6A4C]">
                    Valid Invite
                  </span>
                </div>

                <p className="font-display italic text-xl sm:text-2xl text-[#2E2A24] mb-2">
                  {result.guestName}
                </p>

                {result.status && (
                  <p className="text-xs tracking-[0.06em] uppercase font-semibold text-[#7A6F63] mb-5">
                    Current Status:{" "}
                    <span className="text-[#2E2A24]">
                      {STATUS_LABEL[result.status] ?? result.status}
                    </span>
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={result.status === "CHECKED_IN"}
                    className="flex-1 bg-[#3E6A4C] hover:bg-[#345C40] disabled:opacity-40 disabled:hover:bg-[#3E6A4C] disabled:cursor-not-allowed text-white text-sm font-bold tracking-[0.04em] uppercase px-4 py-3.5 rounded-sm transition-colors"
                  >
                    Check In
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={result.status !== "CHECKED_IN"}
                    className="flex-1 bg-[#B08D57] hover:bg-[#9C7A49] disabled:opacity-40 disabled:hover:bg-[#B08D57] disabled:cursor-not-allowed text-white text-sm font-bold tracking-[0.04em] uppercase px-4 py-3.5 rounded-sm transition-colors"
                  >
                    Check Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#9A4B3F] text-white text-sm font-bold shrink-0">
                  ✕
                </span>
                <div>
                  <p className="text-[11px] tracking-[0.1em] uppercase font-bold text-[#9A4B3F] mb-1">
                    Invalid Invite
                  </p>
                  <p className="text-[#7E3C32] font-semibold text-base">
                    {result.reason ?? "Invalid invite"}
                  </p>
                </div>
              </div>
            )}

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
