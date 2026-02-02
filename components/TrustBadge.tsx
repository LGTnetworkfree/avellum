'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { getTrustScoreColor, getTrustLevel } from '@/lib/trust-score';

interface Props {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function TrustBadge({ score, size = 'md', showLabel = true }: Props) {
    const color = getTrustScoreColor(score);
    const level = getTrustLevel(score);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });
    const [displayScore, setDisplayScore] = useState(0);
    const [glowDone, setGlowDone] = useState(false);

    const dims = {
        sm: { box: 'w-10 h-10', text: 'text-xs', label: 'text-[0.55rem]', stroke: 6 },
        md: { box: 'w-14 h-14', text: 'text-base', label: 'text-[0.6rem]', stroke: 5 },
        lg: { box: 'w-20 h-20', text: 'text-xl', label: 'text-xs', stroke: 4 },
    };

    const { box, text, label, stroke } = dims[size];
    const circumference = 2 * Math.PI * 42;
    const targetOffset = circumference - (score / 100) * circumference;

    useEffect(() => {
        if (!inView || score === 0) return;
        const duration = 1000;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setGlowDone(true);
            }
        };
        requestAnimationFrame(tick);
    }, [inView, score]);

    return (
        <div ref={ref} className="flex flex-col items-center gap-1">
            <div className={`relative ${box} flex items-center justify-center ${glowDone ? 'trust-glow-pulse' : ''}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#1e3a5a"
                        strokeWidth={stroke}
                        fill="none"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={color}
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="butt"
                        strokeDasharray={circumference}
                        strokeDashoffset={inView ? targetOffset : circumference}
                        style={{
                            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    />
                </svg>
                <span
                    className={`font-mono font-medium z-10 ${text}`}
                    style={{ color }}
                >
                    {inView ? displayScore : 0}
                </span>
            </div>
            {showLabel && (
                <span
                    className={`font-mono uppercase tracking-[0.15em] ${label}`}
                    style={{ color }}
                >
                    {level}
                </span>
            )}
        </div>
    );
}
