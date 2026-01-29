'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-8 left-0 right-0 z-40">
            <div className="max-w-7xl mx-auto border-l border-r border-b border-[#1e3a5a] bg-[#0a1628]/95 backdrop-blur-md">
                <div className="grid grid-cols-2 md:grid-cols-[1.5fr_2fr_1.5fr] h-16 divide-x divide-[#1e3a5a]">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center px-6 hover:bg-[#142a44] transition-colors group">
                        <span className="font-serif font-bold text-xl text-[#00d4ff] tracking-tight group-hover:text-white transition-colors">
                            AVELLUM
                        </span>
                        <span className="ml-3 font-mono text-[0.6rem] text-[#4b6a8a] tracking-widest mt-1">
                            v.2.0.4-CRYPTO
                        </span>
                    </Link>

                    {/* Navigation Links (Center) */}
                    <div className="hidden md:flex items-center justify-center divide-x divide-[#1e3a5a] h-full">
                        {[
                            { href: '/agents', label: 'EXPLORER' },
                            { href: '/dashboard', label: 'DASHBOARD' },
                            { href: '/docs', label: 'DOCS' }
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center justify-center h-full px-8 text-xs font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#00d4ff] hover:text-[#0a1628] ${pathname === link.href ? 'text-[#00d4ff] bg-[#142a44]' : 'text-[#4b6a8a]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Wallet Connection (Right) */}
                    <div className="flex items-center justify-center px-4 bg-[#0a1628]">
                        <ConnectWallet />
                    </div>
                </div>
            </div>
        </nav>
    );
}
