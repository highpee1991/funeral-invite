import { prisma } from "../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const { inviteId } = await req.json();

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    return NextResponse.json({ success: false, message: "Invite not found" });
  }
  if (invite.status === "CHECKED_IN") {
    return NextResponse.json({
      success: false,
      message: "Already checked in — not permitted to enter again",
    });
  }

  await prisma.$transaction([
    prisma.invite.update({
      where: { id: inviteId },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
    }),
    prisma.checkLog.create({
      data: { inviteId, action: "CHECK_IN" },
    }),
  ]);

  revalidatePath("/admin/guests");

  return NextResponse.json({ success: true, message: "Approved — permit entry" });
}