import React from 'react';
import { extraServices } from '@/data/services';
import { Plus } from 'lucide-react';

const ExtraServicesSection = () => {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 shadow-sm border border-yellow-200 h-full flex flex-col">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-500 p-3 rounded-full mr-3">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-900">
            Extra Services
          </h2>
        </div>
        <p className="text-lg text-yellow-700 font-medium">
          (Can be combined with any other service)
        </p>
      </div>

      {/* Vehicle Type Headers */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div></div>
        <div className="text-center font-semibold text-gray-900">Sedan</div>
        <div className="text-center font-semibold text-gray-900">Wagon</div>
        <div className="text-center font-semibold text-gray-900">4x4</div>
      </div>

      {/* Extra Services Grid */}
      <div className="space-y-4 flex-1">
        {extraServices.map((service) => (
          <div key={service.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
              {service.description && (
                <p className="text-xs text-gray-500 mt-1">{service.description}</p>
              )}
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-yellow-300 shadow-sm">
              <div className="text-lg font-bold text-gray-900">${service.pricing.sedan}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-yellow-300 shadow-sm">
              <div className="text-lg font-bold text-gray-900">${service.pricing.wagon}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-yellow-300 shadow-sm">
              <div className="text-lg font-bold text-gray-900">${service.pricing.suv}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Please note:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>* Excessively dirty vehicles may incur extra charges</p>
          <p>** Prices are indicative only and vary slightly at different stores.</p>
          <p>*** Please ring the stores directly to make bookings and confirm pricing.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtraServicesSection;