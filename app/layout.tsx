import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SolanaWalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avellum - Trust Layer for the A2A Economy",
  description: "The decentralized trust layer for AI agents. Rate, verify, and discover trustworthy agents in the A2A economy.",
  keywords: ["AI agents", "trust score", "A2A", "Solana", "blockchain", "verification"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased animated-gradient min-h-screen`}>
        <SolanaWalletProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
