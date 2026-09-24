"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, QrCode, Copy } from "lucide-react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

export default function InvitePage() {
  const router = useRouter();
  const [inviteUrl, setInviteUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");
      
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
      
      // Construct deep link
      const url = `${window.location.origin}/join?ref=${user.id}&name=${encodeURIComponent(profile?.display_name || 'A user')}`;
      setInviteUrl(url);
      setUser(profile);
      
      // Generate QR Code
      try {
        const qr = await QRCode.toDataURL(url, {
          color: { dark: '#14b8a6', light: '#0f172a' },
          margin: 2
        });
        setQrCodeUrl(qr);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [router]);

  const handleShare = async () => {
    const text = `Join me on MyCustomer to manage our rides without commissions!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MyCustomer',
          text: text,
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + inviteUrl)}`, '_blank');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 mr-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Invite Contacts</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="glass-panel p-8 w-full flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-teal-400" />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Your Invite QR Code</h2>
          <p className="text-sm text-slate-400 mb-6">
            Let drivers or riders scan this to connect instantly on MyCustomer.
          </p>

          {qrCodeUrl ? (
            <div className="bg-white p-2 rounded-xl mb-6">
              <img src={qrCodeUrl} alt="Invite QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-800 rounded-xl mb-6 animate-pulse" />
          )}

          <div className="flex gap-3 w-full">
            <button onClick={handleShare} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share Link
            </button>
            <button onClick={handleCopy} className="flex-1 glass-input flex items-center justify-center gap-2 !py-3 hover:bg-slate-700">
              <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
