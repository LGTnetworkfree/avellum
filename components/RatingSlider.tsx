'use client';

import { useState } from 'react';

interface Props {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

export default function RatingSlider({ value, onChange, disabled = false }: Props) {
    const [isDragging, setIsDragging] = useState(false);

    const getSliderColor = (val: number) => {
        if (val >= 80) return 'from-green-500 to-emerald-400';
        if (val >= 60) return 'from-lime-500 to-green-400';
        if (val >= 40) return 'from-yellow-500 to-amber-400';
        if (val >= 20) return 'from-orange-500 to-amber-500';
        return 'from-red-500 to-orange-400';
    };

    return (
        <div className="w-full space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Your Rating</span>
                <span className={`text-2xl font-bold bg-gradient-to-r ${getSliderColor(value)} bg-clip-text text-transparent`}>
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
            w-full h-3 rounded-full appearance-none cursor-pointer
            bg-gradient-to-r from-red-500 via-yellow-500 to-green-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-black/30
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-gray-200
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            ${isDragging ? '[&::-webkit-slider-thumb]:scale-125' : '[&::-webkit-slider-thumb]:scale-100'}
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-gray-200
          `}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
                <span>Untrustworthy</span>
                <span>Highly Trusted</span>
            </div>
        </div>
    );
}
