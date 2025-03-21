'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Win]: 'YOU ARE HENYO!',
    [GameStatus.Lose]: 'TIME\'S UP!',
}

export default function ResultsPage() {
    const searchParams = useSearchParams()
    const { handlers } = useDuoGameState()
    const socket = useSocket()

    const status = searchParams.get('status') as GameStatus

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])

        return (() => {
            socket.off(SocketEvent.NotifyGameStarted)
        })
    }, [socket, handlers])

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">{GameResultText[status as GameStatus]}</h1>
            <div className="grid gap-4 mt-10">
                <Button label='Play Again' onClick={handlers[SocketEvent.RequestStartGame]} variant='primary' />
            </div>
        </div>
    )
}
