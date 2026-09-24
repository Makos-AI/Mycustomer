"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "passenger";
  const isDriver = role === "driver";

  const [name, setName] = useState("");
  const [carModel, setCarModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationNote, setLocationNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationAccess = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationGranted(true);
        setLocationNote("");
      },
      () => {
        setLocationNote("You can grant this later in Settings.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const IS_DEV =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (IS_DEV) {
      localStorage.setItem("dev_bypass", "true");
      setTimeout(() => router.push("/chat"), 500);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const profileData: Record<string, any> = {
      id: user.id,
      phone: user.phone ?? sessionStorage.getItem("auth_phone"),
      display_name: name,
      role: isDriver ? "driver" : "rider",
    };

    if (isDriver) {
      profileData.car_make_model = carModel;
      profileData.plate_number = plateNumber;
      profileData.bank_name = bankName;
      profileData.account_number = accountNumber;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    // If user arrived via an invite link, create pending contact row
    const inviterId = sessionStorage.getItem("inviter_id");
    if (inviterId) {
      await supabase.from("contacts").insert({
        user_id: user.id,
        contact_id: inviterId,
        is_pending: true,
      });
      sessionStorage.removeItem("inviter_id");
    }

    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 text-3xl">
            {isDriver ? "🚗" : "🧑"}
          </div>
          <h1 className="text-2xl font-bold text-green-600">
            {isDriver ? "Driver Profile" : "Your Profile"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Almost there! Fill in your details.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            {isDriver && (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Vehicle Details
                  </p>
                  <div className="space-y-3">
                    <input
                      className="auth-input"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="Car Make & Model (e.g. Toyota Corolla)"
                      required
                    />
                    <input
                      className="auth-input"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="Plate Number (e.g. LSR-432-XY)"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Payment Details
                  </p>
                  <div className="space-y-3">
                    <input
                      className="auth-input"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank Name (e.g. GTBank)"
                      required
                    />
                    <input
                      className="auth-input"
                      type="tel"
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Location Access
                  </p>
                  <button
                    type="button"
                    onClick={handleLocationAccess}
                    className={`w-full py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      locationGranted
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {locationGranted ? "✓ Location Granted" : "Grant Location Access"}
                  </button>
                  {locationNote && (
                    <p className="text-xs text-slate-400 mt-1 text-center">
                      {locationNote}
                    </p>
                  )}
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name}
              className="btn-green disabled:opacity-50 mt-2"
            >
              {loading ? "Saving..." : "Get Started"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileForm />
    </Suspense>
  );
}
