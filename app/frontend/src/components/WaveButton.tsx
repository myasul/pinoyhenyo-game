import React, { useState, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type WaveButtonProps = {
    bgColor?: string
    textColor?: string
    onClick?: () => void
    disabled?: boolean
    className?: string
} & PropsWithChildren

export const WaveButton = ({
    children,
    bgColor = 'bg-fil-deepYellow',
    textColor = 'text-fil-deepBlue',
    disabled,
    onClick,
    className
}: WaveButtonProps) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600); // Match animation duration

        if (onClick) onClick();
    };

    const baseStyle = 'shadow-md relative overflow-hidden px-6 py-3 rounded-md focus:outline-none flex items-center justify-center text-2xl font-extrabold'
    const finalStyle = twMerge(baseStyle, textColor, bgColor, disabled ? 'opacity-50' : '', className);

    return (
        <button
            disabled={disabled}
            onClick={handleClick}
            className={finalStyle}
        >
            {isAnimating && (
                <span className="absolute inset-0 bg-current animate-wave z-0" />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
};
