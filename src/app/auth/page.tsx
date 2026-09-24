"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Check if using placeholder keys
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        setTimeout(() => setSuccess(true), 1000);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/chat`,
        },
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    localStorage.setItem('dev_bypass', 'true');
    router.push('/chat');
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
          <h2 className="text-xl font-semibold mb-6">Log in or sign up</h2>
          
          {success ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="font-medium text-lg mb-2">Check your email</h3>
              <p className="text-slate-400 text-sm">
                We sent a magic link to <span className="text-white font-medium">{email}</span>. Click the link to securely sign in.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-sm text-teal-400 hover:text-teal-300"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full pl-10"
                    placeholder="you@example.com"
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
                <span>{loading ? "Sending..." : "Send Magic Link"}</span>
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}
          
          <p className="mt-6 text-xs text-center text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={handleDevBypass}
              className="mt-8 w-full py-2 border border-dashed border-teal-500/50 text-teal-400 rounded-xl text-sm hover:bg-teal-500/10 transition-colors"
            >
              🛠 Dev Mode: Skip to Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
