import React from 'react';
import { services } from '@/data/services';
import { Star } from 'lucide-react';

const ServicesSection = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-200 h-full flex flex-col">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-3">
            <Star className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
            Our Premium Services
          </h2>
        </div>
        <p className="text-lg text-blue-700">
          Professional car wash and detailing services designed to keep your vehicle looking its best.
        </p>
      </div>

        {/* Services Grid */}
        <div className="space-y-8 flex-1">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`${
                service.id === 'super-sparkles'
                  ? 'bg-blue-50 rounded-lg p-6 border-2 border-blue-200 shadow-sm relative'
                  : 'bg-white rounded-lg p-6 shadow-sm border border-gray-200'
              }`}
            >
              {service.id === 'super-sparkles' && (
                <div className="absolute -top-3 left-6">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600 text-base mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <a
                    href={service.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    Watch Video →
                  </a>
                </div>
                <div className="lg:col-span-1">
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      service.id === 'super-sparkles'
                        ? 'bg-white border border-blue-100'
                        : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <span className="text-sm font-medium text-gray-700">Sedan</span>
                      <span className="text-xl font-bold text-gray-900">${service.pricing.sedan}</span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      service.id === 'super-sparkles'
                        ? 'bg-white border border-blue-100'
                        : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <span className="text-sm font-medium text-gray-700">Wagon</span>
                      <span className="text-xl font-bold text-gray-900">${service.pricing.wagon}</span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      service.id === 'super-sparkles'
                        ? 'bg-white border border-blue-100'
                        : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <span className="text-sm font-medium text-gray-700">4x4</span>
                      <span className="text-xl font-bold text-gray-900">${service.pricing.suv}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

export default ServicesSection;