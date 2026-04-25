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
      <CardContent className="flex items-center gap-3 sm:gap-4">
        <div className={`grid size-10 shrink-0 place-items-center rounded-pill sm:size-11 ${color}`}>
          <Icon className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
            {title}
          </p>
          <p className="truncate font-serif text-2xl leading-none tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
