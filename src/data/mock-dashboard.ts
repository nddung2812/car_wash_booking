export interface Booking {
  id: string;
  date: string;
  customer: string;
  service: string;
  vehicle: string;
  amount: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export interface MonthlyCost {
  month: string;
  revenue: number;
  costs: number;
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

export const mockServicePopularity = [
  { label: "Super Sparkles", value: 89 },
  { label: "Sparkles Wash", value: 72 },
  { label: "Mini Detail", value: 45 },
  { label: "Full Detail", value: 28 },
  { label: "Interior Detail", value: 13 },
];

export const mockVehicleDistribution = [
  { label: "Sedan", value: 98 },
  { label: "SUV", value: 76 },
  { label: "Wagon", value: 48 },
  { label: "4x4", value: 25 },
];

export const mockMonthlyCosts: MonthlyCost[] = [
  { month: "Nov 2025", revenue: 14200, costs: 8900 },
  { month: "Dec 2025", revenue: 16800, costs: 9400 },
  { month: "Jan 2026", revenue: 12500, costs: 8600 },
  { month: "Feb 2026", revenue: 15300, costs: 9100 },
  { month: "Mar 2026", revenue: 18430, costs: 10200 },
  { month: "Apr 2026", revenue: 9800, costs: 7500 },
];

export const mockCostBreakdown = [
  { category: "Labor", amount: 4200 },
  { category: "Supplies & Chemicals", amount: 1800 },
  { category: "Rent", amount: 2500 },
  { category: "Utilities", amount: 650 },
  { category: "Insurance", amount: 420 },
  { category: "Marketing", amount: 350 },
];

export const mockProfitMargins = [
  { label: "Sparkles Wash", value: 62 },
  { label: "Super Sparkles", value: 58 },
  { label: "Mini Detail", value: 55 },
  { label: "Interior Detail", value: 48 },
  { label: "Full Detail", value: 45 },
];

export const mockSummary = {
  totalBookings: 247,
  totalRevenue: 18430,
  avgPerBooking: 74.6,
  repeatCustomers: 68,
  totalCosts: 9920,
  netProfit: 8510,
  profitMargin: 46.2,
};
