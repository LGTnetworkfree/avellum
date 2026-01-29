'use client';

import { getTrustScoreColor, getTrustLevel } from '@/lib/trust-score';

interface Props {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function TrustBadge({ score, size = 'md', showLabel = true }: Props) {
    const color = getTrustScoreColor(score);
    const level = getTrustLevel(score);

    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-14 h-14 text-lg',
        lg: 'w-20 h-20 text-2xl'
    };

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
                {/* Background circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: 'stroke-dashoffset 0.5s ease-out',
                            filter: `drop-shadow(0 0 6px ${color})`
                        }}
                    />
                </svg>
                {/* Score number */}
                <span
                    className="font-bold z-10"
                    style={{ color }}
                >
                    {Math.round(score)}
                </span>
            </div>
            {showLabel && (
                <span
                    className="text-xs font-medium"
                    style={{ color }}
                >
                    {level}
                </span>
            )}
        </div>
    );
}
