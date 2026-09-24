"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const contactId = params.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [contact, setContact] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For MVP phase 1, mock basic structure
    async function loadMockData() {
      const { data } = await supabase.from('profiles').select('display_name, completion_rate').eq('id', contactId).single();
      setContact(data || { display_name: "Contact" });
    }
    loadMockData();
  }, [contactId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Optimistic UI for MVP
    setMessages([...messages, { id: Date.now(), content: input, sender_id: 'me', created_at: new Date() }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800 p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link href={`/profile/${contactId}`} className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-teal-400">
            {contact?.display_name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold">{contact?.display_name}</h2>
            {contact?.completion_rate && (
              <p className="text-xs text-teal-400">{contact.completion_rate}% Reliable</p>
            )}
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender_id === 'me' ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-100 rounded-bl-sm'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-[10px] text-right mt-1 opacity-70">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <button type="button" className="p-3 text-slate-400 hover:text-teal-400 rounded-full hover:bg-slate-800 transition-colors">
            <MapPin className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message or /book"
              className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
