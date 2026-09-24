"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageCircle, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      if (typeof window !== 'undefined' && localStorage.getItem('dev_bypass') === 'true') {
        setConversations([
          {
            id: 'mock-1',
            nickname: 'Chinedu (Driver)',
            contact_profile: { id: 'mock-1', display_name: 'Chinedu', completion_rate: 98 }
          },
          {
            id: 'mock-2',
            nickname: 'Sarah (Rider)',
            contact_profile: { id: 'mock-2', display_name: 'Sarah', completion_rate: 100 }
          }
        ]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      // Simplified for MVP: Load contacts to simulate conversations list
      const { data: contacts } = await supabase
        .from('contacts')
        .select(`
          id,
          nickname,
          contact_profile:profiles!contacts_contact_id_fkey(id, display_name, avatar_url, completion_rate)
        `)
        .eq('user_id', user.id);
        
      setConversations(contacts || []);
      setLoading(false);
    }
    loadConversations();
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* App Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
          MyCustomer
        </h1>
        <div className="flex gap-4">
          <Link href="/contacts/invite" className="text-slate-300 hover:text-white">
            <UserPlus className="w-6 h-6" />
          </Link>
          <button className="text-slate-300 hover:text-white">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Invite your trusted drivers or riders to start booking.
            </p>
            <Link href="/contacts/invite" className="btn-primary inline-block">
              Invite Contacts
            </Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <Link href={`/chat/${conv.contact_profile.id}`} key={conv.id}>
              <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-teal-400">
                  {conv.contact_profile.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-100 truncate">
                      {conv.nickname || conv.contact_profile.display_name}
                    </h3>
                    <span className="text-xs text-slate-500">Just now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400 truncate">Tap to open chat</p>
                    {conv.contact_profile.completion_rate && (
                      <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {conv.contact_profile.completion_rate}% Reliable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
