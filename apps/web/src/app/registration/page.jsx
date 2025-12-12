import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import {
  Building,
  Thermometer,
  MapPin,
  Plus,
  Loader,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function RegistrationPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("facility");
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Facility form state
  const [facilityForm, setFacilityForm] = useState({
    name: "",
    pincode: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
  });

  // Sensor form state
  const [sensorForm, setSensorForm] = useState({
    locationId: "",
    name: "",
    deviceType: "temperature",
    tempThreshold: "30",
    humidityThreshold: "70",
    installationDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, locationsRes, alertsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/locations"),
          fetch("/api/alerts"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData.locations || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleFacilitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: facilityForm.name,
          pincode: facilityForm.pincode,
          companyId: profile.company_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Facility registered successfully!",
        });
        setFacilityForm({
          name: "",
          pincode: "",
          address: "",
          contactPerson: "",
          contactPhone: "",
        });

        // Refresh locations list
        const locationsRes = await fetch("/api/locations");
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData.locations || []);
        }
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to register facility",
        });
      }
    } catch (error) {
      console.error("Failed to register facility:", error);
      setMessage({ type: "error", text: "Failed to register facility" });
    } finally {
      setLoading(false);
    }
  };

  const handleSensorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: parseInt(sensorForm.locationId),
          name: sensorForm.name,
          deviceType: sensorForm.deviceType,
          tempThreshold: parseFloat(sensorForm.tempThreshold),
          humidityThreshold: parseFloat(sensorForm.humidityThreshold),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Sensor registered successfully!",
        });
        setSensorForm({
          locationId: "",
          name: "",
          deviceType: "temperature",
          tempThreshold: "30",
          humidityThreshold: "70",
          installationDate: "",
          notes: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to register sensor",
        });
      }
    } catch (error) {
      console.error("Failed to register sensor:", error);
      setMessage({ type: "error", text: "Failed to register sensor" });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#E5E5E5]">
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

  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#E5E5E5]">Access denied</div>
      </div>
    );
  }

  const activeAlerts = [];

  return (
    <div className="min-h-screen bg-[#121212] font-['Nanum_Gothic']">
      <Sidebar
        activeItem="Registration"
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
              Registration
            </h1>
            <p className="text-[#B0B0B0] text-sm">
              Register new facilities and sensors for monitoring
            </p>
          </div>

          {/* Message Banner */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-center ${
                message.type === "success"
                  ? "bg-[#0A3320] border-[#10B981] text-[#10B981]"
                  : "bg-[#441111] border-[#DC2626] text-[#FF6B6B]"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
              ) : (
                <XCircle size={20} className="mr-3 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex border-b border-[#333333]">
            <button
              onClick={() => setActiveTab("facility")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "facility"
                  ? "text-[#5B94FF] border-b-2 border-[#5B94FF]"
                  : "text-[#B0B0B0] hover:text-[#E5E5E5]"
              }`}
            >
              <Building size={18} className="inline mr-2 mb-1" />
              Register Facility
            </button>
            <button
              onClick={() => setActiveTab("sensor")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "sensor"
                  ? "text-[#5B94FF] border-b-2 border-[#5B94FF]"
                  : "text-[#B0B0B0] hover:text-[#E5E5E5]"
              }`}
            >
              <Thermometer size={18} className="inline mr-2 mb-1" />
              Register Sensor
            </button>
          </div>

          {/* Facility Registration Form */}
          {activeTab === "facility" && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-6 max-w-2xl">
              <div className="mb-6">
                <h2 className="text-[#E5E5E5] text-xl font-bold mb-2">
                  Facility Information
                </h2>
                <p className="text-[#B0B0B0] text-sm">
                  Provide details about the new facility location
                </p>
              </div>

              <form onSubmit={handleFacilitySubmit} className="space-y-4">
                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={facilityForm.name}
                    onChange={(e) =>
                      setFacilityForm({ ...facilityForm, name: e.target.value })
                    }
                    placeholder="e.g., Mumbai Office, Warehouse 1"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={facilityForm.pincode}
                    onChange={(e) =>
                      setFacilityForm({
                        ...facilityForm,
                        pincode: e.target.value,
                      })
                    }
                    placeholder="e.g., 400001"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={facilityForm.address}
                    onChange={(e) =>
                      setFacilityForm({
                        ...facilityForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete address"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors resize-none"
                  />
                  <p className="text-[#707070] text-xs mt-1">
                    Optional: For internal reference
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={facilityForm.contactPerson}
                      onChange={(e) =>
                        setFacilityForm({
                          ...facilityForm,
                          contactPerson: e.target.value,
                        })
                      }
                      placeholder="Site manager name"
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={facilityForm.contactPhone}
                      onChange={(e) =>
                        setFacilityForm({
                          ...facilityForm,
                          contactPhone: e.target.value,
                        })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-[#5B94FF] text-white font-medium rounded-lg hover:bg-[#4F8BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Register Facility
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sensor Registration Form */}
          {activeTab === "sensor" && (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-6 max-w-2xl">
              <div className="mb-6">
                <h2 className="text-[#E5E5E5] text-xl font-bold mb-2">
                  Sensor Information
                </h2>
                <p className="text-[#B0B0B0] text-sm">
                  Register a new monitoring sensor at a facility
                </p>
              </div>

              <form onSubmit={handleSensorSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Select Facility *
                  </label>
                  <select
                    required
                    value={sensorForm.locationId}
                    onChange={(e) =>
                      setSensorForm({
                        ...sensorForm,
                        locationId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  >
                    <option value="">-- Choose a facility --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} (PIN: {loc.pincode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Sensor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={sensorForm.name}
                    onChange={(e) =>
                      setSensorForm({ ...sensorForm, name: e.target.value })
                    }
                    placeholder="e.g., Server Room Sensor, Main Door Monitor"
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Sensor Type *
                  </label>
                  <select
                    required
                    value={sensorForm.deviceType}
                    onChange={(e) =>
                      setSensorForm({
                        ...sensorForm,
                        deviceType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  >
                    <option value="temperature">
                      Temperature & Humidity Monitor
                    </option>
                    <option value="door">Door Status Monitor</option>
                    <option value="electricity">Electricity Monitor</option>
                    <option value="combined">Multi-Sensor (All-in-One)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                      Temperature Threshold (°C) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={sensorForm.tempThreshold}
                      onChange={(e) =>
                        setSensorForm({
                          ...sensorForm,
                          tempThreshold: e.target.value,
                        })
                      }
                      placeholder="30.0"
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                    />
                    <p className="text-[#707070] text-xs mt-1">
                      Alert when exceeded
                    </p>
                  </div>

                  <div>
                    <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                      Humidity Threshold (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={sensorForm.humidityThreshold}
                      onChange={(e) =>
                        setSensorForm({
                          ...sensorForm,
                          humidityThreshold: e.target.value,
                        })
                      }
                      placeholder="70.0"
                      className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors"
                    />
                    <p className="text-[#707070] text-xs mt-1">
                      Alert when exceeded
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    value={sensorForm.installationDate}
                    onChange={(e) =>
                      setSensorForm({
                        ...sensorForm,
                        installationDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:border-[#5B94FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#E5E5E5] text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={sensorForm.notes}
                    onChange={(e) =>
                      setSensorForm({ ...sensorForm, notes: e.target.value })
                    }
                    placeholder="Location details, maintenance info, etc."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#707070] focus:outline-none focus:border-[#5B94FF] transition-colors resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-[#5B94FF] text-white font-medium rounded-lg hover:bg-[#4F8BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Register Sensor
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
