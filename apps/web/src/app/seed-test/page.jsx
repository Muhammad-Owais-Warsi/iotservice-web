import { useState } from "react";
import { Thermometer } from "lucide-react";

export default function SeedTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeed = async (forceRecreate = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/seed-test-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ forceRecreate }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to create test data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1E1E1E] rounded-xl border border-[#333333] p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-[#4F8BFF] rounded-lg flex items-center justify-center">
            <Thermometer size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-[#E5E5E5] mb-2 font-['Lato']">
          Seed Test Data
        </h1>
        <p className="text-center text-[#B0B0B0] mb-8">
          Create test accounts for Admin, Manager, and Employee roles
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleSeed(false)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[#4F8BFF] text-white rounded-lg font-medium hover:bg-[#3D6FE5] active:bg-[#2A5CC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Test Accounts"}
          </button>

          <button
            onClick={() => handleSeed(true)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[#DC2626] text-white rounded-lg font-medium hover:bg-[#B91C1C] active:bg-[#991B1B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Recreating..." : "Force Recreate"}
          </button>
        </div>

        <p className="text-center text-[#808080] text-sm mt-3">
          Use "Force Recreate" if test accounts already exist
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-[#441111] border border-[#DC2626] p-4">
            <p className="text-[#FF6B6B] font-medium mb-2">Error</p>
            <p className="text-[#FFB8B8] text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-[#0D4A2D] border border-[#22C55E] p-4">
              <p className="text-[#4ADE80] font-medium mb-2">
                ✓ {result.message}
              </p>
            </div>

            <div className="rounded-lg bg-[#2A2A2A] border border-[#404040] p-6">
              <h3 className="text-[#E5E5E5] font-bold mb-4">Test Accounts:</h3>
              <div className="space-y-4">
                {result.accounts.map((account, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1E1E1E] rounded-lg p-4 border border-[#404040]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#4F8BFF] font-semibold uppercase text-sm">
                        {account.role}
                      </span>
                      <span className="text-[#B0B0B0] text-xs">
                        {account.company}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#B0B0B0] text-sm">Email:</span>
                        <span className="text-[#E5E5E5] font-mono text-sm">
                          {account.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#B0B0B0] text-sm">
                          Password:
                        </span>
                        <span className="text-[#E5E5E5] font-mono text-sm">
                          {account.password}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#B0B0B0] text-sm">
                          Location:
                        </span>
                        <span className="text-[#E5E5E5] text-sm">
                          {account.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#404040]">
                <h4 className="text-[#E5E5E5] font-semibold mb-3">
                  Created Data:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B0B0B0]">Locations:</span>
                    <span className="text-[#E5E5E5]">
                      {result.data.locations.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B0B0B0]">Devices:</span>
                    <span className="text-[#E5E5E5]">
                      {result.data.devices.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B0B0B0]">Sensor Readings:</span>
                    <span className="text-[#E5E5E5]">9</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B0B0B0]">Active Alerts:</span>
                    <span className="text-[#E5E5E5]">1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="/account/signin"
                className="inline-block px-6 py-2 bg-[#2A2A2A] text-[#E5E5E5] rounded-lg hover:bg-[#333333] transition-colors border border-[#404040]"
              >
                Go to Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
