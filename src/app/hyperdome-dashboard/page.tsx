import DashboardTabs from "@/components/dashboard/DashboardTabs";
import {
  listBookings,
  getBookingStats,
  getServicePopularity,
  getVehicleDistribution,
} from "@/db/queries";
import {
  mockMonthlyCosts,
  mockCostBreakdown,
  mockProfitMargins,
} from "@/data/mock-dashboard";
import type {
  BookingRow,
  CustomerAnalyticsData,
} from "@/components/dashboard/CustomerAnalytics";
import type { CostAnalyticsData } from "@/components/dashboard/CostAnalytics";

export const dynamic = "force-dynamic";

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function HyperdomeAnalyticsPage() {
  const [rawBookings, stats, servicePopularity, vehicleDistribution] =
    await Promise.all([
      listBookings(50),
      getBookingStats(),
      getServicePopularity(),
      getVehicleDistribution(),
    ]);

  const bookings: BookingRow[] = rawBookings.map((b) => ({
    id: b.confirmationCode,
    date: b.date,
    customer: `${b.firstName} ${b.lastName}`.trim(),
    service: b.serviceName,
    vehicle: b.vehicleType.charAt(0).toUpperCase() + b.vehicleType.slice(1),
    amount: Number(b.total),
    status: statusLabel(b.status),
  }));

  const totalBookings = stats?.total ?? 0;
  const totalRevenue = Math.round(Number(stats?.revenue ?? 0));
  const avgPerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const customerData: CustomerAnalyticsData = {
    summary: {
      totalBookings,
      totalRevenue,
      avgPerBooking,
      repeatCustomers: 0,
    },
    servicePopularity: servicePopularity.map((r) => ({
      label: r.label,
      value: Number(r.value),
    })),
    vehicleDistribution: vehicleDistribution.map((r) => ({
      label: r.label.charAt(0).toUpperCase() + r.label.slice(1),
      value: Number(r.value),
    })),
    bookings,
  };

  const totalCosts = mockCostBreakdown.reduce((sum, i) => sum + i.amount, 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const costData: CostAnalyticsData = {
    summary: {
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
    },
    monthlyCosts: mockMonthlyCosts,
    costBreakdown: mockCostBreakdown,
    profitMargins: mockProfitMargins,
  };

  return <DashboardTabs customerData={customerData} costData={costData} />;
}
