"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Navigation, Search, CalendarDays, Plus, Minus, User } from "lucide-react";
import { MapView } from "@/components/booking/MapView";
import { calculateBaselineFare, modifiers } from "@/lib/fare-calculator";
import { BookingState, BookingDraft, EMPTY_DRAFT } from "@/lib/booking-state";
import { useMockBookings } from "@/lib/mock-bookings";

const RECENT_LOCATIONS = [
  "Wole Soyinka Centre for Culture and...",
  "11 Oladipupo Oduwole Street, Ikeja",
  "14 Adegbeyeni Street, Ikeja",
  "28 Majaro Street, Lagos"
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
    pickupAddress: "Majaro St 22",
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
    setLoadingRoute(true);
    setTimeout(() => {
      const dist = 12.5;
      const dur = 21;
      const base = calculateBaselineFare(dist, dur);
      setDraft(prev => ({
        ...prev,
        distanceKm: dist,
        durationMin: dur,
        baselineFare: base
      }));
      setCustomFare(base);
      setLoadingRoute(false);
      setStep('configure'); // Skip right to configure in the reference
    }, 800);
  };

  // STATE 3: MODIFIERS & SUBMIT
  const toggleModifier = (modId: string) => {
    const modDef = modifiers.find(m => m.id === modId)!;
    const exists = draft.modifiers.find(m => m.id === modId);
    
    if (exists?.active) {
      setDraft(prev => ({
        ...prev,
        modifiers: prev.modifiers.map(m => m.id === modId ? { ...m, active: false } : m)
      }));
      setCustomFare(prev => prev - modDef.increment);
    } else {
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
    <div className="flex flex-col h-screen bg-white">
      {/* MAP LAYER: Always behind UI */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* FLOATING HEADER / BACK BUTTON */}
      <div className="relative z-10 p-4">
        <button onClick={() => {
          if (step === 'configure') setStep('location');
          else router.back();
        }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
      </div>

      <div className="flex-1 relative z-10 pointer-events-none" />

      {/* BOTTOM SHEET */}
      <div className="relative z-20 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto" style={{ maxHeight: '80vh' }}>
        {/* Drag handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-5">
          
          {/* ================= STATE 1: LOCATION ================= */}
          {step === 'location' && (
            <div className="animate-fade-in space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where to & for how much?"
                  className="w-full bg-[#f3f4f6] border-none rounded-2xl py-3.5 pl-12 pr-4 text-black font-semibold placeholder-gray-500 focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="space-y-4">
                {RECENT_LOCATIONS.map(loc => (
                  <button 
                    key={loc}
                    onClick={() => selectDestination(loc)}
                    className="flex items-center gap-4 w-full text-left active:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <span className="text-base font-semibold text-gray-900 leading-tight">{loc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STATE 3: CONFIGURE (RIDE OPTIONS) ================= */}
          {(step === 'configure' || loadingRoute) && (
            <div className="animate-slide-up space-y-6">
              {/* Route Summary */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                  <div className="w-0.5 h-6 bg-gray-300" />
                  <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                </div>
                <div className="flex-1 text-sm font-semibold">
                  <p className="text-black py-1">{draft.pickupAddress}</p>
                  <div className="h-[1px] bg-gray-100" />
                  <p className="text-gray-500 py-1">{loadingRoute ? 'Loading...' : draft.dropoffAddress}</p>
                </div>
              </div>

              {/* Ride Type Display */}
              <div className="bg-[#f3f4f6] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚘</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 font-bold text-gray-900 text-lg">
                    Ride <span className="text-gray-400 text-sm font-normal">ⓘ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mt-0.5">
                    <User className="w-4 h-4" /> 4 • {loadingRoute ? '--' : draft.durationMin} min
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Affordable fares</p>
                </div>
              </div>

              {/* FARE NEGOTIATOR */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center justify-between w-full max-w-[280px]">
                  <button 
                    onClick={() => setCustomFare(prev => Math.max(500, prev - 100))}
                    disabled={customFare <= 500 || loadingRoute}
                    className="w-14 h-14 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center active:bg-gray-50 disabled:opacity-50"
                  >
                    <Minus className="w-6 h-6 text-black" />
                  </button>
                  
                  <div className="text-center flex-1">
                    <span className="text-3xl font-bold text-black block tracking-tight">
                      ₦{loadingRoute ? '...' : customFare.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Recommended fare
                    </span>
                  </div>

                  <button 
                    onClick={() => setCustomFare(prev => prev + 100)}
                    disabled={loadingRoute}
                    className="w-14 h-14 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center active:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus className="w-6 h-6 text-black" />
                  </button>
                </div>
              </div>

              {/* Extras & Time */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  Schedule Ride Options
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {modifiers.map(mod => {
                    const isActive = draft.modifiers.find(m => m.id === mod.id)?.active;
                    return (
                      <button
                         key={mod.id}
                         onClick={() => toggleModifier(mod.id)}
                         disabled={loadingRoute}
                         className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                           isActive 
                             ? "bg-black text-white" 
                             : "bg-gray-100 text-gray-600 active:bg-gray-200"
                         }`}
                      >
                         {mod.label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <input 
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black"
                  />
                  <input 
                    type="time"
                    step="900"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* FIXED ACTION BUTTON */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white pb-8 shadow-[0_-10px_20px_rgba(255,255,255,0.9)]">
          {step === 'location' && (
            <button 
              onClick={() => selectDestination(searchQuery || "Custom Location")}
              disabled={!searchQuery.trim()}
              className="w-full bg-[#a3e635] text-black font-bold py-4 rounded-2xl text-lg disabled:opacity-50 active:bg-[#84cc16] transition-colors shadow-sm"
            >
              Continue
            </button>
          )}
          {step === 'configure' && (
            <button 
              onClick={handleSubmit}
              disabled={loadingRoute}
              className="w-full bg-[#a3e635] text-black font-bold py-4 rounded-2xl text-lg active:bg-[#84cc16] transition-colors shadow-sm"
            >
              Find drivers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookRidePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookRideContent />
    </Suspense>
  );
}
