import React from "react";
import useUser from "@/utils/useUser";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useProfile } from "@/hooks/useProfile";
import { useLocationData } from "@/hooks/useLocationData";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { getCoordinatesFromPincode } from "@/utils/coordinates";
import { LocationHeader } from "@/components/LocationDetail/LocationHeader";
import { AlertsSection } from "@/components/LocationDetail/AlertsSection";
import { MapSection } from "@/components/LocationDetail/MapSection";
import { ChartsSection } from "@/components/LocationDetail/ChartsSection";
import { DevicesSection } from "@/components/LocationDetail/DevicesSection";
import { Download } from "lucide-react";

export default function LocationDetailPage({ params }) {
  const { data: user, loading: userLoading } = useUser();
  const { profile, initialLoading } = useProfile(user);
  const locationId = params.id;

  const { location, devices, alerts, liveLoading, lastUpdate, refresh } =
    useLocationData(locationId, user, profile);

  const [selectedDays, setSelectedDays] = React.useState(7);
  const [downloadingReport, setDownloadingReport] = React.useState(null);
  const historicalData = useHistoricalData(devices, selectedDays);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Download report handler
  const handleDownloadReport = async (days) => {
    setDownloadingReport(days);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: parseInt(locationId),
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
      a.download = `sensor-report-${days}days-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Report download error:", error);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingReport(null);
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log("Location page state:", {
      userLoading,
      initialLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileStatus: profile?.status,
      hasLocation: !!location,
      locationId,
    });
  }, [userLoading, initialLoading, user, profile, location, locationId]);

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
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            Loading Profile
          </h1>
          <p className="text-[#64748B] mb-6">
            Please wait while we load your profile...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F8BFF] mx-auto"></div>
        </div>
      </div>
    );
  }

  // Check profile status
  if (profile.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            {profile.status === "pending"
              ? "Pending Approval"
              : "Account Issue"}
          </h1>
          <p className="text-[#64748B] mb-6">
            {profile.status === "pending"
              ? "Your account is awaiting admin approval."
              : "Your account status does not allow access."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-[#1E293B] text-xl mb-4">Location not found</div>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const coordinates = getCoordinatesFromPincode(location.pincode);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-['Inter']">
      <Sidebar
        activeItem="Dashboard"
        userRole={profile?.role || "employee"}
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
          <LocationHeader
            location={location}
            liveLoading={liveLoading}
            lastUpdate={lastUpdate}
            refresh={refresh}
          />

          <AlertsSection alerts={activeAlerts} />

          {/* Report Download Section - Only for managers and employees */}
          {(profile?.role === "manager" || profile?.role === "employee") && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-[#1E293B] font-bold text-lg mb-1">
                    Download Reports
                  </h2>
                  <p className="text-[#64748B] text-sm">
                    Generate and download sensor data reports
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => handleDownloadReport(days)}
                      disabled={downloadingReport !== null}
                      className="flex items-center gap-2 px-4 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      {downloadingReport === days ? (
                        <span>Generating...</span>
                      ) : (
                        <span>{days} Days</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <MapSection
            location={location}
            devices={devices}
            alerts={alerts}
            coordinates={coordinates}
          />

          <ChartsSection
            historicalData={historicalData}
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />

          <DevicesSection
            devices={devices}
            alerts={alerts}
            userRole={profile?.role}
            locationId={locationId}
          />
        </main>
      </div>
    </div>
  );
}
