import DashboardTabs from "@/components/dashboard/DashboardTabs";
import {
  listBookings,
  listBookingMonths,
  getBookingStats,
  getServicePopularity,
  getVehicleDistribution,
} from "@/db/queries";
import type {
  BookingRow,
  CustomerAnalyticsData,
} from "@/components/dashboard/CustomerAnalytics";
import { ALL_TIME, type MonthOption } from "@/components/dashboard/MonthFilter";
import { balanceDue } from "@/lib/booking-payment";

export const dynamic = "force-dynamic";

/** `YYYY-MM` with a real month number. */
const MONTH_PARAM = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthFormatter = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function monthLabel(month: string) {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`));
}

/**
 * Today's month in shop time, as `YYYY-MM`. Brisbane rather than the server's
 * UTC clock, so the dashboard doesn't flip to next month ~10 hours early —
 * same reason `genCode()` stamps confirmation codes in Brisbane.
 */
function currentMonth() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());
  const mm = parts.find((p) => p.type === "month")!.value;
  const yyyy = parts.find((p) => p.type === "year")!.value;
  return `${yyyy}-${mm}`;
}

export default async function HyperdomeAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;

  // No param = this month (the default view). `?month=all` is the explicit
  // opt-out; anything unparseable falls back to the default rather than 500ing.
  const month =
    monthParam === ALL_TIME
      ? undefined
      : monthParam && MONTH_PARAM.test(monthParam)
        ? monthParam
        : currentMonth();

  const [rawBookings, monthRows, stats, servicePopularity, vehicleDistribution] =
    await Promise.all([
      listBookings(200, month),
      listBookingMonths(),
      getBookingStats(month),
      getServicePopularity(month),
      getVehicleDistribution(month),
    ]);

  const bookings: BookingRow[] = rawBookings.map((b) => ({
    id: b.confirmationCode,
    bookingId: b.id,
    date: b.date,
    customer: `${b.firstName} ${b.lastName}`.trim(),
    service: b.serviceName,
    vehicle: b.vehicleType.charAt(0).toUpperCase() + b.vehicleType.slice(1),
    amount: Number(b.total),
    paidNow: Number(b.amountPaid),
    balance: balanceDue(Number(b.total), Number(b.amountPaid)),
    paymentIntentId: b.stripePaymentIntentId,
    status: b.status,
  }));

  const months: MonthOption[] = monthRows.map((r) => ({
    value: r.month,
    label: monthLabel(r.month),
    count: Number(r.count),
  }));

  // A quiet month has no rows, so it never comes back from the DB — but it's
  // the default view, and the select needs an option matching its own value.
  const thisMonth = currentMonth();
  if (!months.some((m) => m.value === thisMonth)) {
    months.unshift({ value: thisMonth, label: monthLabel(thisMonth), count: 0 });
  }

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
    months,
    activeMonth: month ?? null,
    activeMonthLabel: month ? monthLabel(month) : null,
  };

  return <DashboardTabs customerData={customerData} />;
}
