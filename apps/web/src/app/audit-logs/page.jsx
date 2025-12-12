import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import {
  Shield,
  User,
  MapPin,
  HardDrive,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";
import { useLiveData, formatLastUpdate } from "@/utils/useLiveData";

const ACTION_ICONS = {
  USER_CREATED: User,
  USER_APPROVED: User,
  USER_SUSPENDED: User,
  USER_REACTIVATED: User,
  LOCATION_CREATED: MapPin,
  LOCATION_UPDATED: MapPin,
  DEVICE_CREATED: HardDrive,
  DEVICE_UPDATED: HardDrive,
  ALERT_SNOOZED: AlertTriangle,
  TICKET_CREATED: FileText,
  TICKET_UPDATED: FileText,
};

const ACTION_COLORS = {
  USER_CREATED: "text-[#4ADE80]",
  USER_APPROVED: "text-[#4ADE80]",
  USER_SUSPENDED: "text-[#FF6B6B]",
  USER_REACTIVATED: "text-[#FFFF00]",
  LOCATION_CREATED: "text-[#5B94FF]",
  LOCATION_UPDATED: "text-[#5B94FF]",
  DEVICE_CREATED: "text-[#A78BFA]",
  DEVICE_UPDATED: "text-[#A78BFA]",
  ALERT_SNOOZED: "text-[#FFA500]",
  TICKET_CREATED: "text-[#4ADE80]",
  TICKET_UPDATED: "text-[#FFFF00]",
};

export default function AuditLogsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Live data for audit logs and alerts
  const {
    data: liveData,
    loading: liveLoading,
    lastUpdate,
    refresh,
  } = useLiveData(
    async () => {
      const [logsRes, alertsRes] = await Promise.all([
        fetch("/api/audit-logs?limit=50"),
        fetch("/api/alerts"),
      ]);

      const logsData = logsRes.ok ? await logsRes.json() : {};
      const alertsData = alertsRes.ok ? await alertsRes.json() : {};

      return {
        logs: logsData.logs || [],
        alerts: alertsData.alerts || [],
      };
    },
    {
      refreshInterval: 30000, // 30 seconds
      cacheKey: "audit_logs",
      enabled: !!user && profile?.status === "approved",
    },
  );

  const logs = liveData?.logs || [];
  const alerts = liveData?.alerts || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (userLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#E5E5E5]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  if (!profile || profile.role === "employee") {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 text-center">
          <Shield size={48} className="text-[#FF6B6B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#E5E5E5] mb-2">
            Access Denied
          </h1>
          <p className="text-[#B0B0B0]">
            Only admins and managers can view audit logs.
          </p>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");

  return (
    <div className="min-h-screen bg-[#121212] font-['Nanum_Gothic']">
      <Sidebar
        activeItem="Audit Logs"
        userRole={profile.role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="md:ml-60">
        <TopBar
          setSidebarOpen={setSidebarOpen}
          userName={user.name || user.email}
          alertCount={activeAlerts.length}
        />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-[#E5E5E5] font-['Lato'] font-extrabold text-2xl sm:text-3xl mb-2">
              Audit Logs
            </h1>
            <p className="text-[#B0B0B0] text-sm">
              Track all user actions and system events
            </p>
          </div>

          {/* Logs Table */}
          <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2A2A2A] border-b border-[#404040]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-[#666666]"
                      >
                        No audit logs yet
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const Icon = ACTION_ICONS[log.action] || Shield;
                      const iconColor =
                        ACTION_COLORS[log.action] || "text-[#B0B0B0]";

                      return (
                        <tr
                          key={log.id}
                          className="border-b border-[#333333] hover:bg-[#262626] transition-colors"
                        >
                          <td className="px-4 py-3 text-[#E5E5E5] text-sm">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-[#666666]" />
                              <span>
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[#666666] text-xs mt-1">
                              {formatLastUpdate(
                                new Date(log.created_at).getTime(),
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#E5E5E5] text-sm">
                            <div>{log.user_name || "Unknown"}</div>
                            <div className="text-[#666666] text-xs">
                              {log.user_email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon size={16} className={iconColor} />
                              <span className="text-[#E5E5E5] text-sm">
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#E5E5E5] text-sm">
                            <div className="capitalize">{log.entity_type}</div>
                            {log.entity_id && (
                              <div className="text-[#666666] text-xs">
                                ID: {log.entity_id}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#666666] text-sm font-mono">
                            {log.ip_address || "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-[#1E1E1E] border border-[#333333] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-[#5B94FF] mt-0.5" />
              <div>
                <h3 className="text-[#E5E5E5] font-semibold mb-1">
                  About Audit Logs
                </h3>
                <p className="text-[#B0B0B0] text-sm">
                  {profile.role === "admin"
                    ? "As an admin, you can see all actions across the entire system."
                    : "As a manager, you can see actions from users in your company."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
