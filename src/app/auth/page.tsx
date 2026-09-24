"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState("+234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      sessionStorage.setItem("auth_phone", phone);
      setTimeout(() => router.push("/auth/verify"), 800);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    localStorage.setItem("dev_bypass", "true");
    router.push("/chat");
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
            <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</button>
            <button className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
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

            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => sessionStorage.setItem('signup_role', 'passenger')}
                    className="py-3 rounded-xl border-2 text-sm font-semibold transition-colors border-green-500 text-green-600 bg-green-50">
                    🧑 Passenger
                  </button>
                  <button type="button" onClick={() => sessionStorage.setItem('signup_role', 'driver')}
                    className="py-3 rounded-xl border-2 text-sm font-semibold transition-colors border-slate-200 text-slate-600">
                    🚗 Driver
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-green">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <button onClick={handleDevBypass}
            className="mt-4 w-full py-2 border-2 border-dashed border-green-400 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors">
            🛠 Dev Mode: Skip to Chat
          </button>
        )}
      </div>
    </div>
  );
}
