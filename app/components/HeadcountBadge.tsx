"use client";

import { useEffect, useState } from "react";

export default function HeadcountBadge() {
  const [data, setData] = useState<{ checkedIn: number; capacity: number } | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const res = await fetch("/api/count");
      const json = await res.json();
      setData(json);
    }
    fetchCount();
    const interval = setInterval(fetchCount, 4000); // poll every 4 seconds
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const isNearCapacity = data.checkedIn >= data.capacity * 0.9;
  const isOverCapacity = data.checkedIn >= data.capacity;

  return (
    <div
      className={`inline-flex items-baseline gap-1.5 px-4 py-2 rounded-sm border text-sm font-bold tracking-wide ${
        isOverCapacity
          ? "bg-[#9A4B3F] border-[#9A4B3F] text-white"
          : isNearCapacity
          ? "bg-[#B08D57]/10 border-[#B08D57] text-[#8A6B3F]"
          : "bg-white border-[#2E2A24]/15 text-[#2E2A24]"
      }`}
    >
      <span>{data.checkedIn}</span>
      <span className="opacity-60 font-normal">/ {data.capacity}</span>
      <span className="text-[11px] tracking-[0.1em] uppercase font-semibold opacity-70">
        checked in
      </span>
    </div>
  );
}
