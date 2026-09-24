"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, CreditCard } from "lucide-react";

const MOCK_PROFILES: Record<string, any> = {
  'mock-1': {
    id: 'mock-1',
    display_name: 'Chinedu Okeke',
    phone: '+234 803 123 4567',
    role: 'driver',
    completion_rate: 98,
    total_completed_rides: 142,
    car_make_model: 'Toyota Corolla 2010',
    plate_number: 'LSR-432-XY',
    bank_name: 'GTBank',
    account_number: '0123456789',
    isContact: true,
  },
  'mock-2': {
    id: 'mock-2',
    display_name: 'Sarah Bello',
    phone: '+234 806 987 6543',
    role: 'rider',
    isContact: false,
  },
  'mock-3': {
    id: 'mock-3',
    display_name: 'Emeka Nwosu',
    phone: '+234 701 555 9999',
    role: 'driver',
    completion_rate: 84,
    car_make_model: 'Honda Accord 2015',
    plate_number: 'ABJ-123-EK',
    bank_name: 'Zenith Bank',
    account_number: '2109876543',
    isContact: false,
  },
};

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const p = MOCK_PROFILES[params.id] || MOCK_PROFILES['mock-3'];
    setProfile(p);
  }, [params.id]);

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#111' }}>
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isDriver = profile.role === 'driver';
  const isContact = profile.isContact;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#111111' }}>
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-semibold text-white">Profile</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3" style={{ background: '#1e3a2f', color: '#22c55e' }}>
            {profile.display_name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
          {isDriver && (
            <span className="mt-1 text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#14532d', color: '#4ade80' }}>
              Driver • {profile.completion_rate}% Reliable
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6b7280' }}>Personal</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs" style={{ color: '#6b7280' }}>Full Name</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.display_name}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#6b7280' }}>Phone</p>
                <p className="text-sm font-semibold text-white mt-0.5">{profile.phone}</p>
              </div>
            </div>
          </div>

          {isDriver && (
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4" style={{ color: '#6b7280' }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>Vehicle</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Car</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{profile.car_make_model || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Plate Number</p>
                  <p className="text-sm font-mono font-bold mt-0.5" style={{ color: '#22c55e' }}>{profile.plate_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {isDriver && isContact && (
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" style={{ color: '#6b7280' }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b7280' }}>Payment Details</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Bank</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{profile.bank_name}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#6b7280' }}>Account Number</p>
                  <p className="text-base font-mono font-bold tracking-widest mt-0.5" style={{ color: '#22c55e' }}>{profile.account_number}</p>
                </div>
              </div>
            </div>
          )}

          {!isContact && (
            <button className="w-full py-3 rounded-2xl font-semibold text-sm mt-2" style={{ background: '#22c55e', color: 'white' }}>
              + Add to My Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
