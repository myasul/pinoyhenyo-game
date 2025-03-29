'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { formatTime } from "@/utils/utils"
import { useEffect } from "react"
import { SocketEvent } from "shared"

export default function GuesserPage() {
    const { setRemainingTime, myPlayer, emoji, remainingTime, handlers } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setRemainingTime)

        socket.on(SocketEvent.NotifyWordGuessUnsuccessful, () => {
            const handler = handlers[SocketEvent.NotifyWordGuessUnsuccessful]

            handler(GameStatus.Lose)
        })

        socket.on(SocketEvent.NotifyWordGuessSuccessful, () => {
            const handler = handlers[SocketEvent.NotifyWordGuessSuccessful]

            handler(GameStatus.Win)
        })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyWordGuessUnsuccessful)
            socket.off(SocketEvent.NotifyWordGuessSuccessful)
        }
    }, [socket])

    if (!myPlayer) return null

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">Guesser ({myPlayer.name})</h1>
            <h1 className="text-2xl font-bold">{emoji}</h1>
            <h1 className="text-2xl font-bold">{formatTime(remainingTime)}</h1>
            <Button className="bg-red-200 text-red-800 hover:bg-red:300" label="PASS!" />
        </div>
    )
}