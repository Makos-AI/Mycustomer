"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Navigation } from "lucide-react";
import { MapView } from "@/components/booking/MapView";
import { calculateBaselineFare, modifiers } from "@/lib/fare-calculator";

export default function BookRidePage() {
  const router = useRouter();
  
  // Hardcoded defaults for MVP
  const distanceKm = 12.5;
  const durationMin = 45;
  const baseline = calculateBaselineFare(distanceKm, durationMin);

  const [pickupTime, setPickupTime] = useState("07:45");
  const [windowSize, setWindowSize] = useState(30); // minutes
  const [customFare, setCustomFare] = useState(baseline);
  const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
  
  const handleModifierToggle = (id: string, increment: number) => {
    if (activeModifiers.includes(id)) {
      setActiveModifiers(activeModifiers.filter(m => m !== id));
      setCustomFare(prev => prev - increment);
    } else {
      setActiveModifiers([...activeModifiers, id]);
      setCustomFare(prev => prev + increment);
    }
  };

  const handleBook = () => {
    // Navigate to negotiation flow or chat MVP
    router.push("/chat/123-mock-id");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="flex items-center p-4 border-b border-slate-800 shrink-0">
        <button onClick={() => router.back()} className="p-2 mr-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Book Ride</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Map Header */}
        <div className="h-48 w-full p-4">
          <MapView />
        </div>

        <div className="px-4 space-y-6">
          {/* Location Inputs (Mocked for UI purposes) */}
          <div className="glass-panel p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Pickup</p>
                <p className="text-sm font-medium">Lekki Phase 1, Lagos</p>
              </div>
            </div>
            <div className="w-0.5 h-4 bg-slate-700 ml-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Dropoff</p>
                <p className="text-sm font-medium">Victoria Island, Lagos</p>
              </div>
            </div>
          </div>

          {/* Flexible Scheduling */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-teal-400" />
              <h3 className="font-semibold text-sm">Flexible Pickup Window</h3>
            </div>
            <div className="flex gap-4 items-center">
              <input 
                type="time" 
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="glass-input p-2 text-sm flex-1"
              />
              <span className="text-slate-400">to</span>
              <select 
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                className="glass-input p-2 text-sm flex-1 appearance-none"
              >
                <option value={15}>+15 mins</option>
                <option value={30}>+30 mins</option>
                <option value={45}>+45 mins</option>
                <option value={60}>+1 hour</option>
              </select>
            </div>
          </div>

          {/* Uncapped Pricing */}
          <div className="glass-panel p-4">
            <h3 className="font-semibold text-sm mb-4">Your Offer (Uncapped)</h3>
            
            <div className="flex items-center justify-between bg-slate-800 rounded-xl p-2 mb-4">
              <button 
                onClick={() => setCustomFare(prev => Math.max(0, prev - 100))}
                className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-lg text-xl font-bold active:bg-slate-600"
              >-</button>
              <div className="text-center">
                <span className="text-xs text-slate-400 block">NGN</span>
                <span className="text-2xl font-bold text-teal-400">₦{customFare.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setCustomFare(prev => prev + 100)}
                className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-lg text-xl font-bold active:bg-slate-600"
              >+</button>
            </div>
            
            <p className="text-xs text-center text-slate-400 mb-4">
              Baseline: ₦{baseline.toLocaleString()} ({distanceKm}km, {durationMin}m)
            </p>

            <div className="flex flex-wrap gap-2">
              {modifiers.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => handleModifierToggle(mod.id, mod.increment)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeModifiers.includes(mod.id) 
                      ? "bg-teal-500/20 border-teal-500 text-teal-400" 
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  {mod.label} (+₦{mod.increment})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 max-w-md mx-auto">
        <button onClick={handleBook} className="btn-primary w-full py-4 text-lg">
          Propose Ride Offer
        </button>
      </div>
    </div>
  );
}
