"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("auth_phone");
    if (!saved) router.push("/auth");
    else setPhone(saved);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const role = sessionStorage.getItem('signup_role') || 'passenger';
    setTimeout(() => {
      if (role === 'driver') router.push('/auth/profile?role=driver');
      else router.push('/auth/profile?role=passenger');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-3xl">📱</div>
          <h1 className="text-2xl font-bold text-green-600 mb-1">Verify your number</h1>
          <p className="text-slate-500 text-sm text-center">Enter the 6-digit code sent to<br /><span className="font-semibold text-slate-700">{phone}</span></p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors"
                  style={{ borderColor: digit ? '#22c55e' : '#e5e7eb', background: digit ? '#f0fdf4' : '#f9fafb' }}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading || otp.join('').length < 6} className="btn-green disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-slate-400 text-sm">Resend in <span className="font-semibold text-green-600">{countdown}s</span></p>
            ) : (
              <button onClick={() => { setCountdown(60); }} className="text-green-600 text-sm font-semibold">Resend OTP</button>
            )}
          </div>
        </div>
        <button onClick={() => router.back()} className="mt-4 w-full text-slate-500 text-sm">← Wrong number?</button>
      </div>
    </div>
  );
}
