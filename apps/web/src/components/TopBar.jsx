import React from "react";
import { Menu, Bell, User } from "lucide-react";

export default function TopBar({ setSidebarOpen, userName, alertCount = 0 }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu size={24} className="text-[#64748B]" />
      </button>

      {/* Spacer for desktop */}
      <div className="hidden md:block"></div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell size={20} className="text-[#64748B]" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#EF4444] to-[#F87171] text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile - Clickable */}
        <a
          href="/profile"
          className="flex items-center gap-2 pl-2 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#4F8BFF] to-[#6B9FFF] rounded-full flex items-center justify-center shadow-sm">
            <User size={18} className="text-white" />
          </div>
          <span className="hidden sm:block text-[#1E293B] text-sm font-medium">
            {userName}
          </span>
        </a>
      </div>
    </div>
  );
}
