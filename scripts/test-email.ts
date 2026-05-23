import { sendBookingNotification } from "../src/lib/email";

async function main() {
  console.log("[probe] env check:", {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKeyPresent: !!process.env.EMAILJS_PUBLIC_KEY,
    privateKeyPresent: !!process.env.EMAILJS_PRIVATE_KEY,
    bookingNotificationEmail: process.env.BOOKING_NOTIFICATION_EMAIL || "(empty)",
    adminEmails: process.env.ADMIN_EMAILS,
  });

  const result = await sendBookingNotification({
    confirmationCode: "PROBE-" + Date.now(),
    serviceId: "premium-detail",
    serviceName: "Premium Detail (probe)",
    vehicleType: "SUV",
    location: "loganholme",
    date: "2026-04-30",
    time: "10:00",
    firstName: "Probe",
    lastName: "Tester",
    email: "probe@example.com",
    phone: "0400000000",
    address: "1 Test Street, Logan QLD",
    notes: "This is a diagnostic probe — ignore.",
    extras: [],
    subtotal: 100,
    gst: 10,
    total: 110,
    paymentStatus: "Pay later - At collection",
  });

  console.log("[probe] result:", result);
}

main().catch((err) => {
  console.error("[probe] threw:", err);
  process.exit(1);
});
