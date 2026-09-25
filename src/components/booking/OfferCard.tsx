import { MockBooking } from "@/lib/mock-bookings";
import { CheckCircle2, Clock, MapPin, Navigation, XCircle } from "lucide-react";

type OfferCardProps = {
  booking: MockBooking;
  viewerRole: 'rider' | 'driver';
  onAccept?: () => void;
  onDecline?: () => void;
  onCounter?: () => void;
};

export function OfferCard({ booking, viewerRole, onAccept, onDecline, onCounter }: OfferCardProps) {
  const isDriver = viewerRole === 'driver';
  const isRider = viewerRole === 'rider';

  const timeStr = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(booking.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Format repeats if recurring
  let repeatBadge = null;
  if (booking.isRecurring && booking.recurrenceDays.length > 0) {
    repeatBadge = (
      <div className="bg-purple-500/20 text-purple-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full w-max mt-2 border border-purple-500/30">
        Repeats: {booking.recurrenceDays.join(', ')}
      </div>
    );
  }

  // Format modifiers if any
  let modifierList = null;
  if (booking.modifiers.length > 0) {
    modifierList = (
      <div className="flex flex-wrap gap-1 mt-2">
        {booking.modifiers.map(m => (
          <span key={m} className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
            {m}
          </span>
        ))}
      </div>
    );
  }

  // Determine current display based on status
  let headerContent;
  let actionContent;
  let fareDisplay = booking.proposedFare;

  if (booking.status === 'proposed') {
    headerContent = <h3 className="text-white font-bold text-sm">Ride Offer</h3>;
    
    if (isDriver) {
      actionContent = (
        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-700">
          <button onClick={onAccept} className="w-full bg-green-500 text-white font-bold py-2 rounded-xl text-sm active:bg-green-600">
            Accept Ride
          </button>
          <div className="flex gap-2">
            <button onClick={onCounter} className="flex-1 bg-slate-700 text-white font-semibold py-2 rounded-xl text-sm active:bg-slate-600">
              Counter
            </button>
            <button onClick={onDecline} className="flex-1 bg-slate-800 border border-slate-700 text-red-400 font-semibold py-2 rounded-xl text-sm active:bg-slate-700">
              Decline
            </button>
          </div>
        </div>
      );
    } else {
      actionContent = (
        <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-center gap-2 text-slate-400">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-xs">Awaiting driver response...</span>
        </div>
      );
    }
  } 
  else if (booking.status === 'countered') {
    headerContent = <h3 className="text-amber-400 font-bold text-sm">Counter Offer</h3>;
    fareDisplay = booking.counterFare || booking.proposedFare;

    if (isRider) {
      actionContent = (
        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-700">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-2">
            <p className="text-xs text-amber-300 mb-1">Driver countered with ₦{booking.counterFare?.toLocaleString()}</p>
            {booking.counterTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {booking.counterTags.map(tag => (
                  <span key={tag} className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onAccept} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-xl text-sm active:bg-green-600">
              Accept
            </button>
            <button onClick={onDecline} className="flex-1 bg-slate-800 border border-slate-700 text-red-400 font-semibold py-2 rounded-xl text-sm active:bg-slate-700">
              Decline
            </button>
          </div>
        </div>
      );
    } else {
      actionContent = (
        <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-center gap-2 text-amber-400/70">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-xs">Awaiting rider response...</span>
        </div>
      );
    }
  }
  else if (booking.status === 'accepted') {
    headerContent = (
      <div className="flex items-center gap-1.5 text-green-400">
        <CheckCircle2 className="w-4 h-4" />
        <h3 className="font-bold text-sm">Ride Accepted</h3>
      </div>
    );
    fareDisplay = booking.counterFare || booking.proposedFare; // final agreed fare
  }
  else if (booking.status === 'declined' || booking.status === 'canceled') {
    headerContent = (
      <div className="flex items-center gap-1.5 text-slate-500">
        <XCircle className="w-4 h-4" />
        <h3 className="font-bold text-sm">{booking.status === 'declined' ? 'Declined' : 'Canceled'}</h3>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-sm rounded-2xl p-4 my-1 ${
      booking.status === 'proposed' ? 'bg-[#1f2937] border border-slate-700' :
      booking.status === 'countered' ? 'bg-[#1f2937] border border-amber-500/30' :
      booking.status === 'accepted' ? 'bg-[#14291f] border border-green-500/30' :
      'bg-[#1f2937] opacity-60'
    }`}>
      <div className="flex justify-between items-start mb-3">
        {headerContent}
        <div className="text-right">
          <span className="text-xs text-slate-400 block">{dateStr}</span>
          <span className="text-sm font-bold text-white">{timeStr}</span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-teal-400 mt-1 shrink-0" />
          <p className="text-sm text-slate-200 line-clamp-1">{booking.pickup}</p>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 mt-1 shrink-0" />
          <p className="text-sm text-slate-200 line-clamp-1">{booking.dropoff}</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-black/20 rounded-lg p-2">
        <div>
          <p className="text-[10px] text-slate-400">DISTANCE</p>
          <p className="text-xs font-semibold text-white">{booking.distanceKm} km</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">FARE</p>
          <p className="text-sm font-bold text-teal-400">₦{fareDisplay.toLocaleString()}</p>
        </div>
      </div>

      {modifierList}
      {repeatBadge}
      {actionContent}
    </div>
  );
}
