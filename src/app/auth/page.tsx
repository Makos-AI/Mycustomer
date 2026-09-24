"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOTP } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("+234");
  const [selectedRole, setSelectedRole] = useState<"passenger" | "driver">("passenger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (activeTab === "signup") {
      sessionStorage.setItem("signup_role", selectedRole);
    }
    sessionStorage.setItem("auth_phone", phone);

    const { error: otpError } = await sendOTP(phone);

    if (otpError) {
      setError(otpError.message || "Failed to send OTP. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/auth/verify");
  };

  const handleDevBypass = () => {
    localStorage.setItem("dev_bypass", "true");
    router.push("/chat");
  };

  const handleRoleSelect = (role: "passenger" | "driver") => {
    setSelectedRole(role);
    sessionStorage.setItem("signup_role", role);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-3xl">
            👋
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-1">Welcome</h1>
          <p className="text-slate-500 text-sm">Sign in to your account or create a new one</p>
        </div>

        <div className="auth-card">
          <div className="tab-container mb-6">
            <button
              className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-input"
                placeholder="+234 800 000 0000"
                required
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("passenger")}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedRole === "passenger"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("driver")}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedRole === "driver"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    Driver
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-green">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>

        {process.env.NODE_ENV === "development" && (
          <button
            onClick={handleDevBypass}
            className="mt-4 w-full py-2 border-2 border-dashed border-green-400 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Dev Mode: Skip to Chat
          </button>
        )}
      </div>
    </div>
  );
}
