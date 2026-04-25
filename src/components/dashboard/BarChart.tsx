"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BarChartProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  suffix?: string;
}

export default function BarChart({ title, data, suffix = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono tabular-nums text-foreground">
                {item.value}
                {suffix}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-2.5 rounded-full ${item.color || "bg-primary"}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
