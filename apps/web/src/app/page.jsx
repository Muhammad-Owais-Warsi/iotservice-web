import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import {
  Thermometer,
  Droplet,
  Zap,
  DoorOpen,
  AlertTriangle,
  MapPin,
  BellOff,
  RefreshCw,
  Radio,
  Activity,
  TrendingUp,
  Plus,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { useLiveData, formatLastUpdate } from "@/utils/useLiveData";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recentSensorData, setRecentSensorData] = useState([]);

  // Live data for locations and alerts with 15-second auto-refresh
  const {
    data: liveData,
    loading: liveLoading,
    lastUpdate,
    refresh,
  } = useLiveData(
    async () => {
      const [locationsRes, alertsRes, sensorRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/alerts"),
        fetch("/api/sensor-data?limit=5"),
      ]);

      const locations = locationsRes.ok
        ? (await locationsRes.json()).locations || []
        : [];
      const alerts = alertsRes.ok ? (await alertsRes.json()).alerts || [] : [];
      const sensorData = sensorRes.ok
        ? (await sensorRes.json()).data || []
        : [];

      return { locations, alerts, sensorData };
    },
    {
      refreshInterval: 15000,
      cacheKey: "dashboard_data",
      enabled: !!user && profile?.status === "approved",
    },
  );

  const locations = liveData?.locations || [];
  const alerts = liveData?.alerts || [];
  const sensorData = liveData?.sensorData || [];

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
    } else if (user === null) {
      setInitialLoading(false);
    }
  }, [user]);

  const handleSnoozeAlert = async (alertId) => {
    try {
      const response = await fetch("/api/alerts/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (response.ok) {
        refresh();
      }
    } catch (error) {
      console.error("Failed to snooze alert:", error);
    }
  };

  if (userLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#1E293B]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F8BFF] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#1E293B]">Loading profile...</div>
      </div>
    );
  }

  if (profile.status === "pending") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            Pending Approval
          </h1>
          <p className="text-[#64748B] mb-6">
            Your account is awaiting admin approval. Please check back later.
          </p>
          <a
            href="/account/logout"
            className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  if (profile.status === "suspended") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-[#EF4444]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            Account Suspended
          </h1>
          <p className="text-[#64748B] mb-6">
            Your account has been suspended. Please contact your administrator.
          </p>
          <a
            href="/account/logout"
            className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const totalDevices = locations.reduce(
    (sum, loc) => sum + (loc.device_count || 0),
    0,
  );

  // Calculate average conditions from recent sensor data
  const avgTemp =
    sensorData.length > 0
      ? (
          sensorData.reduce(
            (sum, d) => sum + (parseFloat(d.temperature) || 0),
            0,
          ) / sensorData.length
        ).toFixed(1)
      : "N/A";
  const avgHumidity =
    sensorData.length > 0
      ? (
          sensorData.reduce(
            (sum, d) => sum + (parseFloat(d.humidity) || 0),
            0,
          ) / sensorData.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-['Inter']">
      <Sidebar
        activeItem="Dashboard"
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
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] rounded-2xl p-8 md:p-10 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center mb-3">
                  <Sparkles size={28} className="text-white mr-3" />
                  <h1 className="text-white text-3xl md:text-4xl font-bold">
                    Welcome back, {user.name?.split(" ")[0] || "User"}
                  </h1>
                </div>
                <p className="text-white text-opacity-90 text-base md:text-lg">
                  Monitor your facilities with real-time insights and
                  intelligent alerts
                </p>
              </div>

              <button
                onClick={refresh}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-white border-opacity-30 self-start md:self-auto"
              >
                <RefreshCw
                  size={20}
                  className={liveLoading ? "animate-spin" : ""}
                />
                <span className="font-medium">Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* Environmental Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-xl flex items-center justify-center">
                  <Thermometer size={24} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>Live</span>
                </div>
              </div>
              <h3 className="text-[#64748B] text-sm font-medium mb-1">
                Avg Temperature
              </h3>
              <p className="text-[#1E293B] text-2xl font-bold mb-1">
                {avgTemp !== "N/A" ? `${avgTemp}°C` : "Unknown"}
              </p>
              <p className="text-[#94A3B8] text-xs">
                {avgHumidity !== "N/A"
                  ? `${avgHumidity}% humidity`
                  : "No recent data"}
              </p>
            </div>

            {/* Active Devices */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-xl flex items-center justify-center">
                  <Activity size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-[#64748B] text-sm font-medium mb-1">
                Active Devices
              </h3>
              <p className="text-[#1E293B] text-2xl font-bold mb-1">
                {totalDevices}
              </p>
              <p className="text-[#94A3B8] text-xs">
                Across {locations.length} location
                {locations.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center">
                  <MapPin size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-[#64748B] text-sm font-medium mb-1">
                Locations
              </h3>
              <p className="text-[#1E293B] text-2xl font-bold mb-1">
                {locations.length}
              </p>
              <p className="text-[#94A3B8] text-xs">Monitoring facilities</p>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    activeAlerts.length > 0
                      ? "bg-gradient-to-br from-[#EF4444] to-[#F87171]"
                      : "bg-gradient-to-br from-[#6B7280] to-[#9CA3AF]"
                  }`}
                >
                  <AlertTriangle size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-[#64748B] text-sm font-medium mb-1">
                Active Alerts
              </h3>
              <p className="text-[#1E293B] text-2xl font-bold mb-1">
                {activeAlerts.length}
              </p>
              <p className="text-[#94A3B8] text-xs">
                {activeAlerts.length === 0 ? "All clear" : "Require attention"}
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-xl flex items-center justify-center mr-3">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[#1E293B] text-lg font-bold">
                    Quick Actions
                  </h2>
                  <p className="text-[#64748B] text-sm">
                    Essential facility management tools
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="/"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] text-white rounded-xl hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center">
                    <MapPin size={20} className="mr-3" />
                    <span className="font-medium">View All Locations</span>
                  </div>
                  <Plus
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>

                {(profile.role === "manager" ||
                  profile.role === "employee") && (
                  <a
                    href="/tickets"
                    className="flex items-center justify-between p-4 bg-[#F8FAFC] text-[#1E293B] rounded-xl hover:bg-[#F1F5F9] transition-all border border-gray-100"
                  >
                    <div className="flex items-center">
                      <FileText size={20} className="mr-3 text-[#64748B]" />
                      <span className="font-medium">Service Tickets</span>
                    </div>
                  </a>
                )}

                {(profile.role === "admin" || profile.role === "manager") && (
                  <a
                    href="/audit-logs"
                    className="flex items-center justify-between p-4 bg-[#F8FAFC] text-[#1E293B] rounded-xl hover:bg-[#F1F5F9] transition-all border border-gray-100"
                  >
                    <div className="flex items-center">
                      <BarChart3 size={20} className="mr-3 text-[#64748B]" />
                      <span className="font-medium">View Analytics</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center mr-3">
                  <Activity size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[#1E293B] text-lg font-bold">
                    Recent Readings
                  </h2>
                  <p className="text-[#64748B] text-sm">
                    Latest sensor data updates
                  </p>
                </div>
              </div>

              {sensorData.length === 0 ? (
                <div className="text-center py-8">
                  <Activity size={48} className="text-[#CBD5E1] mx-auto mb-3" />
                  <p className="text-[#64748B] text-sm">
                    No recent sensor data
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sensorData.slice(0, 4).map((reading, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Thermometer size={16} className="text-[#4F8BFF]" />
                        </div>
                        <div>
                          <p className="text-[#1E293B] text-sm font-medium">
                            {reading.temperature}°C / {reading.humidity}%
                          </p>
                          <p className="text-[#94A3B8] text-xs">
                            {new Date(reading.recorded_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          parseFloat(reading.temperature) > 30 ||
                          parseFloat(reading.humidity) > 70
                            ? "bg-[#EF4444]"
                            : "bg-[#10B981]"
                        }`}
                      ></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Alerts Section */}
          {activeAlerts.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-[#FEF2F2] to-[#FEE2E2] rounded-2xl p-6 border border-[#FECACA]">
              <div className="flex items-center mb-4">
                <AlertTriangle size={24} className="text-[#DC2626] mr-3" />
                <h2 className="text-[#DC2626] font-bold text-lg">
                  Active Alerts ({activeAlerts.length})
                </h2>
              </div>
              <div className="space-y-3">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-xl p-4 flex items-start justify-between shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="text-[#1E293B] text-sm font-medium mb-1">
                        {alert.message}
                      </p>
                      <p className="text-[#64748B] text-xs">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSnoozeAlert(alert.id)}
                      className="ml-3 flex items-center px-3 py-1.5 bg-[#F1F5F9] text-[#64748B] text-xs rounded-lg hover:bg-[#E2E8F0] transition-colors"
                    >
                      <BellOff size={14} className="mr-1" />
                      Snooze
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations Section */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-xl flex items-center justify-center mr-3">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[#1E293B] text-lg font-bold">
                    Your Locations
                  </h2>
                  <p className="text-[#64748B] text-sm">
                    Click on any location to view sensors and graphs
                  </p>
                </div>
              </div>
            </div>

            {locations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B] text-sm mb-2">
                  No locations found
                </p>
                <p className="text-[#94A3B8] text-xs">
                  Contact your administrator to set up locations
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location) => {
                  const locationAlerts = alerts.filter(
                    (a) =>
                      a.location_id === location.id && a.status === "active",
                  );
                  const hasAlerts = locationAlerts.length > 0;

                  return (
                    <a
                      key={location.id}
                      href={`/location/${location.id}`}
                      className="block bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#4F8BFF] transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-[#1E293B] font-bold text-lg mb-1 group-hover:text-[#4F8BFF] transition-colors">
                            {location.name}
                          </h3>
                          <p className="text-[#64748B] text-sm flex items-center gap-1">
                            <MapPin size={14} />
                            {location.pincode}
                          </p>
                        </div>
                        {hasAlerts && (
                          <div className="w-8 h-8 bg-[#FEE2E2] rounded-full flex items-center justify-center">
                            <AlertTriangle
                              size={16}
                              className="text-[#EF4444]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Activity size={16} className="text-[#4F8BFF]" />
                            <span className="text-[#1E293B] text-sm font-medium">
                              {location.device_count || 0}
                            </span>
                            <span className="text-[#94A3B8] text-xs">
                              {location.device_count === 1
                                ? "device"
                                : "devices"}
                            </span>
                          </div>
                          {hasAlerts && (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle
                                size={16}
                                className="text-[#EF4444]"
                              />
                              <span className="text-[#EF4444] text-sm font-medium">
                                {locationAlerts.length}
                              </span>
                              <span className="text-[#94A3B8] text-xs">
                                {locationAlerts.length === 1
                                  ? "alert"
                                  : "alerts"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-[#4F8BFF] text-xs font-medium group-hover:translate-x-1 transition-transform">
                          View →
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
