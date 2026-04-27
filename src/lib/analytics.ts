type GtagArgs =
  | ["event", string, Record<string, unknown>?]
  | ["config", string, Record<string, unknown>?]
  | ["js", Date];

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
    dataLayer?: unknown[];
  }
}

export type GenerateLeadParams = {
  value: number;
  currency?: string;
  serviceId: string;
  serviceName: string;
  vehicleType: string;
  confirmationCode: string;
};

export function trackGenerateLead(params: GenerateLeadParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "generate_lead", {
    currency: params.currency ?? "AUD",
    value: params.value,
    service_id: params.serviceId,
    service_name: params.serviceName,
    vehicle_type: params.vehicleType,
    transaction_id: params.confirmationCode,
  });
}

export {};
