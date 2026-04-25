"use client";

import { Users, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import BarChart from "./BarChart";
import DataTable from "./DataTable";

export interface BookingRow {
  id: string;
  date: string;
  customer: string;
  service: string;
  vehicle: string;
  amount: number;
  status: string;
}

export interface CustomerAnalyticsData {
  summary: {
    totalBookings: number;
    totalRevenue: number;
    avgPerBooking: number;
    repeatCustomers: number;
  };
  servicePopularity: { label: string; value: number }[];
  vehicleDistribution: { label: string; value: number }[];
  bookings: BookingRow[];
}

const bookingColumns = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "service", label: "Service" },
  { key: "vehicle", label: "Vehicle" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];

export default function CustomerAnalytics({ data }: { data: CustomerAnalyticsData }) {
  const { summary, servicePopularity, vehicleDistribution, bookings } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Bookings" value={summary.totalBookings} icon={Users} />
        <MetricCard title="Total Revenue" value={`$${summary.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500/15 text-emerald-700" />
        <MetricCard title="Avg / Booking" value={`$${summary.avgPerBooking.toFixed(2)}`} icon={TrendingUp} color="bg-yellow-soft text-yellow-ink" />
        <MetricCard title="Repeat Customers" value={`${summary.repeatCustomers}%`} icon={UserCheck} color="bg-violet-500/15 text-violet-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart title="Popular Services" data={servicePopularity} />
        <BarChart title="Vehicle Type Distribution" data={vehicleDistribution} suffix="" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="py-12 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              No bookings yet — share your booking page to get started.
            </p>
          ) : (
            <DataTable columns={bookingColumns} rows={bookings} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
