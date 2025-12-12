import { useState } from "react";
import { DeviceCard } from "./DeviceCard";
import { MobileDeviceCard } from "./MobileDeviceCard";

export function DevicesSection({ devices, alerts, userRole, locationId }) {
  const [expandedDevices, setExpandedDevices] = useState(new Set());

  const toggleDevice = (deviceId) => {
    setExpandedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-[#64748B]">
          No devices configured for this location
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-[#1E293B] font-bold text-xl mb-4">
        Devices ({devices.length})
      </h2>

      {/* Desktop View - Grid */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            alerts={alerts}
            userRole={userRole}
            locationId={locationId}
          />
        ))}
      </div>

      {/* Mobile View - Stacked Expandable Cards */}
      <div className="lg:hidden space-y-3">
        {devices.map((device) => (
          <MobileDeviceCard
            key={device.id}
            device={device}
            alerts={alerts}
            isExpanded={expandedDevices.has(device.id)}
            onToggle={() => toggleDevice(device.id)}
            userRole={userRole}
            locationId={locationId}
          />
        ))}
      </div>
    </div>
  );
}
