import "dotenv/config";
import { prisma } from "./prisma";

async function main() {
  const updated = await prisma.event.update({
    where: { id: "cmsq2h2cf000078ty0uotgegz" }, // your existing event ID
    data: {
      deceasedYearRange: "JUNE 18, 1954 — JULY 5, 2026", // adjust to the real dates
    },
  });
  console.log("Updated:", updated.deceasedYearRange);
}

main().then(() => process.exit(0));