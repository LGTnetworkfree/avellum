import Link from 'next/link';

const footerLinks = [
  { label: 'X (TWITTER)', href: 'https://x.com/Avellumxyz', external: true },
  { label: 'GITHUB', href: 'https://github.com', external: true },
  { label: 'DOCS', href: '/docs', external: false },
  { label: 'CONTACT', href: 'mailto:contact@avellum.io', external: false },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#0a0a0a] bg-[#00ffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Statement */}
        <p className="text-center text-[#0a0a0a] font-sans text-base leading-relaxed max-w-2xl mx-auto mb-6">
          Avellum is open-source and community-driven.
          <br />
          Join us in building the trust layer for AI agents.
        </p>

        {/* 4 Link Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto mb-6">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#0a0a0a] flex items-center justify-center py-3 px-4 text-[#0a0a0a] font-sans text-xs font-medium tracking-[0.2em] hover:bg-[#0a0a0a] hover:text-[#00ffff] transition-colors duration-200"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="border border-[#0a0a0a] flex items-center justify-center py-3 px-4 text-[#0a0a0a] font-sans text-xs font-medium tracking-[0.2em] hover:bg-[#0a0a0a] hover:text-[#00ffff] transition-colors duration-200"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Copyright */}
        <p className="text-center text-[#0a0a0a]/60 font-sans font-medium text-[0.65rem] tracking-[0.15em] uppercase">
          &copy; 2026 Avellum. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
