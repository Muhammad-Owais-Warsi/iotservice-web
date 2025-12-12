import useAuth from "@/utils/useAuth";
import { Thermometer } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-[#4F8BFF] rounded-lg flex items-center justify-center">
            <Thermometer size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-[#E5E5E5] mb-8 font-['Lato']">
          Sign Out
        </h1>

        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 bg-[#E12929] text-white rounded-lg font-medium hover:bg-[#C71414] active:bg-[#B01212] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
