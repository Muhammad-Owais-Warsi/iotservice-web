import { MapPin } from "lucide-react";
import LocationMap from "@/components/LocationMap";

export function MapSection({ location, devices, alerts, coordinates }) {
  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-[#1E293B] font-bold text-lg flex items-center">
          <MapPin size={20} className="mr-2 text-[#4F8BFF]" />
          Location Map
        </h2>
      </div>
      <div className="h-[300px] sm:h-[400px]">
        <LocationMap
          location={location}
          devices={devices}
          alerts={alerts}
          coordinates={coordinates}
        />
      </div>
    </div>
  );
}
