import "dotenv/config";
import { prisma } from "./prisma";

async function main() {
  const event = await prisma.event.create({
    data: {
      deceasedName: "Emunefe Ajeno Sarah",
      deceasedAge: 72,
      description: "You are cordially invited to the reception in celebration of the life of Sister Emunefe Ajeno Sarah",
      eventDate: new Date("2026-09-04"),
      eventTime: "4:00 PM",
      venue: "Magodo RSA Community Hall, 15 Tokunbo Macaulay Street, Magodo Phase II, Lagos",
      capacity: 200,
    },
  });
  console.log("Event created:", event.id);
}

main().then(() => process.exit(0));