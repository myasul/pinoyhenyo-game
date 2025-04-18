import React, { useState, PropsWithChildren } from 'react';

type WaveButtonProps = {
    bgColor?: string
    textColor?: string
    onClick?: () => void
    disabled?: boolean
} & PropsWithChildren

export const WaveButton = ({ children, bgColor = 'bg-yellow-400', textColor = 'text-white', disabled, onClick }: WaveButtonProps) => {
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
            className={`relative overflow-hidden px-6 py-3 rounded-md ${bgColor} ${textColor} focus:outline-none w-full flex items-center justify-center`}
        >
            {isAnimating && (
                <span className="absolute inset-0 bg-current animate-wave z-0" />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
};
