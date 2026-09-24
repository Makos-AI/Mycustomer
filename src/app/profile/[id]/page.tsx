"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, Car, CreditCard, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ReliabilityBadge } from "@/components/profile/ReliabilityBadge";

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const profileId = params.id;
  const [profile, setProfile] = useState<any>(null);
  const [isContact, setIsContact] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicProfile() {
      // 1. Fetch public profile fields (assuming RLS allows read access to these)
      // In dev mode, we just mock the data.
      if (typeof window !== 'undefined' && localStorage.getItem('dev_bypass') === 'true') {
        setProfile({
          id: profileId,
          display_name: "Chinedu",
          phone: "+234 800 000 0000",
          role: "driver",
          completion_rate: 98,
          total_completed_rides: 142,
          car_make_model: "Toyota Corolla 2010",
          plate_number: "LSR-432-XY",
          bank_name: "GTBank",
          account_number: "0123456789"
        });
        
        // Mock checking if they are a saved contact
        setIsContact(profileId === 'mock-1');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      setProfile(data);

      if (user) {
        // 2. Check if they are a saved contact to unlock bank details
        const { data: contactRow } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('contact_id', profileId)
          .single();
        
        setIsContact(!!contactRow);
      }

      setLoading(false);
    }
    loadPublicProfile();
  }, [profileId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="p-6 text-center text-slate-400">Profile not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <div className="flex items-center p-4 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 mr-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">Driver Profile</h1>
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
                <p className="font-medium">Platform Trust</p>
                <p className="text-xs text-slate-400">Completed rides</p>
              </div>
            </div>
            <p className="text-xl font-bold">{profile.total_completed_rides}</p>
          </div>

          {(profile.role === 'driver' || profile.role === 'both') && (
            <div className="glass-panel p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/50">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <Car className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vehicle</p>
                  <p className="font-medium text-sm">{profile.car_make_model || "Not specified"}</p>
                  <p className="font-mono text-xs text-teal-400">{profile.plate_number || "No plate provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Payment Details</p>
                  {isContact ? (
                    <>
                      <p className="font-medium text-sm">{profile.bank_name || "Bank not specified"}</p>
                      <p className="font-mono text-xs tracking-wider">{profile.account_number || "No account number"}</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-amber-400 bg-amber-400/10 p-2 rounded-lg">
                      <Lock className="w-3 h-3" />
                      <p className="text-[10px] font-medium leading-tight">Hidden. Add as a contact to view bank details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isContact && (
            <button className="btn-primary w-full py-3 mt-4">
              Add to Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
