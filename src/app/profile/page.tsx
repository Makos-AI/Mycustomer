"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, MapPin, Settings, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ReliabilityBadge } from "@/components/profile/ReliabilityBadge";
import Link from "next/link";

export default function OwnProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <div className="flex items-center p-4 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 mr-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">My Profile</h1>
        <button className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold text-teal-400 mb-4 shadow-xl border border-slate-600">
            {profile.display_name?.charAt(0) || <User />}
          </div>
          <h2 className="text-2xl font-bold mb-1">{profile.display_name}</h2>
          <p className="text-slate-400 text-sm mb-3">{profile.phone}</p>
          
          {(profile.role === 'driver' || profile.role === 'both') && (
            <ReliabilityBadge rate={profile.completion_rate} size="lg" />
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="font-medium">Total Rides</p>
                <p className="text-xs text-slate-400">Completed on platform</p>
              </div>
            </div>
            <p className="text-xl font-bold">{profile.total_completed_rides}</p>
          </div>

          {(profile.role === 'driver' || profile.role === 'both') && (
            <div className="glass-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">WhatsApp Live Location</p>
                  <p className="text-xs text-slate-400">Attach to your rides</p>
                </div>
              </div>
              <input 
                type="text" 
                defaultValue={profile.whatsapp_live_location_url}
                placeholder="https://maps.google.com/..."
                className="glass-input w-full text-sm mb-2"
              />
              <button className="text-xs text-teal-400 font-medium ml-1">Save Link</button>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="w-full glass-panel p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
