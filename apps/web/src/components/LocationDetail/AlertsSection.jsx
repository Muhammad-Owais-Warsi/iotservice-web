import { AlertTriangle } from "lucide-react";

export function AlertsSection({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-[#FEF2F2] to-[#FEE2E2] border border-[#FECACA] rounded-xl p-4">
      <div className="flex items-center mb-3">
        <AlertTriangle size={20} className="text-[#DC2626] mr-2" />
        <h2 className="text-[#DC2626] font-bold text-lg">
          Active Alerts ({alerts.length})
        </h2>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-[#1E293B] text-sm font-medium">
              {alert.message}
            </p>
            <p className="text-[#64748B] text-xs mt-1">
              Device: {alert.device_name} •{" "}
              {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
