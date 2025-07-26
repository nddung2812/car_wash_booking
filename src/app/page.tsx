import Header from "@/components/Header";
import BannerSlider from "@/components/BannerSlider";
import BookingForm from "@/components/BookingForm";
import ReviewsSection from "@/components/ReviewsSection";
import ServicesSection from "@/components/ServicesSection";
import ExtraServicesSection from "@/components/ExtraServicesSection";
import SparklesLogo from "@/components/SparklesLogo";
import { services } from "@/data/services";
import { MapPin, Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section with Banner Slider */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BannerSlider />
          </div>
        </section>

                        {/* Services Section */}
        <section id="services" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
              {/* Main Services */}
              <div className="h-full">
                <ServicesSection />
              </div>

              {/* Extra Services */}
              <div className="h-full">
                <ExtraServicesSection />
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Book Your Service
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Schedule your car wash appointment online. It&apos;s quick, easy, and convenient.
              </p>
            </div>
            <BookingForm />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews">
          <ReviewsSection />
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Visit Our Locations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find us at both Hyperdome Shopping Centre locations. We&apos;re open 7 days a week.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Shailer Park Location</p>
                        <p className="text-gray-600">Hyperdome Shopping Centre</p>
                        <p className="text-gray-600">Carpark Basement - Mandew St</p>
                        <p className="text-gray-600">Shailer Park QLD 4128</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Loganholme Location</p>
                        <p className="text-gray-600">Hyperdome Shopping Centre</p>
                        <p className="text-gray-600">Carpark Basement - 2 Leda Dr</p>
                        <p className="text-gray-600">Loganholme QLD 4129</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Phone</p>
                        <p className="text-gray-600">(07) 3806 0358</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday</span>
                      <span>8:30 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tuesday</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wednesday</span>
                      <span>8:30 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thursday</span>
                      <span>8:30 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday</span>
                      <span>8:30 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>8:30 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-gray-200 rounded-lg h-64 lg:h-96 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.887531633727!2d153.16938207546565!3d-27.658951176210298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b91423b28b00705%3A0x41c1806fafd6115d!2sSparkles%20Car%20Wash!5e0!3m2!1sen!2sau!4v1753526071902!5m2!1sen!2sau"
                  width="100%"
                  height="100%"
                  style={{border: 0}}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hyperdome Location"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex flex-col items-center mb-4">
                <SparklesLogo size={80} showText={true} />
              </div>
              <p className="text-gray-400 mb-4">
                Professional car wash and detailing services that keep your vehicle looking its absolute best.
                We use eco-friendly products and state-of-the-art equipment.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#booking" className="hover:text-white transition-colors">Book Now</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                {services.map((service) => (
                  <li key={service.id}>{service.name}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hyperdome. All rights reserved.</p>
            <p className="text-sm mt-2">ABN 50 162 253 072</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
