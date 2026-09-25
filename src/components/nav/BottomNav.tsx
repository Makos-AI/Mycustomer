"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Calendar } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  
  // Only show nav on /chat and /schedule (and their roots)
  const isChat = pathname === "/chat" || pathname === "/";
  const isSchedule = pathname === "/schedule";
  const showNav = isChat || isSchedule;

  if (!showNav) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#111111] border-t border-[#1f2937] flex items-center justify-around z-50">
      <Link href="/chat" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isChat ? 'text-[#22c55e]' : 'text-slate-500 hover:text-slate-300'}`}>
        <div className="relative">
          <MessageCircle className="w-6 h-6 mb-1" />
          {/* Example unread badge */}
          {/* <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#111111]"></span> */}
        </div>
        <span className="text-[10px] font-bold">Chats</span>
      </Link>
      
      <Link href="/schedule" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isSchedule ? 'text-[#22c55e]' : 'text-slate-500 hover:text-slate-300'}`}>
        <Calendar className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-bold">Schedule</span>
      </Link>
    </div>
  );
}
