"use client";

import { useState, useEffect } from 'react';

export type Message = {
  id: string | number;
  content: string;
  sender: 'me' | 'them';
  time: string;
  type?: 'text' | 'milestone' | 'booking';
};

export type ContactProfile = {
  id: string;
  display_name: string;
  phone: string;
  role: 'driver' | 'rider' | 'system';
  avatar: string;
  completion_rate?: number;
  car_make_model?: string;
  plate_number?: string;
  bank_name?: string;
  account_number?: string;
  isSystem?: boolean;
  isContact: boolean;
  isPending: boolean;
  unread: number;
  messages: Message[];
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — realistic Lagos-based scenarios, week of Sept 22–25 2026
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_DB: Record<string, ContactProfile> = {

  // ── Chinedu Okeke: Daily commute driver, recurring Mon-Fri Lekki → VI ──────
  'mock-1': {
    id: 'mock-1',
    display_name: 'Chinedu Okeke',
    phone: '+234 803 123 4567',
    role: 'driver',
    avatar: 'C',
    completion_rate: 98,
    car_make_model: 'Toyota Corolla 2020',
    plate_number: 'LSR-432-XY',
    bank_name: 'GTBank',
    account_number: '0123456789',
    isContact: true,
    isPending: false,
    unread: 1,
    messages: [
      { id: 'c1-1', content: 'Good morning boss, I am available for this week. What time do you need me on Monday?', sender: 'them', time: 'Mon 06:45' },
      { id: 'c1-2', content: 'Morning Chinedu! 7am sharp from Lekki Phase 1. Same spot as usual.', sender: 'me', time: 'Mon 06:52' },
      { id: 'c1-3', content: 'Okay sir. I will be there. What about the whole week — should I hold the slot?', sender: 'them', time: 'Mon 06:55' },
      { id: 'c1-4', content: 'Yes please. Monday to Friday, 7am pickup, Lekki Phase 1 Gate B to Eko Atlantic. Let me send you a booking offer now.', sender: 'me', time: 'Mon 06:58' },
      { id: 'c1-5', content: '✅ Ride offer sent through the app. Please check and confirm.', sender: 'me', time: 'Mon 07:01', type: 'booking' },
      { id: 'c1-6', content: 'I have seen it. ₦2,500 is a bit low for the whole week because of fuel prices now. Let me counter at ₦2,800 — traffic on 3rd Mainland adds at least 20 minutes most mornings.', sender: 'them', time: 'Mon 07:04' },
      { id: 'c1-7', content: '₦2,800 is fine. I accepted the counter. See you at 7am!', sender: 'me', time: 'Mon 07:09' },
      { id: 'c1-8', content: 'God bless you boss. I am already on my way.', sender: 'them', time: 'Mon 07:10' },
      { id: 'c1-9', content: 'Good morning! I am 3 minutes away from Gate B.', sender: 'them', time: 'Tue 06:57' },
      { id: 'c1-10', content: 'Coming down now', sender: 'me', time: 'Tue 06:58' },
      { id: 'c1-11', content: 'Arrived safely, thank you Chinedu', sender: 'me', time: 'Tue 08:03' },
      { id: 'c1-12', content: 'My pleasure boss. See you tomorrow!', sender: 'them', time: 'Tue 08:05' },
      { id: 'c1-13', content: 'Good morning boss. Small issue — there is a road closure on Ozumba Mbadiwe. I am taking the Lekki-Epe Expressway route, might add 10 mins.', sender: 'them', time: 'Wed 07:02' },
      { id: 'c1-14', content: 'No problem, I have an 8:30am meeting so still fine. Thanks for the heads up.', sender: 'me', time: 'Wed 07:04' },
      { id: 'c1-15', content: 'Arrived! Sorry for the small delay. Have a productive day sir.', sender: 'them', time: 'Wed 08:21' },
      { id: 'c1-16', content: 'Same to you. By the way, can we also do Saturday morning? I have an event at The Civic Centre at 10am.', sender: 'me', time: 'Wed 12:30' },
      { id: 'c1-17', content: 'Saturday 10am I have another booking already. But I can do 9:30am if that helps?', sender: 'them', time: 'Wed 12:45' },
      { id: 'c1-18', content: '9:30am works perfectly. I\'ll send the offer now.', sender: 'me', time: 'Wed 12:47' },
      { id: 'c1-19', content: 'Boss, I just woke up with a small fever. I don\'t think I can make it this morning, I am very sorry. My colleague Emeka can cover you — he is reliable.', sender: 'them', time: 'Thu 05:50' },
      { id: 'c1-20', content: 'Oh no! Please rest and get well. I\'ll reach out to Emeka. Take care of yourself.', sender: 'me', time: 'Thu 05:55' },
      { id: 'c1-21', content: 'Thank you boss. I\'ll be back tomorrow, I promise.', sender: 'them', time: 'Thu 05:56' },
      { id: 'c1-22', content: 'Good morning boss! Feeling much better. I am at Gate B already, 2 minutes early!', sender: 'them', time: 'Fri 06:58' },
      { id: 'c1-23', content: 'Welcome back! On my way down 🙂', sender: 'me', time: 'Fri 06:59' },
      { id: 'c1-24', content: 'Have a great Friday boss. Any plans for next week same schedule?', sender: 'them', time: 'Fri 08:01' },
    ]
  },

  // ── Sarah Bello: Rider friend & colleague at same office ──────────────────
  'mock-2': {
    id: 'mock-2',
    display_name: 'Sarah Bello',
    phone: '+234 806 987 6543',
    role: 'rider',
    avatar: 'S',
    isContact: true,
    isPending: false,
    unread: 2,
    messages: [
      { id: 's2-1', content: 'Hey! I noticed we both use MyCustomer. How are you finding it?', sender: 'them', time: 'Mon 09:10' },
      { id: 's2-2', content: 'It\'s honestly great. I\'ve been using Chinedu all week for my commute. No surge pricing, I just agree on a fare once and that\'s it.', sender: 'me', time: 'Mon 09:15' },
      { id: 's2-3', content: 'That\'s what I like too! Are you going to the team offsite on Wednesday? I was thinking of sharing a ride.', sender: 'them', time: 'Mon 09:17' },
      { id: 's2-4', content: 'Yes I am! Where are you coming from?', sender: 'me', time: 'Mon 09:19' },
      { id: 's2-5', content: 'Yaba. If your driver passes through, maybe I can hop in? Or we can split a separate booking.', sender: 'them', time: 'Mon 09:21' },
      { id: 's2-6', content: 'Chinedu doesn\'t usually go that direction but let me check with him. Otherwise let\'s just coordinate to arrive around the same time.', sender: 'me', time: 'Mon 09:25' },
      { id: 's2-7', content: 'Sounds good! Also — do you know how to share the app with someone? I want to add my regular driver Femi.', sender: 'them', time: 'Mon 09:28' },
      { id: 's2-8', content: 'Yes! Go to Contacts, tap the + button at the top right. It\'ll generate a link you share with Femi. He signs up through that link and shows as a pending invite.', sender: 'me', time: 'Mon 09:31' },
      { id: 's2-9', content: 'Oh perfect! That\'s so clean. Thanks 🙏', sender: 'them', time: 'Mon 09:32' },
      { id: 's2-10', content: 'Did you see the memo about the Q4 planning session? They moved it to Thursday.', sender: 'them', time: 'Tue 10:05' },
      { id: 's2-11', content: 'Yes just saw it. Annoying they gave us such short notice 😅', sender: 'me', time: 'Tue 10:08' },
      { id: 's2-12', content: 'Are you heading to the Island directly after work today? I need to go to Balogun market quickly.', sender: 'them', time: 'Wed 16:00' },
      { id: 's2-13', content: 'I\'m getting a lift from Chinedu straight home. But Balogun isn\'t too far from VI, maybe Emeka can take you?', sender: 'me', time: 'Wed 16:05' },
      { id: 's2-14', content: 'Good idea, I\'ll message him. By the way the Wednesday offsite was so good! The Ikoyi venue was 🔥', sender: 'them', time: 'Wed 18:30' },
      { id: 's2-15', content: 'Right?! The food especially 😂', sender: 'me', time: 'Wed 18:33' },
      { id: 's2-16', content: 'Haha yes! Okay I safely reached home. Chat tomorrow!', sender: 'them', time: 'Wed 20:10' },
      { id: 's2-17', content: 'Happy Friday! Are you coming to the drinks after work at Quilox?', sender: 'them', time: 'Fri 14:00' },
      { id: 's2-18', content: 'Is that still happening? Yes probably for a bit. Who\'s driving tonight?', sender: 'them', time: 'Fri 14:35' },
    ]
  },

  // ── Emeka Nwosu: Backup driver, airport run with counter-offer ───────────
  'mock-3': {
    id: 'mock-3',
    display_name: 'Emeka Nwosu',
    phone: '+234 701 555 9999',
    role: 'driver',
    avatar: 'E',
    completion_rate: 84,
    car_make_model: 'Honda Accord 2015',
    plate_number: 'ABJ-123-EK',
    bank_name: 'Zenith Bank',
    account_number: '2109876543',
    isContact: true,
    isPending: false,
    unread: 0,
    messages: [
      { id: 'e3-1', content: 'Hello, Chinedu gave me your contact. He said you might need a driver today?', sender: 'them', time: 'Thu 06:10' },
      { id: 'e3-2', content: 'Yes! Chinedu is sick, I need someone at 7am from Lekki Phase 1 Gate B to Eko Atlantic, Victoria Island.', sender: 'me', time: 'Thu 06:13' },
      { id: 'e3-3', content: 'I can do that. My rate is usually ₦3,000 for that route in the morning.', sender: 'them', time: 'Thu 06:14' },
      { id: 'e3-4', content: 'Chinedu charges ₦2,800. Can you match that?', sender: 'me', time: 'Thu 06:16' },
      { id: 'e3-5', content: 'Chinedu\'s car is smaller. My Accord has more space and I always have cold water in the back 😄. But okay, ₦2,900 and I\'ll be there by 6:55.', sender: 'them', time: 'Thu 06:18' },
      { id: 'e3-6', content: 'Deal! Send me a booking offer through the app.', sender: 'me', time: 'Thu 06:20' },
      { id: 'e3-7', content: 'Done, sent the offer. Please confirm.', sender: 'them', time: 'Thu 06:22', type: 'booking' },
      { id: 'e3-8', content: 'Confirmed! On my way down at 6:55.', sender: 'me', time: 'Thu 06:23' },
      { id: 'e3-9', content: 'I am here already, black Honda Accord.', sender: 'them', time: 'Thu 06:53' },
      { id: 'e3-10', content: 'Arriving safely. Thank you Emeka, the car is very clean!', sender: 'me', time: 'Thu 08:10' },
      { id: 'e3-11', content: 'You\'re welcome! Any time you need me just reach out.', sender: 'them', time: 'Thu 08:12' },
      { id: 'e3-12', content: 'Emeka, I have an airport pickup needed tonight. Murtala Airport Arrival Hall, 11pm. The person is flying in from Abuja. Ride back to Lekki Phase 1.', sender: 'me', time: 'Thu 14:30' },
      { id: 'e3-13', content: 'Night runs are my specialty! I\'ll send a booking offer. My night rate for airport to Lekki is ₦8,500 — fuel, late hour, and the airport queue can take 45 mins sometimes.', sender: 'them', time: 'Thu 14:35' },
      { id: 'e3-14', content: 'Offer sent 🚗', sender: 'them', time: 'Thu 14:36', type: 'booking' },
      { id: 'e3-15', content: 'That\'s a bit steep. Can we do ₦7,500?', sender: 'me', time: 'Thu 14:40' },
      { id: 'e3-16', content: 'I countered at ₦8,000 with the night surcharge tag. That\'s my final — I have to queue at the airport and sometimes wait over an hour past midnight.', sender: 'them', time: 'Thu 14:43' },
      { id: 'e3-17', content: 'Fair enough. Accepting ₦8,000. Please be at Arrivals by 10:45pm in case the flight is early.', sender: 'me', time: 'Thu 14:47' },
      { id: 'e3-18', content: 'Understood. I\'ll WhatsApp you when I\'m in position. Flight number so I can track it?', sender: 'them', time: 'Thu 14:49' },
      { id: 'e3-19', content: 'Arik Air W3 201. Thanks Emeka!', sender: 'me', time: 'Thu 14:51' },
      { id: 'e3-20', content: 'I am at Arrivals, just parked. Flight just landed, 15 mins for bags. 👍', sender: 'them', time: 'Thu 22:58' },
      { id: 'e3-21', content: 'Perfect! They just messaged me, they\'re at baggage carousel.', sender: 'me', time: 'Thu 23:00' },
      { id: 'e3-22', content: 'Your guest is in the car, we are leaving the airport now. Safe dropoff in about 40 minutes.', sender: 'them', time: 'Thu 23:22' },
      { id: 'e3-23', content: 'Thank you so much Emeka. Really appreciate the professionalism 🙏', sender: 'me', time: 'Fri 00:10' },
      { id: 'e3-24', content: 'Anytime! God bless. Have a good weekend.', sender: 'them', time: 'Fri 00:12' },
    ]
  },

  // ── Tunde Adeyemi: Pending driver invite ─────────────────────────────────
  'pending-1': {
    id: 'pending-1',
    display_name: 'Tunde Adeyemi',
    phone: '+234 809 111 2222',
    role: 'driver',
    avatar: 'T',
    completion_rate: 100,
    car_make_model: 'Lexus RX350 2019',
    plate_number: 'KJA-999-BB',
    bank_name: 'Access Bank',
    account_number: '0987654321',
    isContact: false,
    isPending: true,
    unread: 1,
    messages: [
      { id: 't1-1', content: 'Good afternoon. A colleague of yours referred me through MyCustomer. I am a professional driver with 5 years experience — executive and airport runs are my specialty. I operate a Lexus RX350. Please accept my invite and we can discuss.', sender: 'them', time: 'Fri 13:30' },
    ]
  },

  // ── System: Welcome + feature education messages ──────────────────────────
  'system': {
    id: 'system',
    display_name: 'MyCustomer',
    phone: '+0000000000',
    role: 'system',
    avatar: 'M',
    isSystem: true,
    isContact: true,
    isPending: false,
    unread: 0,
    messages: [
      {
        id: 'sys-1',
        content: '👋 Welcome to MyCustomer!\n\nHere you can manage all your trusted driver relationships, book rides, and track your history — completely commission-free.\n\nNeed help? Reach us at support@mycustomer.app',
        sender: 'them',
        time: 'Mon 09:00'
      },
      {
        id: 'sys-2',
        content: '💡 Tip: To add a new driver, tap the + icon at the top of the Chats screen to generate a shareable invite link. Your driver signs up through that link and appears as a pending contact for you to review.',
        sender: 'them',
        time: 'Mon 09:00'
      },
      {
        id: 'sys-3',
        content: '🗓️ Your first recurring ride has been scheduled with Chinedu Okeke (Mon-Fri, Lekki → Eko Atlantic at 7:00am). Check your Calendar tab to view and manage it.',
        sender: 'them',
        time: 'Mon 07:05'
      },
      {
        id: 'sys-4',
        content: '✅ Ride completed — Thursday, Sept 25 with Emeka Nwosu. Airport pickup, Murtala Muhammed → Lekki Phase 1. Fare paid: ₦8,000.',
        sender: 'them',
        time: 'Fri 00:15'
      },
    ]
  }
};

export function getMockDb(): Record<string, ContactProfile> {
  if (typeof window === 'undefined') return INITIAL_DB;
  const stored = localStorage.getItem('mycustomer_mock_db');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // If it's completely empty (e.g. from an old bug), re-seed
      if (Object.keys(parsed).length === 0) {
        throw new Error('Empty database');
      }
      return parsed;
    } catch {
      // Corrupted storage or empty — reset
      localStorage.removeItem('mycustomer_mock_db');
    }
  }
  localStorage.setItem('mycustomer_mock_db', JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
}

