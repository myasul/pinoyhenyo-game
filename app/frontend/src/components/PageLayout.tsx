import { twMerge } from "tailwind-merge"

export const PageLayout = ({ className, children }: { children: React.ReactNode, className?: string }) => {
    const baseStyle = 'p-6 flex flex-col justify-between h-full w-full items-center bg-fil-yellow text-fil-darkText gap-5'
    const finalStyle = twMerge(baseStyle, className)

    return (
        <main className={finalStyle}>
            {children}
        </main>
    )
}