"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      
      // Store phone in session storage for verification step
      sessionStorage.setItem("auth_phone", phone);
      router.push("/auth/verify");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 mb-2">
            MyCustomer
          </h1>
          <p className="text-slate-400">Decentralized trust, zero commissions.</p>
        </div>

        <div className="glass-panel p-8">
          <h2 className="text-xl font-semibold mb-6">Enter your phone number</h2>
          
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input w-full pl-10"
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Sending..." : "Continue"}</span>
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
          
          <p className="mt-6 text-xs text-center text-slate-500">
            By continuing, you'll receive an SMS for verification. Message and data rates may apply.
          </p>
        </div>
      </div>
    </div>
  );
}
