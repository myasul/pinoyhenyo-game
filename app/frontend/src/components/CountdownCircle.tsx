'use client';

import { useEffect } from 'react';

type CountdownCircleProps = {
    duration: number;
    timeRemaining: number;
    onComplete?: () => void;
};

export function CountdownCircle({ duration, timeRemaining, onComplete }: CountdownCircleProps) {
    const radius = 33;
    const stroke = 3;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;

    useEffect(() => {
        if (!onComplete || timeRemaining > 0) return;

        onComplete();
    }, [timeRemaining, onComplete]);

    const progress = timeRemaining / duration;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="h-32 flex items-center justify-center relative">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform rotate-90 scale-x-[-1]"
            >
                {/* Base: full gray ring */}
                <circle
                    stroke="#E5E7EB" // gray-200
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Overlay: shrinking red ring */}
                <circle
                    stroke="#EF4444" // red-500
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
            </svg>

            {/* Timer display */}
            <span
                className={
                    `absolute text-xl font-semibold ${timeRemaining <= 10 ? 'text-fil-deepRed' : 'text-fil-darkText'}`
                }
            >
                {timeRemaining}s
            </span>
        </div >
    );
}
