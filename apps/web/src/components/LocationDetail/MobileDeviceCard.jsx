import {
  Thermometer,
  Droplet,
  Zap,
  DoorOpen,
  DoorClosed,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { formatLastUpdate } from "@/utils/useLiveData";
import { useState } from "react";

export function MobileDeviceCard({
  device,
  alerts,
  isExpanded,
  onToggle,
  userRole,
  locationId,
}) {
  const reading = device.latestReading;
  const hasReading = !!reading;
  const deviceAlerts = alerts.filter(
    (a) => a.device_id === device.id && a.status === "active",
  );
  const hasAlert = deviceAlerts.length > 0;
  const [showDropdown, setShowDropdown] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async (days) => {
    setDownloading(true);
    setShowDropdown(false);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: parseInt(locationId),
          deviceId: device.id,
          days,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${device.name}-report-${days}days-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Report download error:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const canDownloadReports = userRole === "manager" || userRole === "employee";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        hasAlert ? "border-[#DC2626]" : "border-gray-100"
      }`}
    >
      {/* Collapsed Header - Always Visible */}
      <div className="w-full p-4 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              hasAlert
                ? "bg-[#EF4444] animate-pulse"
                : hasReading
                  ? "bg-[#10B981]"
                  : "bg-[#CBD5E1]"
            }`}
          ></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#1E293B] font-bold text-base truncate">
              {device.name}
            </h3>
            <p className="text-[#64748B] text-xs">{device.device_type}</p>
          </div>

          {/* Quick Stats */}
          {hasReading && reading.temperature !== null && (
            <div className="text-right">
              <p className="text-[#1E293B] text-sm font-bold">
                {reading.temperature}°C
              </p>
            </div>
          )}
        </button>

        {/* Download Button + Expand Icon */}
        <div className="flex items-center gap-2 ml-2">
          {canDownloadReports && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                disabled={downloading}
                className="p-2 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                title="Download Report"
              >
                <Download size={14} className="text-[#4F8BFF]" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport(days);
                      }}
                      className="w-full text-left px-3 py-2 text-[#1E293B] hover:bg-[#F8FAFC] first:rounded-t-lg last:rounded-b-lg text-sm"
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={onToggle} className="text-[#64748B]">
            {isExpanded ? (
              <ChevronUp size={20} className="text-[#64748B]" />
            ) : (
              <ChevronDown size={20} className="text-[#64748B]" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {hasReading && (
            <div className="flex items-center gap-2 mb-4 mt-4 text-[#64748B] text-xs">
              <Clock size={12} />
              <span>
                Updated{" "}
                {formatLastUpdate(new Date(reading.recorded_at).getTime())}
              </span>
            </div>
          )}

          {hasReading ? (
            <div className="space-y-3">
              {reading.temperature !== null && (
                <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center">
                    <Thermometer size={18} className="text-[#FF6B6B] mr-3" />
                    <div>
                      <p className="text-[#64748B] text-xs">Temperature</p>
                      <p className="text-[#94A3B8] text-xs">
                        Max: {device.temp_threshold}°C
                      </p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] text-xl font-bold">
                    {reading.temperature}°C
                  </p>
                </div>
              )}

              {reading.humidity !== null && (
                <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center">
                    <Droplet size={18} className="text-[#4F8BFF] mr-3" />
                    <div>
                      <p className="text-[#64748B] text-xs">Humidity</p>
                      <p className="text-[#94A3B8] text-xs">
                        Max: {device.humidity_threshold}%
                      </p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] text-xl font-bold">
                    {reading.humidity}%
                  </p>
                </div>
              )}

              {reading.electricity !== null && (
                <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center">
                    <Zap size={18} className="text-[#F59E0B] mr-3" />
                    <div>
                      <p className="text-[#64748B] text-xs">Electricity</p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] text-xl font-bold">
                    {reading.electricity} kWh
                  </p>
                </div>
              )}

              {reading.door_status && (
                <div className="bg-[#F8FAFC] rounded-lg p-3 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center">
                    {reading.door_status === "open" ? (
                      <DoorOpen size={18} className="text-[#10B981] mr-3" />
                    ) : (
                      <DoorClosed size={18} className="text-[#64748B] mr-3" />
                    )}
                    <div>
                      <p className="text-[#64748B] text-xs">Door Status</p>
                    </div>
                  </div>
                  <p className="text-[#1E293B] text-xl font-bold capitalize">
                    {reading.door_status}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#94A3B8] text-sm">No sensor data available</p>
            </div>
          )}

          {hasAlert && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-[#EF4444] text-sm">
                <AlertTriangle size={16} className="mr-1" />
                <span>
                  {deviceAlerts.length} Active Alert
                  {deviceAlerts.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
