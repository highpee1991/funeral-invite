import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

const EVENT_ID = "cmsq2h2cf000078ty0uotgegz";

export async function GET() {
  const [checkedIn, event] = await Promise.all([
    prisma.invite.count({
      where: { status: "CHECKED_IN", guest: { eventId: EVENT_ID } },
    }),
    prisma.event.findUnique({ where: { id: EVENT_ID } }),
  ]);

  return NextResponse.json({
    checkedIn,
    capacity: event?.capacity ?? 200,
  });
}