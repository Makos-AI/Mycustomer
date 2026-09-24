"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('dev_bypass') === 'true') {
      router.replace("/chat");
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // User is logged in (e.g. just clicked a Magic Link)
        // Check if they have completed their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();

        if (profile?.display_name) {
          router.replace("/chat");
        } else {
          router.replace("/auth/profile");
        }
      } else {
        router.replace("/auth");
      }
    });

    // Also listen for auth state changes (crucial for when the Magic Link redirects back)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();

        if (profile?.display_name) {
          router.replace("/chat");
        } else {
          router.replace("/auth/profile");
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
