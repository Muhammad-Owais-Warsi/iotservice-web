import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function ChartsSection({ historicalData, selectedDays, onDaysChange }) {
  if (historicalData.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Time Period Selector */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedDays === days
                  ? "bg-[#4F8BFF] text-white"
                  : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature & Humidity Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-[#1E293B] font-bold text-lg mb-4">
            Temperature & Humidity (Last {selectedDays} Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  color: "#1E293B",
                }}
              />
              <Legend />
              <Bar dataKey="temperature" fill="#FF6B6B" name="Temp (°C)" />
              <Bar dataKey="humidity" fill="#4F8BFF" name="Humidity (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Electricity Consumption Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-[#1E293B] font-bold text-lg mb-4">
            Electricity Consumption (Last {selectedDays} Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  color: "#1E293B",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="electricity"
                stroke="#F59E0B"
                strokeWidth={2}
                name="kWh"
                dot={{ fill: "#F59E0B", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
