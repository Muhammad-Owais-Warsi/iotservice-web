import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Building2,
  Shield,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [message, setMessage] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, alertsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/alerts"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
          setFormData({
            name: profileData.profile.name || "",
            email: profileData.profile.email || "",
          });
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          const active = alertsData.alerts?.filter(
            (a) => a.status === "active",
          ).length;
          setActiveAlerts(active || 0);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData.profile);
        setEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Update failed" });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    }
  };

  if (userLoading || loading) {
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]";
      case "manager":
        return "bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF]";
      case "employee":
        return "bg-gradient-to-r from-[#10B981] to-[#34D399]";
      default:
        return "bg-gradient-to-r from-[#6B7280] to-[#9CA3AF]";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D1FAE5] text-[#10B981] text-sm font-medium rounded-full">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEF3C7] text-[#F59E0B] text-sm font-medium rounded-full">
            <AlertCircle size={14} />
            Pending
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEE2E2] text-[#EF4444] text-sm font-medium rounded-full">
            <AlertCircle size={14} />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-['Inter']">
      <Sidebar
        activeItem="Profile"
        userRole={profile.role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="md:ml-60">
        <TopBar
          setSidebarOpen={setSidebarOpen}
          userName={user.name || user.email}
          alertCount={activeAlerts}
        />

        <main className="p-4 md:p-6 lg:p-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] rounded-2xl p-8 md:p-10 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-white text-3xl md:text-4xl font-bold mb-3">
                  Profile Management
                </h1>
                <p className="text-white text-opacity-90 text-base md:text-lg">
                  Manage your account information and settings
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-[#D1FAE5] text-[#10B981] border border-[#10B981]"
                  : "bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto p-1 hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[#1E293B] text-xl font-bold">
                      Personal Information
                    </h2>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: profile.name || "",
                            email: profile.email || "",
                          });
                          setMessage(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#64748B] rounded-lg hover:bg-[#E2E8F0] transition-all"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {editing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[#64748B] text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] focus:border-transparent text-[#1E293B]"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-[#64748B] text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] focus:border-transparent text-[#1E293B]"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                        >
                          <Save size={18} />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-[#F8FAFC] rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#64748B] text-sm mb-1">
                            Full Name
                          </p>
                          <p className="text-[#1E293B] text-base font-medium">
                            {profile.name || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-[#F8FAFC] rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#64748B] text-sm mb-1">
                            Email Address
                          </p>
                          <p className="text-[#1E293B] text-base font-medium">
                            {profile.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-[#F8FAFC] rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#64748B] text-sm mb-1">Role</p>
                          <span
                            className={`inline-block px-3 py-1 ${getRoleBadgeColor(profile.role)} text-white text-sm font-medium rounded-full capitalize`}
                          >
                            {profile.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-white" />
                  </div>
                  <h2 className="text-[#1E293B] text-lg font-bold">
                    Account Status
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[#64748B] text-sm mb-2">Status</p>
                    {getStatusBadge(profile.status)}
                  </div>

                  {profile.company_name && (
                    <div>
                      <p className="text-[#64748B] text-sm mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        Company
                      </p>
                      <p className="text-[#1E293B] font-medium">
                        {profile.company_name}
                      </p>
                    </div>
                  )}

                  {profile.location_name && (
                    <div>
                      <p className="text-[#64748B] text-sm mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Location
                      </p>
                      <p className="text-[#1E293B] font-medium">
                        {profile.location_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                <p className="text-white text-opacity-90 text-sm mb-4">
                  Contact your administrator for account changes or support.
                </p>
                <a
                  href="/"
                  className="inline-block px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white rounded-lg transition-all border border-white border-opacity-30 text-sm font-medium"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
