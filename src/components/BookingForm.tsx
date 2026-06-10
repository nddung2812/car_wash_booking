"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import * as z from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Car,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";
import {
  services as defaultServices,
  vehicleTypes,
  timeSlots,
  extraServices as defaultExtraServices,
  getExtraPrice,
  type Service,
  type ExtraService,
} from "@/data/services";
import { LOCATIONS } from "@/lib/seo/business";
import { cn } from "@/lib/utils";
import { trackGenerateLead } from "@/lib/analytics";
import { isValidAuPhone } from "@/lib/phone";

const bookingSchema = z.object({
  service: z.string().min(1, "Choose a wash package to continue"),
  location: z.string().min(1, "Choose which location you'd like"),
  vehicleType: z.string().min(1, "Choose your vehicle size so we can price it"),
  date: z.string().min(1, "Pick a day for your wash"),
  time: z.string().min(1, "Pick a time slot for your wash"),
  firstName: z
    .string()
    .min(1, "Enter your first name")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Enter your last name")
    .min(2, "Last name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Enter your email so we can send your confirmation")
    .email("That doesn't look like a valid email address"),
  phone: z
    .string()
    .min(1, "Enter a contact phone number")
    .refine(
      isValidAuPhone,
      "Enter a valid Australian number, e.g. 0412 345 678",
    ),
  address: z
    .string()
    .min(1, "Enter your address so we know where to come")
    .min(5, "Address must be at least 5 characters"),
  notes: z.string().optional(),
  extras: z.array(z.string()).default([]),
  paymentMethod: z.enum(["pay_now", "pay_on_collection"], {
    message: "Choose how you'd like to pay",
  }),
});

type BookingFormInput = z.input<typeof bookingSchema>;
type BookingFormData = z.output<typeof bookingSchema>;

const STEP_FIELDS: Record<1 | 2 | 3, (keyof BookingFormData)[]> = {
  1: ["service"],
  2: ["location", "vehicleType", "date", "time"],
  3: ["firstName", "lastName", "email", "phone", "address", "paymentMethod"],
};

const STEP_LABELS = ["Service", "Vehicle & time", "Contact"] as const;

const FIELD_LABELS: Record<string, string> = {
  service: "Service",
  location: "Location",
  vehicleType: "Vehicle size",
  date: "Date",
  time: "Time",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  paymentMethod: "Payment",
};

// Higher-contrast, slightly larger field labels (overrides the muted default)
const LABEL_CLASS = "text-foreground text-[12px] tracking-[0.1em]";

// Obvious red highlight wrapper for a group of choice buttons when invalid
const INVALID_GROUP_CLASS =
  "rounded-2xl p-2.5 ring-1 ring-destructive bg-destructive/[0.04]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-[13px] font-medium text-destructive"
    >
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

