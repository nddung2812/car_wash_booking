"use client";

import { DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import BarChart from "./BarChart";
import {
  mockMonthlyCosts,
  mockCostBreakdown,
  mockProfitMargins,
  mockSummary,
} from "@/data/mock-dashboard";

export default function CostAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={`$${mockSummary.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-600" />
        <MetricCard title="Total Costs" value={`$${mockSummary.totalCosts.toLocaleString()}`} icon={TrendingDown} color="bg-red-100 text-red-600" />
        <MetricCard title="Net Profit" value={`$${mockSummary.netProfit.toLocaleString()}`} icon={TrendingUp} color="bg-blue-100 text-blue-600" />
        <MetricCard title="Profit Margin" value={`${mockSummary.profitMargin}%`} icon={Percent} color="bg-yellow-100 text-yellow-600" />
      </div>

      <BarChart title="Profit Margin by Service" data={mockProfitMargins} suffix="%" />

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockCostBreakdown.map((item) => (
                  <tr key={item.category} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4 text-right font-medium">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">
                    ${mockCostBreakdown.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Costs (Monthly)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockMonthlyCosts.map((m) => {
            const max = Math.max(...mockMonthlyCosts.map((x) => x.revenue));
            return (
              <div key={m.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{m.month}</span>
                  <span className="text-xs text-gray-400">
                    Revenue: ${m.revenue.toLocaleString()} | Costs: ${m.costs.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${(m.revenue / max) * 100}%` }} />
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div className="h-2.5 rounded-full bg-red-400" style={{ width: `${(m.costs / max) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex gap-4 text-xs text-gray-500 pt-2">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-400" /> Costs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
