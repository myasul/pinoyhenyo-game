'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"

import { SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { formatTime } from "@/utils/utils"
import { useEffect } from "react"

export default function GuesserPage() {
    const { setRemainingTime, myPlayer, emoji, remainingTime } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setRemainingTime)
        // socket.on(SocketEvent.TimeLimitReached, () => { setState(GameStatus.Lose) })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
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