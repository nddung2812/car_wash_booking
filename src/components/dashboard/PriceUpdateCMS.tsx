"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw } from "lucide-react";
import { services as originalServices, extraServices as originalExtras, type Service, type ExtraService } from "@/data/services";

const STORAGE_KEY = "dashboard-prices";

interface SavedPrices {
  services: Service[];
  extras: ExtraService[];
}

export default function PriceUpdateCMS() {
  const [serviceList, setServiceList] = useState<Service[]>(() =>
    JSON.parse(JSON.stringify(originalServices))
  );
  const [extraList, setExtraList] = useState<ExtraService[]>(() =>
    JSON.parse(JSON.stringify(originalExtras))
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SavedPrices = JSON.parse(stored);
      setServiceList(parsed.services);
      setExtraList(parsed.extras);
    }
  }, []);

  const updateServicePrice = (index: number, vehicle: keyof Service["pricing"], value: number) => {
    setServiceList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], pricing: { ...next[index].pricing, [vehicle]: value } };
      return next;
    });
  };

  const updateExtraPrice = (index: number, vehicle: keyof ExtraService["pricing"], value: number) => {
    setExtraList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], pricing: { ...next[index].pricing, [vehicle]: value } };
      return next;
    });
  };

  const handleSave = () => {
    const data: SavedPrices = { services: serviceList, extras: extraList };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setServiceList(JSON.parse(JSON.stringify(originalServices)));
    setExtraList(JSON.parse(JSON.stringify(originalExtras)));
    localStorage.removeItem(STORAGE_KEY);
  };

  const vehicleKeys: (keyof Service["pricing"])[] = ["sedan", "wagon", "suv"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Update Service Prices</h2>
        <div className="flex items-center gap-3">
          {saved && <Badge className="bg-green-500">Saved!</Badge>}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save Prices
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Main Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px] gap-3 text-sm font-medium text-gray-500 px-1">
            <span>Service</span>
            <span>Sedan</span>
            <span>Wagon</span>
            <span>SUV</span>
          </div>
          {serviceList.map((service, i) => (
            <div key={service.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_100px] gap-3 items-center border-b pb-3 last:border-0">
              <span className="font-medium">{service.name}</span>
              {vehicleKeys.map((v) => (
                <div key={v} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 sm:hidden capitalize">{v}:</span>
                  <span className="text-gray-400">$</span>
                  <Input
                    type="number"
                    min={0}
                    value={service.pricing[v]}
                    onChange={(e) => updateServicePrice(i, v, Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extra Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px] gap-3 text-sm font-medium text-gray-500 px-1">
            <span>Service</span>
            <span>Sedan</span>
            <span>Wagon</span>
            <span>SUV</span>
          </div>
          {extraList.map((service, i) => (
            <div key={service.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_100px] gap-3 items-center border-b pb-3 last:border-0">
              <span className="font-medium">{service.name}</span>
              {vehicleKeys.map((v) => (
                <div key={v} className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 sm:hidden capitalize">{v}:</span>
                  <span className="text-gray-400">$</span>
                  <Input
                    type="number"
                    min={0}
                    value={service.pricing[v]}
                    onChange={(e) => updateExtraPrice(i, v, Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
