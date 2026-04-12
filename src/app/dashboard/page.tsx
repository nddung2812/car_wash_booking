"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Settings, ArrowLeft } from "lucide-react";
import CustomerAnalytics from "@/components/dashboard/CustomerAnalytics";
import CostAnalytics from "@/components/dashboard/CostAnalytics";
import PriceUpdateCMS from "@/components/dashboard/PriceUpdateCMS";

type Tab = "customers" | "costs" | "pricing";

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "customers", label: "Customer Analytics", icon: Users },
  { id: "costs", label: "Cost Analytics", icon: DollarSign },
  { id: "pricing", label: "Price Update", icon: Settings },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("customers");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>

          <div className="flex gap-1 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-50 text-blue-600 border border-b-0 border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "customers" && <CustomerAnalytics />}
        {activeTab === "costs" && <CostAnalytics />}
        {activeTab === "pricing" && <PriceUpdateCMS />}
      </div>
    </div>
  );
}
