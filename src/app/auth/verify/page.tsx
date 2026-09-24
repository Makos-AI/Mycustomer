"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedPhone = sessionStorage.getItem("auth_phone");
    if (!savedPhone) {
      router.push("/auth");
    } else {
      setPhone(savedPhone);
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) return;
    
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) throw error;
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', data.user?.id)
        .single();
        
      if (!profile?.display_name) {
        router.push("/auth/profile");
      } else {
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="glass-panel p-8">
          <h2 className="text-xl font-semibold mb-2">Verify your number</h2>
          <p className="text-sm text-slate-400 mb-6">
            We sent a 6-digit code to {phone}
          </p>
          
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold glass-input p-0"
                  maxLength={1}
                  required
                />
              ))}
            </div>
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push("/auth")}
              className="text-sm text-teal-400 hover:text-teal-300"
            >
              Wrong number? Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