function scrollToField(name: string) {
  if (typeof window === "undefined") return;
  const el =
    document.getElementById(name) ||
    document.getElementById(`field-${name}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    setTimeout(() => el.focus({ preventScroll: true }), 250);
  }
}

const VEHICLE_DETAILS: Record<string, { icon: typeof Car; subtitle: string }> = {
  Sedan: { icon: Car, subtitle: "Sedan / coupe" },
  Wagon: { icon: Car, subtitle: "Station wagon / hatch" },
  "SUV / 4×4": { icon: Car, subtitle: "SUV or 4×4" },
};

function getServicePrice(
  service: Service | undefined,
  vehicleType: string | undefined,
) {
  if (!service) return 0;
  const v = (vehicleType ?? "").toLowerCase();
  if (v.includes("suv") || v.includes("4x4")) return service.pricing.suv;
  if (v.includes("wagon")) return service.pricing.wagon;
  return service.pricing.sedan;
}

const fullDateFormatter = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function buildDays(): { iso: string; weekday: string; day: number; month: string; isToday: boolean }[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1); // earliest = tomorrow
  const out: ReturnType<typeof buildDays> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    // Build the ISO date from LOCAL components. Using toISOString() converts to
    // UTC, which in AU timezones (UTC+10/+11) rolls the date back to the
    // previous day — storing the wrong booking date than the chip displays.
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push({
      iso: `${yyyy}-${mm}-${dd}`,
      weekday: d.toLocaleDateString("en-AU", { weekday: "short" }).toUpperCase(),
      day: d.getDate(),
      month: d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
      isToday: d.getTime() === today.getTime(),
    });
  }
  return out;
}

type BookingFormProps = {
  initialValues?: { phone?: string; address?: string };
  services?: Service[];
  extraServices?: ExtraService[];
};

const DRAFT_KEY = "hyperdome:booking-draft:v1";

// Sensitive fields are kept in memory only — never persisted to storage.
const PERSISTED_FIELDS = [
  "service",
  "location",
  "vehicleType",
  "date",
  "time",
  "extras",
  "notes",
  "address",
  "paymentMethod",
] as const satisfies readonly (keyof BookingFormInput)[];

type PersistedDraft = {
  step: 1 | 2 | 3;
  values: Partial<Pick<BookingFormInput, (typeof PERSISTED_FIELDS)[number]>>;
};

function readDraft(): PersistedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as PersistedDraft;
  } catch {
    return null;
  }
}

function writeDraft(draft: PersistedDraft) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode — silently skip */
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export default function BookingForm({
  initialValues,
  services = defaultServices,
  extraServices = defaultExtraServices,
}: BookingFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const hasValidPreselection = services.some((s) => s.id === preselectedService);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
    hasValidPreselection ? 2 : 1,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, isLoaded: isUserLoaded } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormInput, unknown, BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      extras: [],
      ...(hasValidPreselection ? { service: preselectedService! } : {}),
      ...(initialValues?.phone ? { phone: initialValues.phone } : {}),
      ...(initialValues?.address ? { address: initialValues.address } : {}),
    },
  });

  useEffect(() => {
    if (!isUserLoaded || !user) return;
    if (user.firstName) setValue("firstName", user.firstName);
    if (user.lastName) setValue("lastName", user.lastName);
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) setValue("email", email);
  }, [isUserLoaded, user, setValue]);

  // Restore draft from sessionStorage on first mount (skipped for new tabs).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const draft = readDraft();
    if (!draft?.values) return;
    for (const field of PERSISTED_FIELDS) {
      const v = draft.values[field];
      if (v === undefined || v === null) continue;
      // Don't clobber a service preselected from the URL.
      if (field === "service" && hasValidPreselection) continue;
      setValue(field, v as never, { shouldValidate: false });
    }
    if (draft.step === 2 || draft.step === 3) setCurrentStep(draft.step);
  }, [setValue, hasValidPreselection]);

  // Persist non-PII step + selections so back/refresh doesn't lose progress.
  const watchedAll = watch();
  useEffect(() => {
    if (!restoredRef.current) return;
    const subset: PersistedDraft["values"] = {};
    for (const field of PERSISTED_FIELDS) {
      const v = (watchedAll as Record<string, unknown>)[field];
      if (v !== undefined && v !== "") {
        (subset as Record<string, unknown>)[field] = v;
      }
    }
    writeDraft({ step: currentStep, values: subset });
  }, [watchedAll, currentStep]);

  const watchedService = watch("service");
  const watchedLocation = watch("location");
  const watchedVehicle = watch("vehicleType");
  const watchedDate = watch("date");
  const watchedTime = watch("time");
  const watchedExtras = watch("extras") ?? [];
  const watchedPaymentMethod = watch("paymentMethod");
  const selectedServiceData = services.find((s) => s.id === watchedService);
  const selectedExtraObjs = extraServices.filter((e) => watchedExtras.includes(e.id));

  const days = useMemo(buildDays, []);

  const extrasSubtotal = selectedExtraObjs.reduce(
    (sum, e) => sum + getExtraPrice(e, watchedVehicle),
    0,
  );
  const total = +(getServicePrice(selectedServiceData, watchedVehicle) + extrasSubtotal).toFixed(2);
  const gst = +(total / 11).toFixed(2);
  const subtotal = +(total - gst).toFixed(2);

  const onSubmit = async (data: BookingFormData) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not create booking");
      }
      const { booking, checkoutUrl, redirectUrl } = await res.json();

      clearDraft();

      trackGenerateLead({
        value: total,
        currency: "AUD",
        serviceId: data.service,
        serviceName: selectedServiceData?.name ?? data.service,
        vehicleType: data.vehicleType,
        confirmationCode: booking.confirmationCode,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      router.push(
        redirectUrl ?? `/success?code=${encodeURIComponent(booking.confirmationCode)}`
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const results = await Promise.all(fields.map((f) => trigger(f)));
    const allOk = results.every(Boolean);
    if (allOk && currentStep < 3) {
      setCurrentStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    if (!allOk) {
      const firstInvalid = fields[results.findIndex((r) => !r)];
      if (firstInvalid) scrollToField(firstInvalid);
    }
  };

  const onInvalid = (errs: typeof errors) => {
    const firstInvalid = STEP_FIELDS[currentStep].find(
      (f) => errs[f as keyof typeof errs],
    );
    if (firstInvalid) scrollToField(firstInvalid);
  };

  const missingFields = STEP_FIELDS[currentStep].filter(
    (f) => errors[f as keyof typeof errors],
  );
  const missingBanner = missingFields.length > 0 ? (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-col gap-2.5 rounded-[14px] border border-destructive/40 bg-destructive/5 p-3 sm:p-4"
    >
      <p className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        {missingFields.length === 1
          ? "Please fix this before continuing:"
          : `Please fix these ${missingFields.length} fields before continuing:`}
      </p>
      <ul className="flex flex-col gap-1">
        {missingFields.map((f) => {
          const message = errors[f as keyof typeof errors]?.message as
            | string
            | undefined;
          return (
            <li key={f}>
              <button
                type="button"
                onClick={() => scrollToField(f)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-destructive transition-colors hover:bg-destructive/10"
              >
                <ArrowRight className="size-3.5 shrink-0" />
                <span>
                  <span className="font-semibold">{FIELD_LABELS[f] ?? f}:</span>{" "}
                  {message ?? "This field is required"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;
  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
  };

  // ============ Stepper ============
  const stepper = (
    <ol className="flex flex-wrap items-center gap-3" aria-label="Booking progress">
      {([1, 2, 3] as const).map((step, i) => {
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full font-mono text-[11px]",
                isDone && "chrome-bg text-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
                isActive && "bg-primary text-primary-foreground glow-stepper",
                !isDone && !isActive && "border border-dashed border-line-2 text-muted-foreground",
              )}
            >
              {isDone ? <Check className="size-3.5" strokeWidth={3} /> : step}
            </span>
            <span
              className={cn(
                "font-mono text-[11px] uppercase tracking-[0.14em]",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {STEP_LABELS[step - 1]}
            </span>
            {i < 2 && (
              <span aria-hidden="true" className="hidden h-px w-10 bg-line sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );

  // ============ Summary sidebar ============
  const summary = (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-[20px] border border-line bg-card-gradient shadow-soft-lg">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            <ChromeBrand size={28} />
            <span className="font-serif text-xl leading-none tracking-tight">Your wash</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Order · Draft
          </span>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Service
            </span>
            <span className="text-right font-serif text-lg leading-tight tracking-tight text-foreground">
              {selectedServiceData?.name ?? "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Location
            </span>
            <span className="text-right text-[14px] text-foreground">
              {LOCATIONS.find((l) => l.slug === watchedLocation)?.addressLocality ?? "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Vehicle
            </span>
            <span className="text-right text-[14px] text-foreground">
              {watchedVehicle ? watchedVehicle.charAt(0).toUpperCase() + watchedVehicle.slice(1) : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              When
            </span>
            <span className="text-right text-[14px] text-foreground">
              {watchedDate ? fullDateFormatter.format(new Date(watchedDate)) : "—"}
              {watchedTime ? ` · ${watchedTime}` : ""}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Duration
            </span>
            <span className="text-right text-[14px] text-foreground">
              {selectedServiceData?.duration ?? "—"}
            </span>
          </div>
        </div>

        {selectedExtraObjs.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t border-dashed border-line px-6 py-4 font-mono text-[12px] tabular-nums">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Add-ons
            </span>
            {selectedExtraObjs.map((e) => (
              <div key={e.id} className="flex justify-between gap-3">
                <span className="font-sans text-foreground">{e.name}</span>
                <span className="text-foreground">${getExtraPrice(e, watchedVehicle).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-dashed border-line px-6 py-4 font-mono text-[12px] tabular-nums">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal (ex GST)</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (incl.)</span>
            <span className="text-foreground">${gst.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-line bg-brand-soft-gradient px-6 py-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Total
          </span>
          <span className="font-serif text-3xl leading-none text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      <p className="mt-4 px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        * Prices indicative. Excessively dirty vehicles may incur extra.
      </p>

      {currentStep === 3 && (
        <div className="mt-5 flex flex-col gap-3 lg:hidden">
          {missingBanner}
          {submitError && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-[12px] text-destructive">
              {submitError}
            </p>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? watchedPaymentMethod === "pay_now"
                ? "Redirecting…"
                : "Booking…"
              : watchedPaymentMethod === "pay_now"
                ? `Pay $${total.toFixed(2)} & book`
                : "Confirm & book"}
            <ArrowRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" onClick={goBack} className="w-full">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      )}
    </aside>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 3) void handleSubmit(onSubmit, onInvalid)(e);
      }}
      className="grid grid-cols-1 gap-6 sm:gap-10 lg:grid-cols-[1fr_360px] lg:gap-12"
    >
      <div className="flex flex-col gap-6 sm:gap-10">
        {stepper}

        {/* ============ Step 1 ============ */}
        {currentStep === 1 && (
          <section className="flex flex-col gap-5">
            <header className="flex flex-col gap-2">
              <h3
                className="font-serif italic leading-tight tracking-tight text-foreground"
                style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
              >
                Which wash today?
              </h3>
              <p className="text-[15px] text-muted-foreground">
                Pick the package. We&rsquo;ll dial price by vehicle in the next step.
              </p>
            </header>

            <ul
              id="field-service"
              className={cn(
                "flex flex-col gap-3 scroll-mt-24",
                errors.service && INVALID_GROUP_CLASS,
              )}
            >
              {services.map((service) => {
                const active = watchedService === service.id;
                const featured = service.bestValue === true;
                return (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => setValue("service", service.id, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "lift relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden rounded-[18px] border bg-card-gradient p-4 text-left transition-all sm:p-5",
                        active
                          ? "border-primary shadow-glow"
                          : "border-line hover:border-line-2 shadow-soft",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-5 place-items-center rounded-full transition-colors",
                          active ? "border-[6px] border-primary" : "border-[1.5px] border-line-2",
                        )}
                      />

                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                            {service.name}
                          </span>
                          {featured && (
                            <span className="rounded-pill bg-brand-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                              Best value
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] leading-snug text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                          <Clock className="size-3" />
                          {service.duration}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="font-serif text-3xl leading-none text-primary">
                          ${service.pricing.sedan}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          From / sedan
                        </span>
                      </div>
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        active
                          ? "mt-3 max-h-32 opacity-100 translate-y-0"
                          : "mt-0 max-h-0 opacity-0 -translate-y-1",
                      )}
                      aria-hidden={!active}
                    >
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="lg"
                          onClick={() => void goNext()}
                          className="w-full sm:w-auto"
                          tabIndex={active ? 0 : -1}
                        >
                          Continue
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <FieldError message={errors.service?.message} />
          </section>
        )}

        {/* ============ Step 2 ============ */}
        {currentStep === 2 && (
          <section className="flex flex-col gap-6 sm:gap-10">
            <header className="flex flex-col gap-2">
              <h3
                className="font-serif italic leading-tight tracking-tight text-foreground"
                style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
              >
                Tell us about it.
              </h3>
              <p className="text-[15px] text-muted-foreground">
                Vehicle size sets duration and final price.
              </p>
            </header>

            <div id="field-location" className="flex flex-col gap-4 scroll-mt-24">
              <Label className={LABEL_CLASS}>Location</Label>
              <div
                className={cn(
                  "grid grid-cols-1 gap-3 sm:grid-cols-2",
                  errors.location && INVALID_GROUP_CLASS,
                )}
              >
                {LOCATIONS.map((loc) => {
                  const active = watchedLocation === loc.slug;
                  return (
                    <button
                      key={loc.slug}
                      type="button"
                      onClick={() => setValue("location", loc.slug, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "lift flex flex-col gap-2 rounded-[18px] border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card-gradient hover:border-line-2 shadow-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-pill",
                          active ? "bg-primary-foreground text-primary" : "bg-secondary text-foreground/70",
                        )}
                      >
                        <MapPin className="size-4" />
                      </span>
                      <span className="font-serif text-xl leading-tight tracking-tight">
                        {loc.addressLocality}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[11px] uppercase tracking-[0.14em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {loc.streetAddress}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.location?.message} />
            </div>

            <div id="field-vehicleType" className="flex flex-col gap-4 scroll-mt-24">
              <Label className={LABEL_CLASS}>Vehicle size</Label>
              <div
                className={cn(
                  "grid grid-cols-1 gap-3 sm:grid-cols-3",
                  errors.vehicleType && INVALID_GROUP_CLASS,
                )}
              >
                {vehicleTypes.map((type) => {
                  const lowered = type.toLowerCase();
                  const active = watchedVehicle === lowered;
                  const detail = VEHICLE_DETAILS[type] ?? VEHICLE_DETAILS.Sedan;
                  const Icon = detail.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("vehicleType", lowered, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "lift flex flex-col gap-2 rounded-[18px] border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card-gradient hover:border-line-2 shadow-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-pill",
                          active ? "bg-primary-foreground text-primary" : "bg-secondary text-foreground/70",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="font-serif text-xl leading-tight tracking-tight">{type}</span>
                      <span
                        className={cn(
                          "font-mono text-[11px] uppercase tracking-[0.14em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {detail.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.vehicleType?.message} />
            </div>

            <div id="field-date" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center justify-between gap-3">
                <Label className={LABEL_CLASS}>Pick a day</Label>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  Next 14 days
                </span>
              </div>
              <input type="hidden" {...register("date")} />
              <div
                className={cn(
                  "grid grid-cols-4 gap-2 sm:grid-cols-7",
                  errors.date && INVALID_GROUP_CLASS,
                )}
              >
                {days.map((d) => {
                  const active = watchedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setValue("date", d.iso, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 rounded-lg border py-2 text-center transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card/40 text-foreground hover:border-line-2",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-[0.12em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {d.weekday}
                      </span>
                      <span
                        className={cn(
                          "font-serif text-xl font-light leading-none",
                          active ? "text-primary-foreground" : "text-foreground/80",
                        )}
                      >
                        {d.day}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-[0.12em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.date?.message} />
            </div>

            <div id="field-time" className="flex flex-col gap-4 scroll-mt-24">
              <Label className={LABEL_CLASS}>Pick a time</Label>
              <input type="hidden" {...register("time")} />
              <div
                className={cn(
                  "grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5",
                  errors.time && INVALID_GROUP_CLASS,
                )}
              >
                {timeSlots.map((time) => {
                  const active = watchedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setValue("time", time, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl border px-3 py-3.5 font-mono text-[14px] font-medium tracking-tight transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card/40 text-foreground hover:border-line-2",
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.time?.message} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <Label className={LABEL_CLASS}>Add extras (optional)</Label>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Skip if you don&rsquo;t need any
                </span>
              </div>
              <input type="hidden" {...register("extras")} />
              <ul className="flex flex-col gap-2">
                {extraServices
                  .filter((extra) => extra.priceNote !== "quote")
                  .map((extra) => {
                  const active = watchedExtras.includes(extra.id);
                  const price = getExtraPrice(extra, watchedVehicle);
                  const priceLabel =
                    extra.priceNote === "from" ? `+from $${price}` : `+$${price}`;
                  return (
                    <li key={extra.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const next = active
                            ? watchedExtras.filter((id) => id !== extra.id)
                            : [...watchedExtras, extra.id];
                          setValue("extras", next, { shouldDirty: true });
                        }}
                        aria-pressed={active}
                        className={cn(
                          "lift relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[14px] border p-3 text-left transition-all sm:p-4",
                          active
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-line bg-card/40 hover:border-line-2",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-5 place-items-center rounded-md border transition-colors",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-line-2",
                          )}
                        >
                          {active && <Check className="size-3.5" strokeWidth={3} />}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-medium leading-snug text-foreground">
                            {extra.name}
                          </span>
                          {extra.description && (
                            <span className="text-[12px] leading-snug text-muted-foreground line-clamp-1">
                              {extra.description}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[14px] tabular-nums text-foreground">
                          {priceLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ============ Step 3 ============ */}
        {currentStep === 3 && (
          <section className="flex flex-col gap-5 sm:gap-8">
            <header className="flex flex-col gap-2">
              <h3
                className="font-serif italic leading-tight tracking-tight text-foreground"
                style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
              >
                Seal the deal.
              </h3>
              <p className="text-[15px] text-muted-foreground">
                Last bit. Drop your details and we&rsquo;ll send confirmation.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className={LABEL_CLASS}>First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-10"
                    aria-invalid={errors.firstName ? true : undefined}
                    {...register("firstName")}
                  />
                </div>
                <FieldError message={errors.firstName?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className={LABEL_CLASS}>Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  aria-invalid={errors.lastName ? true : undefined}
                  {...register("lastName")}
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className={LABEL_CLASS}>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@example.com.au"
                    className="pl-10"
                    aria-invalid={errors.email ? true : undefined}
                    {...register("email")}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className={LABEL_CLASS}>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0412 345 678"
                    className="pl-10"
                    aria-invalid={errors.phone ? true : undefined}
                    {...register("phone")}
                  />
                </div>
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address" className={LABEL_CLASS}>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="123 Queen Street, Brisbane QLD 4000"
                  className="pl-10"
                  aria-invalid={errors.address ? true : undefined}
                  {...register("address")}
                />
              </div>
              <FieldError message={errors.address?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes" className={LABEL_CLASS}>Anything we should know?</Label>
              <Textarea
                id="notes"
                placeholder="Pet hair, sticky drinks, kids' seats — anything we should plan for."
                rows={3}
                {...register("notes")}
              />
            </div>

            <div
              id="field-paymentMethod"
              className="flex flex-col gap-4 scroll-mt-24"
            >
              <Label className={LABEL_CLASS}>How would you like to pay?</Label>
              <input type="hidden" {...register("paymentMethod")} />
              <div
                className={cn(
                  "grid grid-cols-1 gap-3 sm:grid-cols-2",
                  errors.paymentMethod && INVALID_GROUP_CLASS,
                )}
              >
                {[
                  {
                    value: "pay_now" as const,
                    title: "Pay now (card)",
                    subtitle: "Secure card checkout via Stripe",
                  },
                  {
                    value: "pay_on_collection" as const,
                    title: "Pay at collection",
                    subtitle: "Settle when we hand the keys back",
                  },
                ].map((opt) => {
                  const active = watchedPaymentMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setValue("paymentMethod", opt.value, {
                          shouldValidate: true,
                        })
                      }
                      aria-pressed={active}
                      className={cn(
                        "lift flex flex-col gap-1.5 rounded-[18px] border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card-gradient hover:border-line-2 shadow-soft",
                      )}
                    >
                      <span className="font-serif text-xl leading-tight tracking-tight">
                        {opt.title}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[11px] uppercase tracking-[0.14em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {opt.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.paymentMethod?.message} />
            </div>
          </section>
        )}

        {submitError && currentStep === 3 && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-[12px] text-destructive">
            {submitError}
          </p>
        )}

        {currentStep > 1 && missingBanner && (
          <div className={cn(currentStep === 3 && "hidden lg:block")}>
            {missingBanner}
          </div>
        )}

        {currentStep > 1 && (
          <div
            className={cn(
              "flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between",
              currentStep === 3 && "hidden lg:flex",
            )}
          >
            <Button type="button" variant="ghost" onClick={goBack} className="sm:w-auto">
              <ArrowLeft className="size-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button type="button" size="lg" onClick={() => void goNext()} className="sm:w-auto">
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={isSubmitting} className="sm:w-auto">
                {isSubmitting
                  ? watchedPaymentMethod === "pay_now"
                    ? "Redirecting…"
                    : "Booking…"
                  : watchedPaymentMethod === "pay_now"
                    ? `Pay $${total.toFixed(2)} & book`
                    : "Confirm & book"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {summary}
    </form>
  );
}
