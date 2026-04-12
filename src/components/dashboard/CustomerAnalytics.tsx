"use client";

import { Users, DollarSign, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import BarChart from "./BarChart";
import DataTable from "./DataTable";
import {
  mockBookings,
  mockServicePopularity,
  mockVehicleDistribution,
  mockSummary,
} from "@/data/mock-dashboard";

const bookingColumns = [
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "service", label: "Service" },
  { key: "vehicle", label: "Vehicle" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];

export default function CustomerAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Bookings" value={mockSummary.totalBookings} icon={Users} />
        <MetricCard title="Total Revenue" value={`$${mockSummary.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-600" />
        <MetricCard title="Avg / Booking" value={`$${mockSummary.avgPerBooking}`} icon={TrendingUp} color="bg-yellow-100 text-yellow-600" />
        <MetricCard title="Repeat Customers" value={`${mockSummary.repeatCustomers}%`} icon={UserCheck} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart title="Popular Services" data={mockServicePopularity} />
        <BarChart title="Vehicle Type Distribution" data={mockVehicleDistribution} suffix="" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={bookingColumns} rows={mockBookings} />
        </CardContent>
      </Card>
    </div>
  );
}
