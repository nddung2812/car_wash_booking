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



export default function BookingForm() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const watchedService = watch("service");
  const watchedVehicle = watch("vehicleType");
  const selectedServiceData = services.find(s => s.id === watchedService);

  const getServicePrice = (service: typeof services[0], vehicleType: string) => {
    if (!service || !vehicleType) return 0;
    const vehicle = vehicleType.toLowerCase();
    if (vehicle.includes('suv') || vehicle.includes('4x4')) return service.pricing.suv;
    if (vehicle.includes('wagon')) return service.pricing.wagon;
    return service.pricing.sedan; // default to sedan pricing
  };

  const onSubmit = async (data: BookingFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Booking data:", data);
    setIsSubmitted(true);
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
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Book Another Service
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Service Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Service</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    watchedService === service.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setValue("service", service.id);
                    setSelectedService(service.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">From</div>
                        <Badge variant="secondary">${service.pricing.sedan}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
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

          {/* Vehicle and Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select onValueChange={(value) => setValue("vehicleType", value)}>
                <SelectTrigger>
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

          {/* Customer Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input {...register("firstName")} placeholder="John" />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input {...register("lastName")} placeholder="Doe" />
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
                {...register("notes")}
                placeholder="Any special requests or notes about your vehicle..."
                rows={3}
              />
            </div>
          </div>

          {/* Booking Summary */}
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
                      <span>{watchedVehicle.charAt(0).toUpperCase() + watchedVehicle.slice(1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedServiceData.duration}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${watchedVehicle ? getServicePrice(selectedServiceData, watchedVehicle) : selectedServiceData.pricing.sedan}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <p>* Excessively dirty vehicles may incur extra charges</p>
                  <p>** Prices are indicative only and vary slightly at different stores</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Book Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}