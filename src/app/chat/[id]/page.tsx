"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, MoreVertical, Plus, Send, Mic } from "lucide-react";
import Link from "next/link";
import { TemplateBar } from "@/components/chat/TemplateBar";

const MOCK_CONTACTS: Record<string, any> = {
  'mock-1': { display_name: 'Chinedu Okeke', completion_rate: 98 },
  'system': { display_name: 'MyCustomer', isSystem: true },
};

const INITIAL_MESSAGES: Record<string, any[]> = {
  'mock-1': [
    { id: 1, content: 'Good morning! Ready to go?', sender: 'them', time: '07:32' },
    { id: 2, content: 'Yes I am on my way now', sender: 'me', time: '07:33' },
    { id: 3, content: 'I am waiting outside', sender: 'them', time: '07:41' },
  ],
  'system': [
    { id: 1, content: '👋 Welcome to MyCustomer! Here you can manage all your trusted driver relationships, book rides, and track your history — all without platform commissions.\n\nNeed help? Reach us at support@mycustomer.app', sender: 'them', time: '09:00' },
  ],
};

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const contactId = params.id;
  const contact = MOCK_CONTACTS[contactId] || { display_name: 'Contact' };
  const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES[contactId] || []);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), content: text, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput("");
  };

  const handleSend = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0d1117' }}>
      <div className="flex items-center gap-3 px-3 py-3 shrink-0" style={{ background: '#111827', borderBottom: '1px solid #1f2937' }}>
        <button onClick={() => router.back()} className="p-1.5 rounded-full text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link href={`/profile/${contactId}`} className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: contact.isSystem ? '#14532d' : '#1e3a2f', color: '#22c55e' }}>
            {contact.display_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-white leading-tight">{contact.display_name}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{contact.isSystem ? 'Official Account' : `${contact.completion_rate}% Reliable`}</p>
          </div>
        </Link>
        <div className="flex gap-1">
          <button className="p-2 rounded-full hover:bg-white/10 text-slate-400"><Phone className="w-4 h-4" /></button>
          <button className="p-2 rounded-full hover:bg-white/10 text-slate-400"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] rounded-2xl px-3 py-2"
              style={{
                background: msg.sender === 'me' ? '#1d5e42' : '#1f2937',
                borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}>
              <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] mt-1 text-right" style={{ color: 'rgba(255,255,255,0.45)' }}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0" style={{ background: '#111827', borderTop: '1px solid #1f2937' }}>
        <TemplateBar onSend={sendMessage} />
        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2">
          <button type="button" className="p-2 text-slate-400 hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center rounded-full px-4 py-2" style={{ background: '#1f2937' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          {input.trim() ? (
            <button type="submit" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
              <Mic className="w-4 h-4 text-white" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
