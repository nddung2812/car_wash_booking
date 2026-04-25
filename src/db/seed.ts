import { db, bookings } from "./index";
import { mockBookings } from "../data/mock-dashboard";

const STATUS_MAP: Record<string, "pending" | "confirmed" | "completed" | "cancelled"> = {
  Completed: "completed",
  Pending: "pending",
  Cancelled: "cancelled",
};

async function main() {
  console.log(`Seeding ${mockBookings.length} bookings…`);

  const rows = mockBookings.map((b, i) => {
    const [first, ...rest] = b.customer.split(" ");
    const last = rest.join(" ") || "Guest";
    const subtotal = (b.amount / 1.1).toFixed(2);
    const gst = (b.amount - parseFloat(subtotal)).toFixed(2);
    return {
      confirmationCode: `HD-${10000 + i}`,
      serviceId: b.service.toLowerCase().replace(/\s+/g, "-"),
      serviceName: b.service,
      vehicleType: b.vehicle.toLowerCase(),
      date: b.date,
      time: "10:00 AM",
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: "0400000000",
      address: "Hyperdome Shopping Centre, Loganholme QLD 4129",
      notes: null,
      extras: [],
      subtotal,
      gst,
      total: b.amount.toFixed(2),
      status: STATUS_MAP[b.status] ?? "pending",
    };
  });

  await db.insert(bookings).values(rows).onConflictDoNothing();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
