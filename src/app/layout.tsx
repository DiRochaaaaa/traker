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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
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
