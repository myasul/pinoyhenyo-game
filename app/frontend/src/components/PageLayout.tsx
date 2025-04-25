export const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="p-6 flex flex-col justify-between h-full w-full items-center bg-fil-yellow text-fil-darkText gap-5">
            {children}
        </main>
    )
}