import type { Metadata } from "next";
import "./globals.css";
import SolanaWalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Scanlines from "@/components/Scanlines";
import CursorGlow from "@/components/CursorGlow";
import Ticker from "@/components/Ticker";
import ParticleBackground from "@/components/ParticleBackground";
import PageTransition from "@/components/PageTransition";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = {
  title: "Avellum // Trust Layer",
  description: "The decentralized trust layer for AI agents. Rate, verify, and discover trustworthy agents in the A2A economy.",
  openGraph: {
    title: "Avellum // Trust Layer",
    description: "The decentralized trust layer for AI agents. Rate, verify, and discover trustworthy agents in the A2A economy.",
    siteName: "Avellum",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Avellumxyz",
    creator: "@Avellumxyz",
    title: "Avellum // Trust Layer",
    description: "The decentralized trust layer for AI agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        <SolanaWalletProvider>
          <LoadingScreen />
          <div className="aurora-wrap">
            <div className="aurora-blob aurora-blob-1" />
            <div className="aurora-blob aurora-blob-2" />
            <div className="aurora-blob aurora-blob-3" />
            <div className="aurora-blob aurora-blob-4" />
          </div>
          <ParticleBackground />
          <Scanlines />
          <CursorGlow />
          <Ticker />
          <Navbar />
          <main className="pt-[92px] md:pt-[96px]">
            <PageTransition>{children}</PageTransition>
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
