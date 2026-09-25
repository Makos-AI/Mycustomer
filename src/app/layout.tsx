import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";

export const metadata: Metadata = {
  title: "MyCustomer",
  description: "Decentralized transit booking ledger & CRM",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyCustomer",
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-900 text-slate-50 flex flex-col">
        <main className="flex-1 w-full max-w-md mx-auto relative overflow-hidden">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
