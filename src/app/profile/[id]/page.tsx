"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { useMockDb } from "@/lib/mock-db";

const IS_DEV =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: contactId } = use(params);
  const { db, isLoaded } = useMockDb();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (IS_DEV) {
        if (!isLoaded) return; // Wait for localStorage to hydrate
        setProfile(db[contactId] ?? db["mock-3"]);
        setLoading(false);
        return;
      }

      // Use the RLS-enforced function — returns bank_name/account_number only if contact
      const { data, error } = await supabase
        .rpc("get_driver_profile", { target_id: contactId })
        .single();

      if (error) console.error(error);
      setProfile(data ?? null);
      setLoading(false);
    }
    load();
  }, [contactId, db, isLoaded]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
        <p className="text-slate-400">Profile not found.</p>
      </div>
    );

  const isDriver = profile.role === "driver";
  // Payment section shows ONLY when bank_name is non-null (returned by function for contacts)
  const isContact = !!profile.bank_name;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#111111" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-semibold text-white">Profile</h1>
      </div>

      <div className="p-6">
        {/* Avatar & name */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
            style={{ background: "#1e3a2f", color: "#22c55e" }}
          >
            {profile.display_name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
          {isDriver && (
            <span
              className="mt-1 text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#14532d", color: "#4ade80" }}
            >
              Driver {profile.completion_rate ? `• ${profile.completion_rate}% Reliable` : ""}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Section 1: Personal — always visible */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: "#6b7280" }}
            >
              Personal
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs" style={{ color: "#6b7280" }}>Full Name</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.display_name}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#6b7280" }}>Phone</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.phone}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle — drivers only */}
          {isDriver && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4" style={{ color: "#6b7280" }} />
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6b7280" }}
                >
                  Vehicle
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Car</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {profile.car_make_model || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Plate Number</p>
                  <p
                    className="text-sm font-mono font-bold mt-0.5"
                    style={{ color: "#22c55e" }}
                  >
                    {profile.plate_number || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Payment — ONLY for drivers who ARE saved contacts */}
          {isDriver && isContact && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" style={{ color: "#6b7280" }} />
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6b7280" }}
                >
                  Payment Details
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Bank</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{profile.bank_name}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Account Number</p>
                  <p
                    className="text-base font-mono font-bold tracking-widest mt-0.5"
                    style={{ color: "#22c55e" }}
                  >
                    {profile.account_number}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add contact CTA — only for non-contacts */}
          {isDriver && !isContact && (
            <button
              className="w-full py-3 rounded-2xl font-semibold text-sm mt-2"
              style={{ background: "#22c55e", color: "white" }}
            >
              + Add to My Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
