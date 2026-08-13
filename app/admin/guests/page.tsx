import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { sendInviteWhatsApp } from "../../lib/send-invite";

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
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-2">
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-bold mb-6">Guests</h1>
      <div className="mb-4">
        <HeadcountBadge />
      </div>

      <a
        href="/api/export"
        className="text-sm text-blue-600 underline mb-4 inline-block"
      >
        Download guest report (CSV)
      </a>

      <form action={addGuest} className="flex gap-2 mb-8">
        <input
          name="fullName"
          placeholder="Full name"
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          name="phoneNumber"
          placeholder="+2348012345678"
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="bg-black text-white px-4 py-2 rounded">
          Add Guest
        </button>
      </form>

      <ul className="space-y-2">
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
    </div>
  );
}
