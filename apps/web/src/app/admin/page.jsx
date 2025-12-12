import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  Edit2,
  X,
} from "lucide-react";

export default function AdminPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    company_id: null,
    location_id: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, usersRes, alertsRes, companiesRes, locationsRes] =
          await Promise.all([
            fetch("/api/profile"),
            fetch("/api/admin/users"),
            fetch("/api/alerts"),
            fetch("/api/companies"),
            fetch("/api/locations"),
          ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setAlerts(alertsData.alerts || []);
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData.companies || []);
        }

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData.locations || []);
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

  const handleUserAction = async (userId, status) => {
    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });

      if (response.ok) {
        // Refresh users list
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      company_id: u.company_id,
      location_id: u.location_id,
    });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "",
      company_id: null,
      location_id: null,
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh users list
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        }
        handleCloseModal();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
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

  if (!profile || (profile.role !== "admin" && profile.role !== "manager")) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 text-center">
          <ShieldCheck size={48} className="text-[#FF6B6B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#E5E5E5] mb-2">
            Access Denied
          </h1>
          <p className="text-[#B0B0B0]">Admin or manager access required.</p>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const pendingUsers = users.filter((u) => u.status === "pending");
  const approvedUsers = users.filter((u) => u.status === "approved");
  const suspendedUsers = users.filter((u) => u.status === "suspended");

  return (
    <div className="min-h-screen bg-[#121212] font-['Nanum_Gothic']">
      <Sidebar
        activeItem="Admin Panel"
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
              {profile.role === "admin" ? "Admin Panel" : "User Management"}
            </h1>
            <p className="text-[#B0B0B0] text-sm">
              {profile.role === "admin"
                ? "Manage all user accounts across the system"
                : "Manage users in your company"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-4">
              <div className="text-[#FFFF00] text-sm mb-1">
                Pending Approval
              </div>
              <div className="text-[#E5E5E5] text-3xl font-bold">
                {pendingUsers.length}
              </div>
            </div>
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-4">
              <div className="text-[#4ADE80] text-sm mb-1">Approved</div>
              <div className="text-[#E5E5E5] text-3xl font-bold">
                {approvedUsers.length}
              </div>
            </div>
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-4">
              <div className="text-[#FF6B6B] text-sm mb-1">Suspended</div>
              <div className="text-[#E5E5E5] text-3xl font-bold">
                {suspendedUsers.length}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2A2A2A] border-b border-[#404040]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[#B0B0B0] text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-[#666666]"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-[#333333] hover:bg-[#262626] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-[#E5E5E5] font-medium">
                            {u.name}
                          </div>
                          <div className="text-[#666666] text-sm">
                            {u.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 bg-[#2A2A2A] text-[#5B94FF] text-xs rounded capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#E5E5E5] text-sm">
                          {u.company_name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-[#E5E5E5] text-sm">
                          {u.location_name || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded ${
                              u.status === "approved"
                                ? "bg-[#1A3A1A] text-[#4ADE80]"
                                : u.status === "pending"
                                  ? "bg-[#3A3A1A] text-[#FFFF00]"
                                  : "bg-[#3A1A1A] text-[#FF6B6B]"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {u.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleUserAction(u.id, "approved")
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#1A3A1A] text-[#4ADE80] text-xs rounded hover:bg-[#234A23] transition-colors"
                              >
                                <UserCheck size={14} />
                                Approve
                              </button>
                            )}
                            {u.status === "approved" && (
                              <button
                                onClick={() =>
                                  handleUserAction(u.id, "suspended")
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#3A1A1A] text-[#FF6B6B] text-xs rounded hover:bg-[#4A2323] transition-colors"
                              >
                                <UserX size={14} />
                                Suspend
                              </button>
                            )}
                            {u.status === "suspended" && (
                              <button
                                onClick={() =>
                                  handleUserAction(u.id, "approved")
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#1A3A1A] text-[#4ADE80] text-xs rounded hover:bg-[#234A23] transition-colors"
                              >
                                <UserCheck size={14} />
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#E5E5E5] text-xl font-bold">Edit User</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[#666666] hover:text-[#E5E5E5] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveUser}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[#B0B0B0] text-sm mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] border border-[#404040] rounded-lg focus:outline-none focus:border-[#5B94FF]"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[#B0B0B0] text-sm mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] border border-[#404040] rounded-lg focus:outline-none focus:border-[#5B94FF]"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[#B0B0B0] text-sm mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] border border-[#404040] rounded-lg focus:outline-none focus:border-[#5B94FF]"
                      required
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      {profile.role === "admin" && (
                        <option value="admin">Admin</option>
                      )}
                    </select>
                  </div>

                  {/* Company */}
                  {profile.role === "admin" && (
                    <div>
                      <label className="block text-[#B0B0B0] text-sm mb-2">
                        Company
                      </label>
                      <select
                        value={formData.company_id || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company_id: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] border border-[#404040] rounded-lg focus:outline-none focus:border-[#5B94FF]"
                      >
                        <option value="">No Company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <label className="block text-[#B0B0B0] text-sm mb-2">
                      Location
                    </label>
                    <select
                      value={formData.location_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location_id: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] border border-[#404040] rounded-lg focus:outline-none focus:border-[#5B94FF]"
                    >
                      <option value="">No Location</option>
                      {locations
                        .filter(
                          (l) =>
                            !formData.company_id ||
                            l.company_id === formData.company_id,
                        )
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] rounded-lg hover:bg-[#333333] transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#5B94FF] text-white rounded-lg hover:bg-[#4A7FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
