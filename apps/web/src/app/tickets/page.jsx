import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Plus, Calendar, MapPin, Wrench, Clock } from "lucide-react";

export default function TicketsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    locationId: "",
    deviceId: "",
    problem: "",
    visitDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);

          const [ticketsRes, locationsRes] = await Promise.all([
            fetch("/api/tickets"),
            fetch("/api/locations"),
          ]);

          if (ticketsRes.ok) {
            const ticketsData = await ticketsRes.json();
            setTickets(ticketsData.tickets || []);
          }

          if (locationsRes.ok) {
            const locationsData = await locationsRes.json();
            setLocations(locationsData.locations || []);
          }
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

  const handleLocationChange = async (locationId) => {
    setFormData({ ...formData, locationId, deviceId: "" });

    if (locationId) {
      const res = await fetch(`/api/devices?locationId=${locationId}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } else {
      setDevices([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setTickets([newTicket.ticket, ...tickets]);
        setShowCreateModal(false);
        setFormData({
          locationId: "",
          deviceId: "",
          problem: "",
          visitDate: "",
        });
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-[#FFFF00] border-[#FFFF00] bg-[#2A2A0A]";
      case "scheduled":
        return "text-[#5B94FF] border-[#4F8BFF] bg-[#1A2A3A]";
      case "completed":
        return "text-[#4ADE80] border-[#22C55E] bg-[#0A2A1A]";
      default:
        return "text-[#B0B0B0] border-[#404040] bg-[#2A2A2A]";
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] font-['Nanum_Gothic']">
      <Sidebar
        activeItem="Service Tickets"
        userRole={profile.role}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="md:ml-60">
        <TopBar
          setSidebarOpen={setSidebarOpen}
          userName={user.name || user.email}
        />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-[#E5E5E5] font-['Lato'] font-extrabold text-2xl sm:text-3xl mb-2">
                Service Tickets
              </h1>
              <p className="text-[#B0B0B0] text-sm">
                Manage service requests for your facilities
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] active:bg-[#2A5CC7] transition-colors"
            >
              <Plus size={20} className="mr-2" />
              <span className="hidden sm:inline">New Ticket</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-12 text-center">
              <Wrench size={48} className="text-[#536081] mx-auto mb-4" />
              <h3 className="text-[#E5E5E5] text-xl font-bold mb-2">
                No Tickets Yet
              </h3>
              <p className="text-[#B0B0B0]">
                Create a service ticket to request engineer support
              </p>
            </div>
          ) : (
            <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#2A2A2A] border-b border-[#333333]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Problem
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Visit Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-[#262626] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#E5E5E5] font-mono">
                          #{ticket.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#E5E5E5]">
                          {ticket.location_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#B0B0B0]">
                          {ticket.device_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#E5E5E5] max-w-xs truncate">
                          {ticket.problem}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#B0B0B0]">
                          {new Date(ticket.visit_date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-6 max-w-md w-full">
            <h2 className="text-[#E5E5E5] text-xl font-bold mb-4">
              Create Service Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2">
                  Location
                </label>
                <select
                  required
                  value={formData.locationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF]"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2">
                  Device
                </label>
                <select
                  required
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF]"
                  disabled={!formData.locationId}
                >
                  <option value="">Select device</option>
                  {devices.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2">
                  Problem Description
                </label>
                <textarea
                  required
                  value={formData.problem}
                  onChange={(e) =>
                    setFormData({ ...formData, problem: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF]"
                  rows={3}
                  placeholder="Describe the issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2">
                  Preferred Visit Date & Time
                </label>
                <input
                  required
                  type="datetime-local"
                  value={formData.visitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, visitDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
