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
      className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
        isOverCapacity
          ? "bg-red-600 text-white"
          : isNearCapacity
          ? "bg-yellow-400 text-black"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {data.checkedIn} / {data.capacity} checked in
    </div>
  );
}