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
        <nav className="fixed top-6 left-0 right-0 z-40 bg-[#0a1628]/80 backdrop-blur-xl border-b border-[#ffffff08]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-[60px] flex items-stretch">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 px-6 border-r border-[#ffffff08] hover:bg-[#ffffff04] transition-colors duration-200">
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
                                className={`flex items-center px-5 text-[0.82rem] font-sans border-r border-[#ffffff08] nav-link-glow ${
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
                    <div className="hidden md:flex items-center px-5 border-l border-[#ffffff08]">
                        <ConnectWallet />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex items-center px-5 border-l border-[#ffffff08] text-[#ffffff66] hover:text-white transition-colors duration-200"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#0a1628]/95 backdrop-blur-xl border-b border-[#ffffff08]">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center px-6 py-4 text-[0.85rem] font-sans border-b border-[#ffffff08] transition-colors duration-200 ${
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
