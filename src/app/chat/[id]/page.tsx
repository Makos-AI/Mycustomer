"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, MoreVertical, Plus, Send, Mic, MapPin, Image as ImageIcon, Car, Trash2, Ban, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { TemplateBar } from "@/components/chat/TemplateBar";
import { useMockDb } from "@/lib/mock-db";

export default function ChatThreadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const contactId = params.id;
  
  const { db, sendMessage, markAsRead } = useMockDb();
  const contact = db[contactId];
  
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showDotMenu, setShowDotMenu] = useState(false);

  useEffect(() => {
    if (contact && contact.unread > 0) {
      markAsRead(contactId);
    }
  }, [contactId, contact, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contact?.messages]);

  const handleSend = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!input.trim()) return;
    sendMessage(contactId, input);
    setInput(""); 
  };

  if (!contact) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0d1117' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 shrink-0 relative z-20" style={{ background: '#111827', borderBottom: '1px solid #1f2937' }}>
        <button onClick={() => router.back()} className="p-1.5 rounded-full text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link href={`/profile/${contactId}`} className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: contact.isSystem ? '#14532d' : '#1e3a2f', color: '#22c55e' }}>
            {contact.avatar}
          </div>
          <div>
            <p className="font-semibold text-sm text-white leading-tight">{contact.display_name}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {contact.isSystem ? 'Official Account' : contact.role === 'driver' ? 'Driver' : 'Rider'}
            </p>
          </div>
        </Link>
        <div className="flex gap-1 relative">
          <a href={`tel:${contact.phone}`} className="p-2 rounded-full hover:bg-white/10 text-slate-400">
            <Phone className="w-4 h-4" />
          </a>
          <button 
            onClick={() => { setShowDotMenu(!showDotMenu); setShowPlusMenu(false); }} 
            className="p-2 rounded-full hover:bg-white/10 text-slate-400">
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {/* Triple Dot Dropdown */}
          {showDotMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border animate-fade-in" style={{ background: '#1f2937', borderColor: '#374151' }}>
              <div className="p-1">
                <Link href={`/profile/${contactId}`}>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 rounded-lg">View Profile</button>
                </Link>
                <button onClick={() => { alert('Chat cleared!'); setShowDotMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg text-slate-300">
                  <Trash2 className="w-4 h-4" /> Clear Chat
                </button>
                <button onClick={() => { alert('Contact blocked.'); setShowDotMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg text-slate-300">
                  <Ban className="w-4 h-4" /> Block
                </button>
                <button onClick={() => { alert('Report submitted.'); setShowDotMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/10 rounded-lg text-red-400">
                  <AlertTriangle className="w-4 h-4" /> Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2 relative z-0" 
        onClick={() => { setShowDotMenu(false); setShowPlusMenu(false); }}
        style={{ backgroundImage: 'url(/chatbackground.avif)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#0d1117', backgroundBlendMode: 'overlay' }}
      >
        {contact.messages.map(msg => (
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

      {/* Input Area */}
      <div className="shrink-0 relative z-10" style={{ background: '#111827', borderTop: '1px solid #1f2937' }}>
        <TemplateBar onSend={(text) => sendMessage(contactId, text)} />
        
        {/* Plus Menu Slide Up */}
        {showPlusMenu && (
          <div className="px-4 py-4 grid grid-cols-3 gap-4 border-b animate-slide-in" style={{ borderColor: '#1f2937', background: '#111827' }}>
            <button onClick={() => { alert('Location sharing coming soon!'); setShowPlusMenu(false); }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: '#2563eb' }}>
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-300">Location</span>
            </button>
            <button onClick={() => { alert('Photo sharing coming soon!'); setShowPlusMenu(false); }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: '#9333ea' }}>
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-300">Gallery</span>
            </button>
            <button onClick={() => { router.push('/book'); }} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: '#16a34a' }}>
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-300">Book Ride</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2">
          <button 
            type="button" 
            onClick={() => { setShowPlusMenu(!showPlusMenu); setShowDotMenu(false); }}
            className={`p-2 transition-colors ${showPlusMenu ? 'text-white bg-white/10 rounded-full' : 'text-slate-400 hover:text-white'}`}>
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center rounded-full px-4 py-2" style={{ background: '#1f2937' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onClick={() => { setShowDotMenu(false); setShowPlusMenu(false); }}
              placeholder="Message"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          {input.trim() ? (
            <button type="submit" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button type="button" onClick={() => alert('Voice note coming soon')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
              <Mic className="w-4 h-4 text-white" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
