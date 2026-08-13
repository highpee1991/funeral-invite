"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import HeadcountBadge from "../components/HeadcountBadge";
import LogoutButton from "../components/LogoutButton";

type ScanResult = {
  valid: boolean;
  reason?: string;
  inviteId?: string;
  guestName?: string;
  status?: string;
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
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="mb-2">
        <LogoutButton />
      </div>
      <h1 className="text-xl font-bold mb-4">Door Scanner</h1>
      <div className="mb-4">
        <HeadcountBadge />
      </div>
      <div id="reader" className="mb-6" />

      {result && (
        <div
          className={`border rounded-lg p-4 ${
            result.valid ? "border-green-500" : "border-red-500"
          }`}
        >
          {result.valid ? (
            <>
              <p className="font-semibold text-lg">{result.guestName}</p>
              <p className="text-sm text-gray-500 mb-4">
                Current status: {result.status}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCheckIn}
                  disabled={result.status === "CHECKED_IN"}
                  className="bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                >
                  Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={result.status !== "CHECKED_IN"}
                  className="bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
                >
                  Check Out
                </button>
              </div>
            </>
          ) : (
            <p className="text-red-600 font-semibold">
              {result.reason ?? "Invalid invite"}
            </p>
          )}

          {actionMessage && <p className="mt-4 font-medium">{actionMessage}</p>}
        </div>
      )}
    </div>
  );
}
