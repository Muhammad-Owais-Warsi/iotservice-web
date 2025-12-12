import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Thermometer } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md bg-[#1E1E1E] rounded-xl border border-[#333333] p-8 shadow-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-[#4F8BFF] rounded-lg flex items-center justify-center">
            <Thermometer size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-[#E5E5E5] mb-2 font-['Lato']">
          Facility Monitor
        </h1>
        <p className="text-center text-[#B0B0B0] mb-8">
          Sign in to your account
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E5E5E5]">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] focus:border-[#4F8BFF]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E5E5E5]">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#404040] rounded-lg text-[#E5E5E5] placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] focus:border-[#4F8BFF]"
            />
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-[#B0B0B0]">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-[#5B94FF] hover:text-[#4F8BFF] font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
