import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const guests = await prisma.guest.findMany({
    include: { invite: { include: { logs: true } } },
    orderBy: { fullName: "asc" },
  });

  const rows = [
    ["Full Name", "Phone Number", "Status", "Checked In At", "Checked Out At"],
    ...guests.map((g) => [
      g.fullName,
      g.phoneNumber,
      g.invite?.status ?? "",
      g.invite?.checkedInAt?.toISOString() ?? "",
      g.invite?.checkedOutAt?.toISOString() ?? "",
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="guest-report.csv"`,
    },
  });
}