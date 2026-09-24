"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverName = searchParams.get('name') || 'Someone';
  const driverId = searchParams.get('ref') || '';
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+234");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    sessionStorage.setItem('inviter_id', driverId);
    sessionStorage.setItem('signup_role', 'passenger');
    sessionStorage.setItem('auth_phone', phone);
    localStorage.setItem('dev_bypass', 'true');
    setTimeout(() => router.push('/chat'), 600);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 text-4xl">🚗</div>
          <div className="text-center px-4 py-3 bg-green-50 rounded-2xl border border-green-100 mb-2">
            <p className="text-slate-500 text-sm">You've been invited by</p>
            <p className="text-xl font-bold text-green-700">{driverName}</p>
          </div>
          <p className="text-slate-400 text-sm mt-2">Create your account to get started</p>
        </div>
        <div className="auth-card">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label>
              <input className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input className="auth-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" required />
            </div>
            <button type="submit" disabled={loading || !name} className="btn-green disabled:opacity-50">
              {loading ? 'Joining...' : 'Join MyCustomer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
