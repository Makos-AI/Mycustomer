"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, X } from "lucide-react";

interface NegotiationPanelProps {
  proposedFare: number;
  riderName: string;
  onAccept: () => void;
  onCounter: (fare: number, tags: string[]) => void;
  onClose: () => void;
}

const CONTEXT_TAGS = [
  "Severe Traffic",
  "Flooded Route",
  "Agbero/Community Tolls",
  "Long Queue at Fuel Station",
  "Night Surcharge",
  "Detour Required"
];

export function NegotiationPanel({ proposedFare, riderName, onAccept, onCounter, onClose }: NegotiationPanelProps) {
  const [counterFare, setCounterFare] = useState(proposedFare);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl overflow-hidden animate-slide-in shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="font-semibold text-lg">Offer from {riderName}</h2>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-400 mb-1">Proposed Fare</p>
            <p className="text-4xl font-bold text-white">₦{proposedFare.toLocaleString()}</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3 text-slate-300">Quick Counter-Offer</p>
              <div className="flex items-center justify-between bg-slate-800 rounded-xl p-2">
                <button 
                  onClick={() => setCounterFare(prev => Math.max(0, prev - 100))}
                  className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg text-2xl font-bold active:bg-slate-600"
                >-</button>
                <span className="text-2xl font-bold text-teal-400">₦{counterFare.toLocaleString()}</span>
                <button 
                  onClick={() => setCounterFare(prev => prev + 100)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg text-2xl font-bold active:bg-slate-600"
                >+</button>
              </div>
            </div>

            {counterFare !== proposedFare && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-medium text-slate-300">Why the adjustment?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-800/50 flex gap-3">
          {counterFare === proposedFare ? (
            <button onClick={onAccept} className="btn-primary w-full py-4 text-lg">
              Accept Offer
            </button>
          ) : (
            <button 
              onClick={() => onCounter(counterFare, selectedTags)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl px-4 py-4 shadow-lg active:scale-95 transition-all text-lg"
            >
              Send Counter (₦{counterFare.toLocaleString()})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
