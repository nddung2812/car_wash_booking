"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import SparklesLogo from "@/components/SparklesLogo";
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

const STEP_LABELS = ["Service", "Details", "Contact & confirm"] as const;

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
  });

  const watchedService = watch("service");
  const watchedVehicle = watch("vehicleType");
  const selectedServiceData = services.find((s) => s.id === watchedService);

  const getServicePrice = (service: (typeof services)[0], vehicleType: string) => {
    if (!service || !vehicleType) return 0;
    const vehicle = vehicleType.toLowerCase();
    if (vehicle.includes("suv") || vehicle.includes("4x4")) return service.pricing.suv;
    if (vehicle.includes("wagon")) return service.pricing.wagon;
    return service.pricing.sedan;
  };

  const onSubmit = async (data: BookingFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Booking data:", data);
    setIsSubmitted(true);
  };

  const goNext = async () => {
    const ok = await trigger(STEP_FIELDS[currentStep]);
    if (ok && currentStep < 3) {
      setCurrentStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as 1 | 2 | 3);
    }
  };

  const handleBookAnother = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    reset();
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-700">Booking Confirmed!</h3>
            <p className="text-gray-600">
              Thank you! We&apos;ve received your booking request. You&apos;ll receive a confirmation email shortly.
            </p>
            <Button onClick={handleBookAnother} variant="outline">
              Book Another Service
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SparklesLogo size={28} showText={false} />
          <span>Book Your Hyperdome Service</span>
        </CardTitle>
        <CardDescription>
          Schedule your appointment and let us take care of your vehicle
        </CardDescription>
        <div className="pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Step {currentStep} of 3 — {STEP_LABELS[currentStep - 1]}
          </p>
          <div className="flex gap-2" role="list" aria-label="Booking progress">
            {([1, 2, 3] as const).map((step) => (
              <div
                key={step}
                role="listitem"
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  step <= currentStep ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 3) {
              void handleSubmit(onSubmit)(e);
            }
          }}
          className="space-y-8"
        >
          {currentStep === 1 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Service</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      watchedService === service.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setValue("service", service.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-semibold leading-tight">{service.name}</h3>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                            From
                          </div>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 font-medium">
                            ${service.pricing.sedan}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-snug">
                        {service.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1.5">
                        <Clock className="h-3 w-3 mr-1 shrink-0" />
                        {service.duration}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.service && (
                <p className="text-sm text-red-500">{errors.service.message}</p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={watchedVehicle || undefined}
                    onValueChange={(value) => setValue("vehicleType", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleType && (
                    <p className="text-sm text-red-500">{errors.vehicleType.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="date">Preferred Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      min={minDate}
                      className="pl-10"
                      {...register("date")}
                    />
                  </div>
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Preferred Time</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={watch("time") === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setValue("time", time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {errors.time && (
                  <p className="text-sm text-red-500">{errors.time.message}</p>
                )}
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              {selectedServiceData && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{selectedServiceData.name}</span>
                      </div>
                      {watchedVehicle && (
                        <div className="flex justify-between">
                          <span>Vehicle:</span>
                          <span>
                            {watchedVehicle.charAt(0).toUpperCase() + watchedVehicle.slice(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{watch("date")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{watch("time")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedServiceData.duration}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>
                          $
                          {watchedVehicle
                            ? getServicePrice(selectedServiceData, watchedVehicle)
                            : selectedServiceData.pricing.sedan}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                      <p>* Excessively dirty vehicles may incur extra charges</p>
                      <p>** Prices are indicative only and vary slightly at different stores</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...register("firstName")} placeholder="John" />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...register("lastName")} placeholder="Doe" />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        {...register("email")}
                        placeholder="john.smith@example.com.au"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        {...register("phone")}
                        placeholder="0412 345 678"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      className="pl-10"
                      {...register("address")}
                      placeholder="123 Queen Street, Brisbane QLD 4000"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Any special requests or notes about your vehicle..."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <div className="sm:flex-1">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto">
                  Back
                </Button>
              )}
            </div>
            <div className="sm:flex sm:justify-end sm:flex-1">
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => void goNext()}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Book Now"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
