'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { SocketEvent } from "shared"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Lose]: 'TIME\'S UP!',
    [GameStatus.Win]: 'YOU ARE HENYO!',
}

export default function ResultsPage() {
    const searchParams = useSearchParams()
    const { handlers } = useDuoGameState()
    const socket = useSocket()

    const status = searchParams.get('status') as GameStatus

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])
        socket.on(SocketEvent.NotifyRoleSwitched, handlers[SocketEvent.NotifyRoleSwitched])
        socket.on(SocketEvent.NotifyBackToLobby, handlers[SocketEvent.NotifyBackToLobby])

        return (() => {
            socket.off(SocketEvent.NotifyGameStarted)
            socket.off(SocketEvent.NotifyRoleSwitched)
            socket.off(SocketEvent.NotifyBackToLobby)
        })
    }, [socket, handlers])

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">{GameResultText[status as GameStatus]}</h1>
            <div className="grid gap-4 mt-10">
                <Button
                    label='Play Again'
                    onClick={handlers[SocketEvent.RequestStartGame]}
                    variant='primary'
                />
                <Button
                    label='Switch Roles'
                    overrideTWStyle='bg-purple-200 text-purple-800 hover:bg-purple:300'
                    onClick={handlers[SocketEvent.RequestSwitchRole]}
                />
                <Button
                    label='Back to Lobby'
                    overrideTWStyle='bg-blue-200 text-blue-800 hover:bg-blue:300'
                    onClick={handlers[SocketEvent.RequestBackToLobby]}
                />
            </div>
        </div>
    )
}
