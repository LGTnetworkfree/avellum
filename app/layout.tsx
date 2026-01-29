import type { Metadata } from "next";
import "./globals.css";
import SolanaWalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Scanlines from "@/components/Scanlines";
import Ticker from "@/components/Ticker";

export const metadata: Metadata = {
  title: "Avellum // Trust Layer",
  description: "The decentralized trust layer for AI agents. Rate, verify, and discover trustworthy agents in the A2A economy.",
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
          <Scanlines />
          <Ticker />
          <Navbar />
          <main className="pt-24 pb-12">
            {children}
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