/** Call this from DevTools or a reset button to wipe and re-seed the database */
export function resetMockDb() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mycustomer_mock_db', JSON.stringify(INITIAL_DB));
  localStorage.removeItem('mock_bookings');
  window.dispatchEvent(new Event('mockDbUpdated'));
}

export function saveMockDb(db: Record<string, ContactProfile>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mycustomer_mock_db', JSON.stringify(db));
    window.dispatchEvent(new Event('mockDbUpdated'));
  }
}

export function useMockDb() {
  // Start EMPTY to avoid SSR hydration mismatch — real data loads in useEffect
  const [db, setDb] = useState<Record<string, ContactProfile>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setDb(getMockDb());
    setIsLoaded(true);

    const handleUpdate = () => setDb(getMockDb());
    window.addEventListener('mockDbUpdated', handleUpdate);
    return () => window.removeEventListener('mockDbUpdated', handleUpdate);
  }, []);

  const acceptInvite = (id: string) => {
    const newDb = { ...db };
    if (newDb[id]) {
      newDb[id].isPending = false;
      newDb[id].isContact = true;
      newDb[id].messages = [...(newDb[id].messages || []), {
        id: Date.now(),
        content: 'Thank you for accepting! I look forward to being of service.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      saveMockDb(newDb);
    }
  };

  const declineInvite = (id: string) => {
    const newDb = { ...db };
    delete newDb[id];
    saveMockDb(newDb);
  };

  const sendMessage = (id: string, text: string) => {
    const newDb = { ...db };
    if (newDb[id]) {
      newDb[id].messages = [...(newDb[id].messages || []), {
        id: Date.now(),
        content: text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      newDb[id].unread = 0;
      saveMockDb(newDb);
    }
  };

  const markAsRead = (id: string) => {
    const newDb = { ...db };
    if (newDb[id] && newDb[id].unread > 0) {
      newDb[id].unread = 0;
      saveMockDb(newDb);
    }
  };

  return { db, isLoaded, acceptInvite, declineInvite, sendMessage, markAsRead };
}
