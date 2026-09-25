"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useMockDb } from "@/lib/mock-db";

export default function ChatListPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'chats' | 'contacts'>('chats');

  const { db, isLoaded, acceptInvite, declineInvite } = useMockDb();

  useEffect(() => {
    // Only redirect if NOT in dev bypass AND page has loaded
    const isBypass = typeof window !== 'undefined' && localStorage.getItem('dev_bypass') === 'true';
    if (!isBypass) {
      // In prod we'd check Supabase session here. For now, redirect to auth.
      router.push('/auth');
    }
  }, [router]);

  // Convert object to arrays and categorize — with defensive checks
  const allProfiles = Object.values(db);
  const pendingInvites = allProfiles.filter(p => p.isPending);
  const regularChats = allProfiles.filter(p => !p.isPending && (p.messages?.length ?? 0) > 0);
  const contacts = allProfiles.filter(p => p.isContact);

  // Show skeleton while loading from localStorage
  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen" style={{ background: '#111111' }}>
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="w-24 h-7 bg-slate-800 rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="px-4 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-32 h-3 bg-slate-800 rounded animate-pulse" />
                <div className="w-48 h-3 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'chats' && (
          <div>
            {pendingInvites.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ background: '#1a1a0a', borderBottom: '1px solid #2a2a1a' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: '#854d0e', color: '#fef08a' }}>{item.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{item.display_name}</p>
                  <p className="text-xs truncate" style={{ color: '#a16207' }}>{item.display_name.split(' ')[0]} wants to be your driver</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => acceptInvite(item.id)} className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#22c55e' }}>Accept</button>
                  <button onClick={() => declineInvite(item.id)} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ border: '1px solid #4b5563', color: '#9ca3af' }}>Decline</button>
                </div>
              </div>
            ))}

            {regularChats.map(chat => {
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              return (
                <Link href={`/chat/${chat.id}`} key={chat.id}>
                  <div className="flex items-center gap-3 px-4 py-3 active:bg-white/5" style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ background: chat.isSystem ? '#14532d' : '#1e3a2f', color: chat.isSystem ? '#4ade80' : '#22c55e' }}>
                      {chat.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-semibold text-sm" style={{ color: '#f3f4f6' }}>{chat.display_name}</p>
                        <span className="text-xs shrink-0 ml-2" style={{ color: chat.unread ? '#22c55e' : '#6b7280' }}>
                          {lastMessage?.time || ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs truncate" style={{ color: '#6b7280' }}>
                          {lastMessage?.content?.split('\n')[0] || ''}
                        </p>
                        {(chat.unread ?? 0) > 0 && (
                          <span className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: '#22c55e' }}>
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {tab === 'contacts' && (
          <div>
            {contacts.map(contact => (
              <Link href={`/profile/${contact.id}`} key={contact.id}>
                <div className="flex items-center gap-3 px-4 py-3 active:bg-white/5" style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: '#1e3a2f', color: '#22c55e' }}>{contact.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#f3f4f6' }}>{contact.display_name}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{contact.role === 'driver' ? `Driver · ${contact.phone}` : contact.phone}</p>
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
