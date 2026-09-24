"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"rider" | "driver" | "both">("rider");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth");
      else setUser(data.user);
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        phone: user.phone,
        display_name: name,
        role: role,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      router.push("/chat");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 animate-fade-in">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete your profile</h1>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center relative cursor-pointer hover:border-teal-400 transition-colors">
              <Camera className="w-8 h-8 text-slate-500" />
              {/* Note: File upload input would go here, omitting for MVP simplicity */}
            </div>
            <p className="text-xs text-slate-400 mt-2">Add a photo</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full pl-10"
                placeholder="What should we call you?"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              How will you use MyCustomer?
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("rider")}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${role === "rider" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                Rider
              </button>
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${role === "driver" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => setRole("both")}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${role === "both" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-400"}`}
              >
                Both
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name}
            className="btn-primary w-full mt-4 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Start using MyCustomer"}
          </button>
        </form>
      </div>
    </div>
  );
}
