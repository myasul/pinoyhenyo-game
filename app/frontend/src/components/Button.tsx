import { ReactNode } from "react"

type ButtonProps = {
    label: string | ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary'
    overrideTWStyle?: string
    disabled?: boolean
    className?: string
}

export const Button: React.FC<ButtonProps> = ({ className, label, onClick, variant, overrideTWStyle, disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-xl font-bold shadow-lg flex items-center justify-center"
    const variantStyle =
        variant === 'primary'
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray:600"

    const disabledStyle = "opacity-50 cursor-not-allowed"

    return (
        <button
            className={`${baseStyle} ${overrideTWStyle ?? variantStyle} ${disabled ? disabledStyle : ""} ${className}`}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </button >
    )
}
