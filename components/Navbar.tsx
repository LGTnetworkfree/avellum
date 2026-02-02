'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/agents', label: 'Explorer' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/docs', label: 'Docs' }
    ];

    return (
        <nav className="fixed top-6 left-0 right-0 z-40 bg-[#0a1628] backdrop-blur-xl border-b border-[#1e3a5a]">
            {/* Gradient fade below navbar */}
            <div className="absolute top-full left-0 right-0 h-6 bg-gradient-to-b from-[#0a1628]/80 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-[60px] flex items-stretch">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 px-6 border-r border-[#1e3a5a]/30 hover:bg-[#00ffff]/[0.03] transition-colors duration-200">
                        <Image
                            src="/logo.svg"
                            alt="Avellum"
                            height={36}
                            width={36}
                            className="nav-logo-hover"
                        />
                        <span className="font-sans text-[0.95rem] font-medium text-white tracking-[-0.01em]">
                            Avellum
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-stretch">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-5 text-[0.82rem] font-sans border-r border-[#1e3a5a]/30 nav-link-glow ${
                                    pathname === link.href
                                        ? 'text-white'
                                        : 'text-[#ffffff66]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Wallet */}
                    <div className="hidden md:flex items-center px-5 border-l border-[#1e3a5a]/30">
                        <ConnectWallet />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex items-center px-5 border-l border-[#1e3a5a]/30 text-[#ffffff66] hover:text-white transition-colors duration-200"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#0a1628] backdrop-blur-xl border-b border-[#1e3a5a]">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center px-6 py-4 text-[0.85rem] font-sans border-b border-[#1e3a5a]/30 transition-colors duration-200 ${
                                pathname === link.href
                                    ? 'text-white'
                                    : 'text-[#ffffff66] hover:text-white'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="px-6 py-4">
                        <ConnectWallet />
                    </div>
                </div>
            )}
        </nav>
    );
}
