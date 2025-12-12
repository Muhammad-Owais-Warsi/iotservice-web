import { MapPin } from "lucide-react";

export default function LocationMapFallback({ location, devices, alerts }) {
  return (
    <div className="w-full h-full bg-[#2A2A2A] flex flex-col items-center justify-center p-6">
      <MapPin size={48} className="text-[#536081] mb-4" />
      <h3 className="text-[#E5E5E5] font-bold text-lg mb-2">
        Map View Unavailable
      </h3>
      <p className="text-[#B0B0B0] text-sm text-center mb-6">
        The map couldn't load. This might be due to an ad blocker,
        <br />
        network issue, or missing Google Maps API key.
      </p>

      {/* Location Summary Card */}
      <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#404040] w-full max-w-md">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#333333]">
          <span className="text-[#B0B0B0] text-sm">Location:</span>
          <span className="text-[#E5E5E5] font-bold">{location.name}</span>
        </div>

        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#333333]">
          <span className="text-[#B0B0B0] text-sm">Pincode:</span>
          <span className="text-[#E5E5E5] font-medium">{location.pincode}</span>
        </div>

        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#333333]">
          <span className="text-[#B0B0B0] text-sm">Total Devices:</span>
          <span className="text-[#E5E5E5] font-medium">{devices.length}</span>
        </div>

        {/* Device Status Indicators */}
        {devices.length > 0 && (
          <div>
            <p className="text-[#B0B0B0] text-xs mb-2">Device Status:</p>
            <div className="flex flex-wrap gap-2">
              {devices.map((device) => {
                const hasAlert = alerts.some(
                  (a) => a.device_id === device.id && a.status === "active",
                );
                return (
                  <div
                    key={device.id}
                    className="flex items-center gap-2 bg-[#2A2A2A] px-3 py-2 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        hasAlert ? "bg-[#FF0000]" : "bg-[#00FF00]"
                      }`}
                    ></div>
                    <span className="text-[#E5E5E5] text-xs">
                      {device.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[#666666] text-xs mt-3 text-center">
              🟢 Normal • 🔴 Alert
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
