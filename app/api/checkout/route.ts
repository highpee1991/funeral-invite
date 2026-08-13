import { prisma } from "../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const { inviteId } = await req.json();

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    return NextResponse.json({ success: false, message: "Invite not found" });
  }
  if (invite.status !== "CHECKED_IN") {
    return NextResponse.json({
      success: false,
      message: "Guest is not currently checked in",
    });
  }

  await prisma.$transaction([
    prisma.invite.update({
      where: { id: inviteId },
      data: { status: "CHECKED_OUT", checkedOutAt: new Date() },
    }),
    prisma.checkLog.create({
      data: { inviteId, action: "CHECK_OUT" },
    }),
  ]);

  revalidatePath("/admin/guests");

  return NextResponse.json({ success: true, message: "Checked out — removed from inside count" });
}