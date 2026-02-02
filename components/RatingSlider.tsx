'use client';

import { useState } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export default function RatingSlider({ value, onChange, disabled = false }: Props) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="w-full space-y-3">
            <div className="flex justify-between items-center">
                <span className="label-terminal !text-[#4b6a8a]">Your Rating</span>
                <span className="font-mono text-xl font-medium text-[#00ffff]">
                    {value}
                </span>
            </div>

            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    disabled={disabled}
                    className={`
                        w-full h-[3px] appearance-none cursor-pointer
                        bg-[#1e3a5a]
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-[#00ffff]
                        [&::-webkit-slider-thumb]:border-0
                        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,212,255,0.4)]
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:duration-150
                        ${isDragging ? '[&::-webkit-slider-thumb]:scale-125' : '[&::-webkit-slider-thumb]:scale-100'}
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:bg-[#00ffff]
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:rounded-none
                    `}
                />
            </div>

            <div className="flex justify-between font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#2a4a6a]">
                <span>Untrustworthy</span>
                <span>Highly Trusted</span>
            </div>
        </div>
    );
}
