import React from "react";
import {
  LayoutDashboard,
  Users,
  Thermometer,
  Ticket,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Shield,
  Plus,
  User,
} from "lucide-react";

export default function Sidebar({
  activeItem,
  userRole,
  sidebarOpen,
  setSidebarOpen,
}) {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/",
      roles: ["admin", "manager", "employee"],
    },
    {
      icon: Plus,
      label: "Registration",
      path: "/registration",
      roles: ["admin", "manager"],
    },
    {
      icon: Ticket,
      label: "Service Tickets",
      path: "/tickets",
      roles: ["manager", "employee"],
    },
    {
      icon: Shield,
      label: "Audit Logs",
      path: "/audit-logs",
      roles: ["admin", "manager"],
    },
    {
      icon: ShieldCheck,
      label: "Admin Panel",
      path: "/admin",
      roles: ["admin", "manager"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out w-60 flex flex-col shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-lg flex items-center justify-center shadow-sm">
              <Thermometer size={20} className="text-white" />
            </div>
            <span className="text-[#1E293B] font-bold text-lg">
              Facility Monitor
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-[#64748B]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeItem === item.label
                  ? "bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] text-white shadow-sm"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-gray-200 p-3 space-y-1 flex-shrink-0">
          <a
            href="/profile"
            className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeItem === "Profile"
                ? "bg-gradient-to-r from-[#4F8BFF] to-[#6B9FFF] text-white shadow-sm"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
            }`}
          >
            <User size={20} className="mr-3" />
            <span className="flex-1 text-left">Profile</span>
          </a>
          <a
            href="/account/logout"
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all text-[#EF4444] hover:bg-[#FEF2F2]"
          >
            <LogOut size={20} className="mr-3" />
            <span className="flex-1 text-left">Log Out</span>
          </a>
        </div>
      </div>
    </>
  );
}
