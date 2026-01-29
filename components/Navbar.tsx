'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'HOME' },
        { href: '/agents', label: 'AGENTS_DB' },
        { href: '/dashboard', label: 'VERIFIER_DASH' },
    ];

    return (
        <nav className="fixed top-8 left-0 right-0 z-40 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#1e3a5a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 border border-[#00d4ff] flex items-center justify-center bg-[#00d4ff]/10 group-hover:bg-[#00d4ff]/20 transition-colors">
                            <span className="text-[#00d4ff] font-serif font-bold text-2xl">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[#00d4ff] tracking-widest leading-none">
                                AVELLUM
                            </span>
                            <span className="text-[10px] text-[#4b6a8a] tracking-[0.2em] font-mono">
                                TRUST_LAYER_V1.0
                            </span>
                        </div>
                    </Link>

                    {/* Navigation links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm tracking-widest transition-all duration-300 relative group px-2 py-1 ${pathname === link.href
                                    ? 'text-[#00d4ff]'
                                    : 'text-[#4b6a8a] hover:text-[#00d4ff]'
                                    }`}
                            >
                                <span className="relative z-10 font-mono font-bold">
                                    {pathname === link.href ? '> ' : ''}{link.label}
                                </span>
                                {pathname === link.href && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Wallet */}
                    <ConnectWallet />
                </div>
            </div>
        </nav>
    );
}
