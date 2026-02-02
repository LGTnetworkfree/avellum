'use client';

export default function Ticker() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/60 backdrop-blur-sm border-b border-[#1e3a5a]/30 h-6 flex items-center overflow-hidden pointer-events-none">
            <div className="marquee-container w-full opacity-40">
                <div className="marquee-content text-[#00d4ff] text-[0.6rem] font-sans font-medium tracking-[0.2em] uppercase py-1">
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                </div>
            </div>
        </div>
    );
}
