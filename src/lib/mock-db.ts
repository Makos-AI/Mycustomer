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

const INITIAL_DB: Record<string, ContactProfile> = {
  'mock-1': {
    id: 'mock-1', display_name: 'Chinedu Okeke', phone: '+234 803 123 4567', role: 'driver', avatar: 'C',
    completion_rate: 98, car_make_model: 'Toyota Corolla 2010', plate_number: 'LSR-432-XY',
    bank_name: 'GTBank', account_number: '0123456789', isContact: true, isPending: false, unread: 0,
    messages: [
      { id: 1, content: 'Good morning! Ready to go?', sender: 'them', time: '07:32' },
      { id: 2, content: 'Yes I am on my way now', sender: 'me', time: '07:33' },
      { id: 3, content: 'I am waiting outside', sender: 'them', time: '07:41' },
    ]
  },
  'mock-2': {
    id: 'mock-2', display_name: 'Sarah Bello', phone: '+234 806 987 6543', role: 'rider', avatar: 'S',
    isContact: true, isPending: false, unread: 2,
    messages: [
      { id: 1, content: 'Hey, are you free for a drop later today?', sender: 'them', time: '14:20' },
      { id: 2, content: 'Around 5pm to Ikeja', sender: 'them', time: '14:21' },
    ]
  },
  'mock-3': {
    id: 'mock-3', display_name: 'Emeka Nwosu', phone: '+234 701 555 9999', role: 'driver', avatar: 'E',
    completion_rate: 84, car_make_model: 'Honda Accord 2015', plate_number: 'ABJ-123-EK',
    bank_name: 'Zenith Bank', account_number: '2109876543', isContact: true, isPending: false, unread: 0,
    messages: [
      { id: 1, content: 'Traffic is heavy on 3rd mainland bridge', sender: 'them', time: '17:05' },
      { id: 2, content: 'I\'ll be 15 minutes late, sorry!', sender: 'them', time: '17:06' },
      { id: 3, content: 'No problem, thanks for letting me know.', sender: 'me', time: '17:10' },
    ]
  },
  'pending-1': {
    id: 'pending-1', display_name: 'Tunde Adeyemi', phone: '+234 809 111 2222', role: 'driver', avatar: 'T',
    completion_rate: 100, car_make_model: 'Lexus RX350', plate_number: 'KJA-999-BB',
    bank_name: 'Access Bank', account_number: '0987654321', isContact: false, isPending: true, unread: 0,
    messages: [] // Empty until accepted
  },
  'system': {
    id: 'system', display_name: 'MyCustomer', phone: '+0000000000', role: 'system', avatar: 'M',
    isSystem: true, isContact: true, isPending: false, unread: 1,
    messages: [
      { id: 1, content: '👋 Welcome to MyCustomer! Here you can manage all your trusted driver relationships, book rides, and track your history — all without platform commissions.\n\nNeed help? Reach us at support@mycustomer.app', sender: 'them', time: '09:00' },
    ]
  }
};

export function getMockDb(): Record<string, ContactProfile> {
  if (typeof window === 'undefined') return INITIAL_DB;
  const stored = localStorage.getItem('mycustomer_mock_db');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('mycustomer_mock_db', JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
}

export function saveMockDb(db: Record<string, ContactProfile>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mycustomer_mock_db', JSON.stringify(db));
    window.dispatchEvent(new Event('mockDbUpdated'));
  }
}

export function useMockDb() {
  const [db, setDb] = useState<Record<string, ContactProfile>>(INITIAL_DB);

  useEffect(() => {
    setDb(getMockDb());
    const handleUpdate = () => setDb(getMockDb());
    window.addEventListener('mockDbUpdated', handleUpdate);
    return () => window.removeEventListener('mockDbUpdated', handleUpdate);
  }, []);

  const acceptInvite = (id: string) => {
    const newDb = { ...db };
    if (newDb[id]) {
      newDb[id].isPending = false;
      newDb[id].isContact = true;
      newDb[id].messages.push({
        id: Date.now(),
        content: 'Thank you, I have added you as a customer.',
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
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
      newDb[id].messages.push({
        id: Date.now(),
        content: text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      // Clear unread when sending a message
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
  }

  return { db, acceptInvite, declineInvite, sendMessage, markAsRead };
}
