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
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{item.value}{suffix}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100">
              <div
                className={`h-3 rounded-full ${item.color || "bg-blue-500"}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
