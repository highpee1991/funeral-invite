"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#7A6F63] hover:text-[#B08D57] transition-colors"
    >
      Log Out
    </button>
  );
}
