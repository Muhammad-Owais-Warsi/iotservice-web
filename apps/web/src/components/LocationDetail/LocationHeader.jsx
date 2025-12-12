import { ArrowLeft, MapPin, Radio, RefreshCw } from "lucide-react";
import { formatLastUpdate } from "@/utils/useLiveData";

export function LocationHeader({ location, liveLoading, lastUpdate, refresh }) {
  return (
    <div className="mb-6">
      <a
        href="/"
        className="inline-flex items-center text-[#4F8BFF] hover:text-[#3D6FE5] mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </a>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[#1E293B] font-bold text-2xl sm:text-3xl mb-2">
            {location.name}
          </h1>
          <div className="flex items-center text-[#64748B] text-sm">
            <MapPin size={16} className="mr-1" />
            <span>PIN: {location.pincode}</span>
          </div>
        </div>

        {/* Live controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Radio
              size={14}
              className={`${liveLoading ? "text-[#10B981] animate-pulse" : "text-[#10B981]"}`}
            />
            <span className="text-[#64748B] text-xs">
              {liveLoading ? "Updating..." : "Live"}
            </span>
          </div>

          <div className="text-[#64748B] text-xs hidden sm:block">
            {formatLastUpdate(lastUpdate)}
          </div>

          <button
            onClick={refresh}
            disabled={liveLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#1E293B] rounded-lg hover:bg-[#F8FAFC] hover:border-[#4F8BFF] transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw
              size={16}
              className={liveLoading ? "animate-spin" : ""}
            />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
