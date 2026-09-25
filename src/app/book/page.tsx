"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Navigation, Search, AlertTriangle, CalendarDays } from "lucide-react";
import { MapView } from "@/components/booking/MapView";
import { calculateBaselineFare, modifiers } from "@/lib/fare-calculator";
import { BookingState, BookingDraft, EMPTY_DRAFT } from "@/lib/booking-state";
import { useMockBookings } from "@/lib/mock-bookings";

const RECENT_LOCATIONS = [
  "Victoria Island, Lagos",
  "Lekki Phase 1, Lagos",
  "Ikeja City Mall, Lagos",
  "Murtala Muhammed Airport, Ikeja"
];

function BookRideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverContactId = searchParams.get('driverId');

  const { createBooking } = useMockBookings();

  const [step, setStep] = useState<BookingState>('location');
  const [draft, setDraft] = useState<BookingDraft>({
    ...EMPTY_DRAFT,
    driverContactId: driverContactId || '',
    pickupAddress: "My Current Location",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [customFare, setCustomFare] = useState(0);

  // Time & Date state
  const [pickupTime, setPickupTime] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [showRepeat, setShowRepeat] = useState(false);

  useEffect(() => {
    if (!driverContactId) {
      alert("Missing driver ID. Returning to chat.");
      router.back();
    }
    // Set default time to 30 mins from now
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    setPickupTime(now.toTimeString().slice(0, 5));
    setPickupDate(now.toISOString().split('T')[0]);
  }, [driverContactId, router]);

  // STATE 1: LOCATION HANDLER
  const selectDestination = (loc: string) => {
    setDraft(prev => ({ ...prev, dropoffAddress: loc }));
    setStep('route');
    // Mock the route calculation delay
    setLoadingRoute(true);
    setTimeout(() => {
      // Hardcode dev values
      const dist = 12.5;
      const dur = 45;
      const base = calculateBaselineFare(dist, dur);
      setDraft(prev => ({
        ...prev,
        distanceKm: dist,
        durationMin: dur,
        baselineFare: base
      }));
      setCustomFare(base);
      setLoadingRoute(false);
    }, 1500);
  };

  // STATE 3: MODIFIERS & SUBMIT
  const toggleModifier = (modId: string) => {
    const modDef = modifiers.find(m => m.id === modId)!;
    const exists = draft.modifiers.find(m => m.id === modId);
    
    if (exists?.active) {
      // deactivate
      setDraft(prev => ({
        ...prev,
        modifiers: prev.modifiers.map(m => m.id === modId ? { ...m, active: false } : m)
      }));
      setCustomFare(prev => prev - modDef.increment);
    } else {
      // activate
      setDraft(prev => ({
        ...prev,
        modifiers: [
          ...prev.modifiers.filter(m => m.id !== modId), 
          { ...modDef, value: modDef.increment, active: true }
        ]
      }));
      setCustomFare(prev => prev + modDef.increment);
    }
  };

  const toggleDay = (day: string) => {
    setDraft(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  const validateTime = () => {
    const selected = new Date(`${pickupDate}T${pickupTime}`);
    if (selected < new Date()) {
      alert("Please select a future time.");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateTime()) return;

    // Optional: Conflict check goes here (always clears in dev mode)

    const finalDraft: BookingDraft = {
      ...draft,
      proposedFare: customFare,
      startTime: new Date(`${pickupDate}T${pickupTime}`).toISOString(),
      isRecurring: showRepeat
    };

    createBooking(finalDraft);
    router.push(`/chat/${driverContactId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="flex items-center p-4 border-b border-slate-800 shrink-0">
        <button onClick={() => {
          if (step === 'configure') setStep('route');
          else if (step === 'route') setStep('location');
          else router.back();
        }} className="p-2 mr-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {step === 'location' ? 'Where to?' : step === 'route' ? 'Confirm Route' : 'Configure Ride'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* MAP VISIBLE IN ALL STATES */}
        <div className={`w-full transition-all duration-300 ${step === 'location' ? 'h-64' : 'h-48'} p-4`}>
          <MapView />
        </div>

        <div className="px-4 space-y-4">
          
          {/* ================= STATE 1: LOCATION ================= */}
          {step === 'location' && (
            <div className="animate-fade-in space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where to & for how much?"
                  className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Locations</h3>
                {RECENT_LOCATIONS.map(loc => (
                  <button 
                    key={loc}
                    onClick={() => selectDestination(loc)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-slate-800 rounded-xl text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-200">{loc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STATE 2: ROUTE ================= */}
          {step === 'route' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-slate-800 rounded-xl p-4 space-y-4 relative">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <input 
                    value={draft.pickupAddress}
                    onChange={(e) => setDraft({...draft, pickupAddress: e.target.value})}
                    className="bg-transparent border-none text-sm font-medium w-full text-white outline-none"
                  />
                </div>
                <div className="w-0.5 h-6 bg-slate-700 absolute left-[23px] top-8"></div>
                <div className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input 
                    readOnly
                    value={draft.dropoffAddress}
                    className="bg-transparent border-none text-sm font-medium w-full text-white outline-none"
                  />
                </div>
              </div>

              {loadingRoute ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-sm text-slate-400">Calculating route...</p>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-[#1f2937] border border-slate-700 rounded-xl p-4 animate-slide-in">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Estimated Route</p>
                    <p className="font-semibold text-white">{draft.distanceKm} km · {draft.durationMin} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">Recommended Fare</p>
                    <p className="text-lg font-bold text-teal-400">₦{draft.baselineFare.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STATE 3: CONFIGURE ================= */}
          {step === 'configure' && (
            <div className="animate-fade-in space-y-6">
              
              <div className="bg-[#1f2937] border border-slate-700 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-4">Your Offer</h3>
                <div className="flex items-center justify-between bg-slate-800 rounded-xl p-2 mb-4">
                  <button 
                    onClick={() => setCustomFare(prev => Math.max(500, prev - 100))}
                    disabled={customFare <= 500}
                    className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg text-2xl font-bold active:bg-slate-600 disabled:opacity-50"
                  >-</button>
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block mb-1">RECOMMENDED: ₦{draft.baselineFare.toLocaleString()}</span>
                    <span className="text-3xl font-bold text-teal-400">₦{customFare.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setCustomFare(prev => prev + 100)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg text-2xl font-bold active:bg-slate-600"
                  >+</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {modifiers.map(mod => {
                    const isActive = draft.modifiers.find(m => m.id === mod.id)?.active;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => toggleModifier(mod.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isActive 
                            ? "bg-teal-500/20 border-teal-500 text-teal-400" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {mod.label} (+₦{mod.increment})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-[#1f2937] border border-slate-700 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-400" />
                  Schedule Time
                </h3>
                
                <div className="flex gap-4">
                  <input 
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none"
                  />
                  <input 
                    type="time"
                    step="900"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Repeat Ride</span>
                    <input 
                      type="checkbox" 
                      checked={showRepeat}
                      onChange={(e) => setShowRepeat(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800"
                    />
                  </label>

                  {showRepeat && (
                    <div className="mt-4 flex justify-between animate-slide-in">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const isSelected = draft.recurrenceDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`w-10 h-10 rounded-full text-xs font-bold transition-colors ${
                              isSelected ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {day.charAt(0)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 max-w-md mx-auto">
        {step === 'location' && (
          <button 
            onClick={() => selectDestination(searchQuery || "Custom Location")}
            disabled={!searchQuery.trim()}
            className="w-full bg-teal-500 text-white font-bold py-4 rounded-full text-lg disabled:opacity-50 active:bg-teal-600 transition-colors"
          >
            Continue
          </button>
        )}
        {step === 'route' && (
          <button 
            onClick={() => setStep('configure')}
            disabled={loadingRoute}
            className="w-full bg-teal-500 text-white font-bold py-4 rounded-full text-lg disabled:opacity-50 active:bg-teal-600 transition-colors"
          >
            Confirm Route
          </button>
        )}
        {step === 'configure' && (
          <button 
            onClick={handleSubmit}
            className="w-full bg-teal-500 text-white font-bold py-4 rounded-full text-lg active:bg-teal-600 transition-colors"
          >
            Schedule Ride
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookRideContent />
    </Suspense>
  );
}
