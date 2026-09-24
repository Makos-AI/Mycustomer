"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

const MOCK_CHATS = [
  { id: 'mock-1', name: 'Chinedu Okeke', lastMessage: 'I am on my way!', time: '09:14', unread: 2, isPending: false, avatar: 'C', completion_rate: 98 },
  { id: 'system', name: 'MyCustomer', lastMessage: "Welcome to MyCustomer! Here's how to get started...", time: 'Yesterday', unread: 1, isPending: false, avatar: 'M', isSystem: true },
];

const MOCK_PENDING = [
  { id: 'pending-1', name: 'Tunde Adeyemi', lastMessage: 'Tunde invited you as a customer', time: '10:22', isPending: true, avatar: 'T' },
];

const MOCK_CONTACTS = [
  { id: 'mock-1', name: 'Chinedu Okeke', phone: '+234 803 123 4567', avatar: 'C' },
  { id: 'mock-2', name: 'Sarah Bello', phone: '+234 806 987 6543', avatar: 'S' },
];

export default function ChatListPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'chats' | 'contacts'>('chats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dev_bypass')) {
      router.push('/auth');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen" style={{ background: '#111111' }}>
      <div className="px-4 pt-8 pb-2" style={{ background: '#111111' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Chats</h1>
          <button
            onClick={() => router.push('/contacts/invite')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#22c55e' }}>
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex gap-6 border-b mb-1" style={{ borderColor: '#2a2a2a' }}>
          {(['chats', 'contacts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="pb-2 text-sm font-semibold capitalize transition-colors"
              style={{
                color: tab === t ? '#22c55e' : '#6b7280',
                borderBottom: tab === t ? '2px solid #22c55e' : '2px solid transparent',
                marginBottom: '-1px'
              }}>
              {t === 'chats' ? 'Chats' : 'Contacts'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' && (
          <div>
            {MOCK_PENDING.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ background: '#1a1a0a', borderBottom: '1px solid #2a2a1a' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: '#854d0e', color: '#fef08a' }}>{item.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{item.name}</p>
                  <p className="text-xs truncate" style={{ color: '#a16207' }}>{item.lastMessage}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#22c55e' }}>Accept</button>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold" style={{ border: '1px solid #4b5563', color: '#9ca3af' }}>Decline</button>
                </div>
              </div>
            ))}

            {MOCK_CHATS.map(chat => (
              <Link href={`/chat/${chat.id}`} key={chat.id}>
                <div className="flex items-center gap-3 px-4 py-3 active:bg-white/5" style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ background: chat.isSystem ? '#14532d' : '#1e3a2f', color: chat.isSystem ? '#4ade80' : '#22c55e' }}>
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-semibold text-sm" style={{ color: '#f3f4f6' }}>{chat.name}</p>
                      <span className="text-xs shrink-0 ml-2" style={{ color: chat.unread ? '#22c55e' : '#6b7280' }}>{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs truncate" style={{ color: '#6b7280' }}>{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: '#22c55e' }}>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'contacts' && (
          <div>
            {MOCK_CONTACTS.map(contact => (
              <Link href={`/profile/${contact.id}`} key={contact.id}>
                <div className="flex items-center gap-3 px-4 py-3 active:bg-white/5" style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: '#1e3a2f', color: '#22c55e' }}>{contact.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#f3f4f6' }}>{contact.name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{contact.phone}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
