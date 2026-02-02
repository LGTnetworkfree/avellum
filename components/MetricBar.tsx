'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming utilities from shadcn installation or manual creation

interface MetricBarProps {
    label: string;
    subLabel: string;
    value: string;
    percentage: number;
    status: string;
    statusColor?: string;
    delay?: number;
}

export default function MetricBar({
    label,
    subLabel,
    value,
    percentage,
    status,
    statusColor = 'text-[#4b6a8a]',
    delay = 0
}: MetricBarProps) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(percentage);
        }, 500 + delay);
        return () => clearTimeout(timer);
    }, [percentage, delay]);

    return (
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr] md:grid-cols-[2fr_1fr_1fr] border-b border-[#1e3a5a] text-xs md:text-sm">
            <div className="p-3 border-r border-[#1e3a5a] border-t border-[#1e3a5a]">
                <span className="uppercase font-bold tracking-tight block">{label}</span>
                <span className="text-[#4b6a8a] text-[0.6rem] uppercase tracking-wider">{subLabel}</span>
            </div>

            <div className="p-3 border-r border-[#1e3a5a] border-t border-[#1e3a5a] flex flex-col justify-center">
                <div className="font-sans font-medium mb-1">{value}</div>
                <div className="w-full h-2 bg-[#142a44] border border-[#1e3a5a]">
                    <div
                        className="h-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ width: `${width}%` }}
                    />
                </div>
            </div>

            <div className={cn("p-3 border-t border-[#1e3a5a] flex items-center font-bold tracking-wider uppercase", statusColor)}>
                {status}
            </div>
        </div>
    );
}
