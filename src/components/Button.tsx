type ButtonProps = {
    label: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
    overrideTWStyle?: string
    disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant, overrideTWStyle, disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-xl font-semibold shadow-lg"
    const variantStyle =
        variant === 'primary'
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray:300"

    return (
        <button className={`${baseStyle} ${overrideTWStyle ?? variantStyle} `} disabled={disabled} onClick={onClick}>
            {label}
        </button >
    )
}