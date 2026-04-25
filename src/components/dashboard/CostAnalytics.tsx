"use client";

import { DollarSign, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import BarChart from "./BarChart";

export interface CostAnalyticsData {
  summary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
  };
  monthlyCosts: { month: string; revenue: number; costs: number }[];
  costBreakdown: { category: string; amount: number }[];
  profitMargins: { label: string; value: number }[];
}

export default function CostAnalytics({ data }: { data: CostAnalyticsData }) {
  const { summary, monthlyCosts, costBreakdown, profitMargins } = data;
  const totalCosts = costBreakdown.reduce((sum, i) => sum + i.amount, 0);
  const max = Math.max(1, ...monthlyCosts.map((x) => x.revenue));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={`$${summary.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-500/15 text-emerald-700" />
        <MetricCard title="Total Costs" value={`$${summary.totalCosts.toLocaleString()}`} icon={TrendingDown} color="bg-destructive/15 text-destructive" />
        <MetricCard title="Net Profit" value={`$${summary.netProfit.toLocaleString()}`} icon={TrendingUp} color="bg-brand-soft text-primary" />
        <MetricCard title="Profit Margin" value={`${summary.profitMargin.toFixed(1)}%`} icon={Percent} color="bg-yellow-soft text-yellow-ink" />
      </div>

      <BarChart title="Profit Margin by Service" data={profitMargins} suffix="%" />

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 px-4 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Category
                  </th>
                  <th className="py-3 px-4 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {costBreakdown.map((item) => (
                  <tr key={item.category} className="border-b border-line/60 last:border-0 hover:bg-secondary/60">
                    <td className="py-3 px-4 text-foreground">{item.category}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-foreground">
                      ${item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/60 font-semibold">
                  <td className="py-3 px-4 text-foreground">Total</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-foreground">
                    ${totalCosts.toLocaleString()}
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
          {monthlyCosts.map((m) => (
            <div key={m.month} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                <span className="text-muted-foreground">{m.month}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  Revenue ${m.revenue.toLocaleString()} · Costs ${m.costs.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(m.revenue / max) * 100}%` }} />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-destructive/70" style={{ width: `${(m.costs / max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-4 pt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-primary" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full bg-destructive/70" /> Costs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
