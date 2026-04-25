"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  color = "bg-brand-soft text-primary",
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`grid size-11 place-items-center rounded-pill ${color}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <p className="font-serif text-3xl leading-none tracking-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
