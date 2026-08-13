import { prisma } from "../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { guest: true },
  });

  if (!invite) {
    return NextResponse.json({ valid: false, reason: "Invalid or unknown invite code" });
  }

  return NextResponse.json({
    valid: true,
    inviteId: invite.id,
    guestName: invite.guest.fullName,
    status: invite.status,
  });
}