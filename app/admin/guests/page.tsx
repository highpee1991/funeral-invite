import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { sendInviteWhatsApp } from "../../lib/send-invite";

import SiteNav from "../../components/SiteNav";
import OrnateDivider from "../../components/OrnateDivider";
import HeadcountBadge from "../../components/HeadcountBadge";
import LogoutButton from "../../components/LogoutButton";
import GuestRow from "@/app/components/GuestRow";

const EVENT_ID = "cmsq2h2cf000078ty0uotgegz";

async function addGuest(formData: FormData) {
  "use server";
  const fullName = formData.get("fullName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  const guest = await prisma.guest.create({
    data: { fullName, phoneNumber, eventId: EVENT_ID },
  });

  await prisma.invite.create({
    data: { guestId: guest.id },
  });

  revalidatePath("/admin/guests");
}

async function sendInvite(formData: FormData) {
  "use server";
  const inviteId = formData.get("inviteId") as string;

  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: { guest: true },
  });
  if (!invite) return;

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invite.token}`;
  await sendInviteWhatsApp(
    invite.guest.phoneNumber,
    invite.guest.fullName,
    link,
  );
}

export default async function GuestsPage() {
  const guests = await prisma.guest.findMany({
    include: { invite: true },
    orderBy: { createdAt: "desc" },
  });

  async function manualCheckIn(formData: FormData) {
    "use server";
    const inviteId = formData.get("inviteId") as string;
    await prisma.$transaction([
      prisma.invite.update({
        where: { id: inviteId },
        data: { status: "CHECKED_IN", checkedInAt: new Date() },
      }),
      prisma.checkLog.create({ data: { inviteId, action: "CHECK_IN" } }),
    ]);
    revalidatePath("/admin/guests");
  }

  async function manualCheckOut(formData: FormData) {
    "use server";
    const inviteId = formData.get("inviteId") as string;
    await prisma.$transaction([
      prisma.invite.update({
        where: { id: inviteId },
        data: { status: "CHECKED_OUT", checkedOutAt: new Date() },
      }),
      prisma.checkLog.create({ data: { inviteId, action: "CHECK_OUT" } }),
    ]);
    revalidatePath("/admin/guests");
  }

  async function editGuest(formData: FormData) {
    "use server";
    const guestId = formData.get("guestId") as string;
    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    await prisma.guest.update({
      where: { id: guestId },
      data: { fullName, phoneNumber },
    });

    revalidatePath("/admin/guests");
  }

  async function deleteGuest(formData: FormData) {
    "use server";
    const guestId = formData.get("guestId") as string;

    await prisma.guest.delete({ where: { id: guestId } });

    revalidatePath("/admin/guests");
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      <SiteNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 pb-16">
        <div className="flex items-start justify-between gap-4 mb-1">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B08D57]">
            Event Management
          </p>
          <LogoutButton />
        </div>

        <h1 className="font-display italic text-3xl sm:text-4xl text-[#2E2A24] mb-4">
          Guests
        </h1>

        <OrnateDivider className="w-20 h-auto text-[#B08D57]/60 mb-6" />

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <HeadcountBadge />
          <a
            href="/api/export"
            className="text-xs tracking-[0.08em] uppercase font-semibold text-[#7A6F63] hover:text-[#B08D57] transition-colors"
          >
            Download Guest Report (CSV)
          </a>
        </div>

        <div className="border border-[#2E2A24]/12 bg-white rounded-sm p-5 sm:p-6 mb-10">
          <h2 className="text-xs tracking-[0.1em] uppercase font-semibold text-[#7A6F63] mb-4">
            Add Guest
          </h2>
          <form action={addGuest} className="flex flex-col sm:flex-row gap-3">
            <input
              name="fullName"
              placeholder="Full name"
              required
              className="border border-[#2E2A24]/20 rounded-sm px-3 py-2.5 text-sm text-[#2E2A24] bg-white placeholder:text-[#2E2A24]/30 focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57] transition-colors flex-1"
            />
            <input
              name="phoneNumber"
              placeholder="+2348012345678"
              required
              className="border border-[#2E2A24]/20 rounded-sm px-3 py-2.5 text-sm text-[#2E2A24] bg-white placeholder:text-[#2E2A24]/30 focus:outline-none focus:ring-1 focus:ring-[#B08D57] focus:border-[#B08D57] transition-colors flex-1"
            />
            <button className="bg-[#2E2A24] text-white text-xs tracking-[0.1em] uppercase font-bold px-5 py-2.5 rounded-sm hover:bg-[#B08D57] transition-colors whitespace-nowrap">
              Add Guest
            </button>
          </form>
        </div>

        <h2 className="text-xs tracking-[0.1em] uppercase font-semibold text-[#7A6F63] mb-3">
          All Guests ({guests.length})
        </h2>

        <ul className="space-y-3">
          {guests.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              editGuest={editGuest}
              deleteGuest={deleteGuest}
              sendInvite={sendInvite}
              manualCheckIn={manualCheckIn}
              manualCheckOut={manualCheckOut}
            />
          ))}
        </ul>

        {guests.length === 0 && (
          <p className="text-sm text-[#7A6F63] text-center py-12">
            No guests added yet.
          </p>
        )}
      </main>
    </div>
  );
}
