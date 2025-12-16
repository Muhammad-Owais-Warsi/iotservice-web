import React, { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import { Plus, Wrench } from "lucide-react";

export default function TicketsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Expanded Form Data State
  const [formData, setFormData] = useState({
    locationId: "",
    visitDate: "",

    // Company Details
    company_name: "",
    company_phone: "",
    company_email: "",
    brand_name: "",
    years_of_operation: "",

    // Billing
    gst: "",
    billing_address: "",

    // Equipment
    equipment_type: "",
    equipment_Slno: "",
    capacity: "",
    photo_of_specification_plate: "", // URL or base64 placeholder

    // Issue
    problem_stat: "",
    photos: [], // Array of URLs

    // POC
    poc_name: "",
    poc_phno: "",
    poc_email: ""
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
        // Reset Form
        setFormData({
          locationId: "",
          visitDate: "",
          company_name: "",
          company_phone: "",
          company_email: "",
          brand_name: "",
          years_of_operation: "",
          gst: "",
          billing_address: "",
          equipment_type: "",
          equipment_Slno: "",
          capacity: "",
          photo_of_specification_plate: "",
          problem_stat: "",
          photos: [],
          poc_name: "",
          poc_phno: "",
          poc_email: ""
        });
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      case "open": return "text-[#FFFF00] border-[#FFFF00] bg-[#2A2A0A]";
      case "in_progress": return "text-[#5B94FF] border-[#4F8BFF] bg-[#1A2A3A]";
      case "closed": return "text-[#4ADE80] border-[#22C55E] bg-[#0A2A1A]";
      default: return "text-[#B0B0B0] border-[#404040] bg-[#2A2A2A]";
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
            {/* ONLY Master and Employee can create tickets */}
            {['master', 'employee'].includes(profile.role) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] active:bg-[#2A5CC7] transition-colors"
              >
                <Plus size={20} className="mr-2" />
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            )}

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
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Ticket ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Problem</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Visit Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-[#262626] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#E5E5E5] font-mono">#{ticket.id?.substring(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-[#E5E5E5]">{ticket.company_name}</td>
                        <td className="px-6 py-4 text-sm text-[#B0B0B0]">
                          <div>{ticket.equipment_type}</div>
                          <div className="text-xs text-[#666]">SN: {ticket.equipment_serial_no}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#E5E5E5] max-w-xs truncate">{ticket.problem_statement}</td>
                        <td className="px-6 py-4 text-sm text-[#B0B0B0]">{new Date(ticket.visit_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
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

      {/* Create Ticket Modal - FULL OVERHAUL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-xl border border-[#333333] p-6 max-w-2xl w-full my-8">
            <h2 className="text-[#E5E5E5] text-xl font-bold mb-4">Create Service Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Company Info */}
              <div className="space-y-4">
                <h3 className="text-[#4F8BFF] font-semibold text-sm uppercase tracking-wide">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleInputChange} className="input-dark" required />
                  <input name="company_phone" placeholder="Company Phone" value={formData.company_phone} onChange={handleInputChange} className="input-dark" required />
                  <input name="company_email" type="email" placeholder="Company Email" value={formData.company_email} onChange={handleInputChange} className="input-dark" required />
                  <input name="brand_name" placeholder="Brand Name" value={formData.brand_name} onChange={handleInputChange} className="input-dark" />
                  <input name="years_of_operation" type="number" placeholder="Years of Operation" value={formData.years_of_operation} onChange={handleInputChange} className="input-dark" />
                  <input name="gst" placeholder="GST Number" value={formData.gst} onChange={handleInputChange} className="input-dark" />
                </div>
                <textarea name="billing_address" placeholder="Billing Address" rows={2} value={formData.billing_address} onChange={handleInputChange} className="input-dark w-full" />
              </div>

              {/* Section 2: Equipment & Location */}
              <div className="space-y-4">
                <h3 className="text-[#4F8BFF] font-semibold text-sm uppercase tracking-wide">Equipment & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="locationId" value={formData.locationId} onChange={handleInputChange} className="input-dark" required>
                    <option value="">Select Location</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                  <input name="equipment_type" placeholder="Equipment Type" value={formData.equipment_type} onChange={handleInputChange} className="input-dark" required />
                  <input name="equipment_Slno" placeholder="Serial Number" value={formData.equipment_Slno} onChange={handleInputChange} className="input-dark" required />
                  <input name="capacity" type="number" placeholder="Capacity" value={formData.capacity} onChange={handleInputChange} className="input-dark" />
                </div>
              </div>

              {/* Section 3: The Problem */}
              <div className="space-y-4">
                <h3 className="text-[#4F8BFF] font-semibold text-sm uppercase tracking-wide">The Issue</h3>
                <textarea name="problem_stat" placeholder="Describe the problem in detail..." rows={3} value={formData.problem_stat} onChange={handleInputChange} className="input-dark w-full" required />
                <input type="datetime-local" name="visitDate" value={formData.visitDate} onChange={handleInputChange} className="input-dark w-full" required />
              </div>

              {/* Section 4: POC */}
              <div className="space-y-4">
                <h3 className="text-[#4F8BFF] font-semibold text-sm uppercase tracking-wide">Point of Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input name="poc_name" placeholder="POC Name" value={formData.poc_name} onChange={handleInputChange} className="input-dark" required />
                  <input name="poc_phno" placeholder="POC Phone" value={formData.poc_phno} onChange={handleInputChange} className="input-dark" required />
                  <input name="poc_email" type="email" placeholder="POC Email" value={formData.poc_email} onChange={handleInputChange} className="input-dark" required />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-[#333]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] rounded-lg hover:bg-[#333333] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        .input-dark {
            width: 100%;
            padding: 0.75rem 1rem;
            background-color: #2A2A2A;
            border: 1px solid #404040;
            border-radius: 0.5rem;
            color: #E5E5E5;
            outline: none;
        }
        .input-dark:focus {
            ring: 2px solid #4F8BFF;
            border-color: transparent;
        }
      `}</style>
    </div>
  );
}
