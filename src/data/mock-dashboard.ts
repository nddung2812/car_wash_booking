export interface Booking {
  id: string;
  date: string;
  customer: string;
  service: string;
  vehicle: string;
  amount: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export const mockBookings: Booking[] = [
  { id: "B001", date: "2026-04-12", customer: "Sarah Chen", service: "Full Detail", vehicle: "SUV", amount: 430, status: "Completed" },
  { id: "B002", date: "2026-04-11", customer: "James Wilson", service: "Super Sparkles", vehicle: "Sedan", amount: 60, status: "Completed" },
  { id: "B003", date: "2026-04-11", customer: "Emily Brown", service: "Mini Detail", vehicle: "Wagon", amount: 80, status: "Pending" },
  { id: "B004", date: "2026-04-10", customer: "Michael Lee", service: "Sparkles Wash", vehicle: "Sedan", amount: 40, status: "Completed" },
  { id: "B005", date: "2026-04-10", customer: "Olivia Davis", service: "Interior Detail", vehicle: "SUV", amount: 330, status: "Completed" },
  { id: "B006", date: "2026-04-09", customer: "Daniel Kim", service: "Super Sparkles", vehicle: "Wagon", amount: 65, status: "Completed" },
  { id: "B007", date: "2026-04-09", customer: "Sophie Martin", service: "Full Detail", vehicle: "Sedan", amount: 350, status: "Pending" },
  { id: "B008", date: "2026-04-08", customer: "Liam Johnson", service: "Mini Detail", vehicle: "SUV", amount: 90, status: "Completed" },
  { id: "B009", date: "2026-04-08", customer: "Ava Thompson", service: "Sparkles Wash", vehicle: "Wagon", amount: 42, status: "Cancelled" },
  { id: "B010", date: "2026-04-07", customer: "Noah Garcia", service: "Super Sparkles", vehicle: "Sedan", amount: 60, status: "Completed" },
];
