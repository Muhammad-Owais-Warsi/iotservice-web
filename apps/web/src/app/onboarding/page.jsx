import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Thermometer } from "lucide-react";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingRole = localStorage.getItem("pendingRole");
      const pendingCompany = localStorage.getItem("pendingCompanyName");

      if (pendingRole) setRole(pendingRole);
      if (pendingCompany) setCompanyName(pendingCompany);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, companyName }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Clear localStorage
      localStorage.removeItem("pendingRole");
      localStorage.removeItem("pendingCompanyName");

      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#E5E5E5]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 shadow-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-[#4F8BFF] rounded-lg flex items-center justify-center">
            <Thermometer size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-[#E5E5E5] mb-2 font-['Lato']">
          Complete Setup
        </h1>
        <p className="text-center text-[#B0B0B0] mb-8">
          Your account will be pending approval by an admin
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E5E5E5]">
              Your Role
            </label>
            <div className="px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5]">
              {role === "manager" ? "Manager" : "Employee"}
            </div>
          </div>

          {role === "manager" && companyName && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E5E5E5]">
                Company Name
              </label>
              <div className="px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5]">
                {companyName}
              </div>
            </div>
          )}

          <div className="p-4 bg-[#1A2A3A] border border-[#4F8BFF] rounded-lg">
            <p className="text-sm text-[#B0B0B0]">
              Your account is currently{" "}
              <span className="text-[#FFFF00] font-semibold">
                pending approval
              </span>
              . An admin will review and approve your account before you can
              access the system.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-[#441111] border border-[#DC2626] p-3 text-sm text-[#FF6B6B]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#4F8BFF] text-white rounded-lg font-medium hover:bg-[#3D6FE5] active:bg-[#2A5CC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
