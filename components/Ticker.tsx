'use client';

export default function Ticker() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628] border-b border-[#1e3a5a] h-8 flex items-center overflow-hidden">
            <div className="marquee-container w-full">
                <div className="marquee-content text-[#00d4ff] text-xs font-mono tracking-widest uppercase py-1">
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                    AVELLUM PROTOCOL // [TRUST LAYER] // LIVE ON SOLANA // VERIFIED AGENTS ONLY // SECURE CONNECTION ESTABLISHED // SYSTEM STATUS: ONLINE //
                </div>
            </div>
        </div>
    );
}
