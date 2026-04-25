"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Settings, ArrowLeft } from "lucide-react";
import CustomerAnalytics, { type CustomerAnalyticsData } from "./CustomerAnalytics";
import CostAnalytics, { type CostAnalyticsData } from "./CostAnalytics";
import PriceUpdateCMS from "./PriceUpdateCMS";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";
import { cn } from "@/lib/utils";

type Tab = "customers" | "costs" | "pricing";

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "customers", label: "Customer Analytics", icon: Users },
  { id: "costs", label: "Cost Analytics", icon: DollarSign },
  { id: "pricing", label: "Price Update", icon: Settings },
];

export default function DashboardTabs({
  customerData,
  costData,
}: {
  customerData: CustomerAnalyticsData;
  costData: CostAnalyticsData;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("customers");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line bg-background/72 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4" /> Back
                </Button>
              </Link>
              <div className="flex items-center gap-2.5">
                <ChromeBrand size={28} />
                <span className="font-serif text-xl leading-none tracking-tight">Dashboard</span>
              </div>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Internal · Hyperdome
            </span>
          </div>

          <div className="flex gap-1 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                  activeTab === tab.id
                    ? "border border-b-0 border-line bg-background text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "customers" && <CustomerAnalytics data={customerData} />}
        {activeTab === "costs" && <CostAnalytics data={costData} />}
        {activeTab === "pricing" && <PriceUpdateCMS />}
      </div>
    </div>
  );
}
