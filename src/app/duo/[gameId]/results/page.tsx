'use client'

import { GameStatus } from "@/utils/constants"
import { useSearchParams } from "next/navigation"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Win]: 'YOU ARE HENYO!',
    [GameStatus.Lose]: 'TIME\'S UP!',
}

export default function ResultsPage() {
    const searchParams = useSearchParams()

    const status = searchParams.get('status') as GameStatus

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">{GameResultText[status as GameStatus]}</h1>
        </div>
    )
}
