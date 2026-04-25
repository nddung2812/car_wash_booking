"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import * as z from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Car,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles as SparkleIcon,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "@/components/visuals/Sparkles";
import { ChromeBrand } from "@/components/visuals/ChromeBrand";
import { services, vehicleTypes, timeSlots } from "@/data/services";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  service: z.string().min(1, "Please select a service"),
  vehicleType: z.string().min(1, "Please select vehicle type"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const STEP_FIELDS: Record<1 | 2 | 3, (keyof BookingFormData)[]> = {
  1: ["service"],
  2: ["vehicleType", "date", "time"],
  3: ["firstName", "lastName", "email", "phone", "address"],
};

const STEP_LABELS = ["Service", "Vehicle & time", "Contact"] as const;

const VEHICLE_DETAILS: Record<string, { icon: typeof Car; subtitle: string; modifier: string }> = {
  Sedan: { icon: Car, subtitle: "Up to 4.9m", modifier: "×1.0" },
  Wagon: { icon: Car, subtitle: "Wagon / hatch", modifier: "×1.05" },
  SUV: { icon: Car, subtitle: "4.6 — 5.1m", modifier: "×1.15" },
  "4x4": { icon: Car, subtitle: "Larger / 4×4", modifier: "×1.3" },
};

function getServicePrice(
  service: (typeof services)[0] | undefined,
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
    out.push({
      iso: d.toISOString().split("T")[0],
      weekday: d.toLocaleDateString("en-AU", { weekday: "short" }).toUpperCase(),
      day: d.getDate(),
      month: d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
      isToday: d.getTime() === today.getTime(),
    });
  }
  return out;
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const hasValidPreselection = services.some((s) => s.id === preselectedService);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
    hasValidPreselection ? 2 : 1,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, isLoaded: isUserLoaded } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: hasValidPreselection ? { service: preselectedService! } : undefined,
  });

  useEffect(() => {
    if (!isUserLoaded || !user) return;
    if (user.firstName) setValue("firstName", user.firstName);
    if (user.lastName) setValue("lastName", user.lastName);
    const email = user.primaryEmailAddress?.emailAddress;
    if (email) setValue("email", email);
  }, [isUserLoaded, user, setValue]);

  const watchedService = watch("service");
  const watchedVehicle = watch("vehicleType");
  const watchedDate = watch("date");
  const watchedTime = watch("time");
  const selectedServiceData = services.find((s) => s.id === watchedService);

  const days = useMemo(buildDays, []);

  const subtotal = getServicePrice(selectedServiceData, watchedVehicle);
  const gst = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

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
      const { booking } = await res.json();
      setConfirmationId(booking.confirmationCode);
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const goNext = async () => {
    const ok = await trigger(STEP_FIELDS[currentStep]);
    if (ok && currentStep < 3) setCurrentStep((s) => (s + 1) as 1 | 2 | 3);
  };
  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
  };
  const handleBookAnother = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setConfirmationId("");
    reset();
  };

  // ============ Success ============
  if (isSubmitted) {
    return (
      <div className="relative mx-auto max-w-3xl">
        <Sparkles count={18} className="-z-0 opacity-70" />
        <div className="relative flex flex-col items-center gap-6 rounded-[28px] border border-line bg-card-gradient p-10 text-center shadow-soft-lg sm:p-14">
          <div className="relative grid size-20 place-items-center rounded-full bg-primary text-primary-foreground glow-accent">
            <Check className="size-9" strokeWidth={2.5} />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{ animation: "pulseRing 2.4s ease-out infinite", border: "2px solid var(--brand)" }}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Booking confirmed · {confirmationId}
            </span>
            <h3
              className="font-serif italic leading-tight tracking-tight text-foreground"
              style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
            >
              See you{" "}
              <span className="not-italic">
                <span className="yellow-highlight">soon</span>.
              </span>
            </h3>
            <p className="max-w-md text-[15px] text-muted-foreground">
              We&rsquo;ve emailed your confirmation. Roll in a couple of minutes early — kettle&rsquo;s on.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 rounded-[20px] border border-dashed border-line p-5 text-left sm:grid-cols-2">
            {selectedServiceData && (
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Service
                </span>
                <span className="font-serif text-2xl leading-tight">
                  {selectedServiceData.name}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                When
              </span>
              <span className="text-[15px] text-foreground">
                {watchedDate ? fullDateFormatter.format(new Date(watchedDate)) : "—"} · {watchedTime}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Vehicle
              </span>
              <span className="text-[15px] text-foreground">
                {watchedVehicle ? watchedVehicle.charAt(0).toUpperCase() + watchedVehicle.slice(1) : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Total paid
              </span>
              <span className="font-serif text-2xl leading-tight text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <a href="#">Back to home</a>
            </Button>
            <Button onClick={handleBookAnother}>
              Book another wash
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <ul className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { Icon: Clock, label: "Arrive on time", body: "Spot held 15 min past your slot." },
              { Icon: Shield, label: "Free cancel", body: "Reschedule from your phone." },
              { Icon: SparkleIcon, label: "Love it guarantee", body: "Not perfect? We make it right." },
            ].map(({ Icon, label, body }) => (
              <li
                key={label}
                className="flex flex-col items-start gap-1 rounded-2xl border border-line bg-card/40 p-4 text-left"
              >
                <Icon className="size-4 text-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </span>
                <span className="text-[14px] text-foreground">{body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

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
    <aside className="lg:sticky lg:top-[88px]">
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

        <div className="flex flex-col gap-2 border-t border-dashed border-line px-6 py-4 font-mono text-[12px] tabular-nums">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
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
    </aside>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === 3) void handleSubmit(onSubmit)(e);
      }}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12"
    >
      <div className="flex flex-col gap-10">
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

            <ul className="flex flex-col gap-3">
              {services.map((service) => {
                const active = watchedService === service.id;
                const featured = service.id === "super-sparkles";
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
                              Most booked
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
                  </li>
                );
              })}
            </ul>
            {errors.service && (
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-destructive">
                {errors.service.message}
              </p>
            )}
          </section>
        )}

        {/* ============ Step 2 ============ */}
        {currentStep === 2 && (
          <section className="flex flex-col gap-10">
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

            <div className="flex flex-col gap-4">
              <Label>Vehicle size</Label>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                        "lift flex flex-col gap-2 rounded-[18px] border bg-card-gradient p-4 text-left transition-all",
                        active
                          ? "border-primary shadow-glow"
                          : "border-line hover:border-line-2 shadow-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-pill",
                          active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="font-serif text-xl leading-tight tracking-tight">{type}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {detail.subtitle}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {detail.modifier}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.vehicleType && (
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-destructive">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <Label>Pick a day</Label>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  Next 14 days
                </span>
              </div>
              <input type="hidden" {...register("date")} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                {days.map((d) => {
                  const active = watchedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setValue("date", d.iso, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-center transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-line bg-card/40 text-foreground hover:border-line-2",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.14em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {d.weekday}
                      </span>
                      <span className="font-serif text-2xl leading-none">{d.day}</span>
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.14em]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.date && (
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Label>Pick a time</Label>
              <input type="hidden" {...register("time")} />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {timeSlots.map((time) => {
                  const active = watchedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setValue("time", time, { shouldValidate: true })}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl border px-3 py-3 font-mono text-[12px] tracking-tight transition-all",
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
              {errors.time && (
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ============ Step 3 ============ */}
        {currentStep === 3 && (
          <section className="flex flex-col gap-8">
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
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="firstName" placeholder="John" className="pl-10" {...register("firstName")} />
                </div>
                {errors.firstName && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Doe" {...register("lastName")} />
                {errors.lastName && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@example.com.au"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0412 345 678"
                    className="pl-10"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="123 Queen Street, Brisbane QLD 4000"
                  className="pl-10"
                  {...register("address")}
                />
              </div>
              {errors.address && (
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Anything we should know?</Label>
              <Textarea
                id="notes"
                placeholder="Pet hair, sticky drinks, kids' seats — anything we should plan for."
                rows={3}
                {...register("notes")}
              />
            </div>
          </section>
        )}

        {submitError && currentStep === 3 && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-[12px] text-destructive">
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {currentStep > 1 ? (
            <Button type="button" variant="ghost" onClick={goBack} className="sm:w-auto">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : (
            <span className="hidden sm:inline" />
          )}

          {currentStep < 3 ? (
            <Button type="button" size="lg" onClick={() => void goNext()} className="sm:w-auto">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={isSubmitting} className="sm:w-auto">
              {isSubmitting ? "Booking…" : "Confirm & book"}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {summary}
    </form>
  );
}
