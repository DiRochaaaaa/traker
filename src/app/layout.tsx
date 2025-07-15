import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HydrationChecker } from "@/components/HydrationChecker";
import { AuthGuard } from "@/components/AuthGuard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meta Ads Tracker - Dashboard de Vendas",
  description: "Sistema de tracking para acompanhar o lucro das vendas no Meta Ads em tempo real",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Meta Ads Tracker",
  },
  icons: {
    icon: [
      { url: "/images/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Meta Ads Tracker" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Meta Ads Tracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#1f2937" />
        
        {/* Additional PWA Icons */}
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/icon-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        
        <style>{`
          html {
            touch-action: manipulation;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
        suppressHydrationWarning={true}
      >
        <HydrationChecker />
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
