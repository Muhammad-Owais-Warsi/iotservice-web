import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function CreateAdminPage() {
  const { data: user, loading: userLoading } = useUser();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const promoteToAdmin = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/create-admin", {
          method: "POST",
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Failed to promote to admin");
      }
    };

    if (!userLoading && user) {
      promoteToAdmin();
    }
  }, [user, userLoading]);

  if (userLoading || status === "loading") {
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

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            status === "success" ? "bg-[#0A2A1A]" : "bg-[#441111]"
          }`}
        >
          {status === "success" ? (
            <ShieldCheck size={32} className="text-[#4ADE80]" />
          ) : (
            <AlertTriangle size={32} className="text-[#FF6B6B]" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-[#E5E5E5] mb-4">
          {status === "success" ? "Admin Created" : "Error"}
        </h1>

        <p className="text-[#B0B0B0] mb-6">{message}</p>

        {status === "success" && (
          <div className="space-y-4">
            <div className="p-4 bg-[#2A1A0A] border border-[#FFA366] rounded-lg text-left">
              <p className="text-sm text-[#FFB380] font-semibold mb-2">
                ⚠️ Important Security Notice
              </p>
              <p className="text-sm text-[#B0B0B0]">
                You should now delete this route from your application for
                security reasons. The file is located at:{" "}
                <span className="font-mono text-xs">
                  /apps/web/src/app/create-admin/page.jsx
                </span>
              </p>
            </div>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        {status === "error" && (
          <a
            href="/"
            className="inline-block px-6 py-2 bg-[#4F8BFF] text-white rounded-lg hover:bg-[#3D6FE5] transition-colors"
          >
            Go to Dashboard
          </a>
        )}
      </div>
    </div>
  );
}
