import React, { useState, PropsWithChildren } from 'react';

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

    return (
        <button
            disabled={disabled}
            onClick={handleClick}
            className={
                `shadow-md relative overflow-hidden px-6 py-3 rounded-md focus:outline-none flex items-center justify-center text-2xl font-extrabold ${textColor} ${bgColor} ${className} ${disabled ? 'opacity-50' : ''}`
            }
        >
            {isAnimating && (
                <span className="absolute inset-0 bg-current animate-wave z-0" />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
};
