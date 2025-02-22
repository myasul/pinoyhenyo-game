'use client'

import { Button } from "@/components/Button"
import { Player, useDuoGameStore } from "@/stores/duoGameStore"

import { GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { formatTime } from "@/utils/utils"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type GuesserPageParams = { gameId: string }

export default function GuesserPage() {
    const router = useRouter()
    const { gameId } = useParams<GuesserPageParams>()
    const {
        players,
        emoji,
        timeRemaining,
        setGameId,
        setTimeRemaining,
        setState
    } = useDuoGameStore()
    const socket = useSocket()

    const [myPlayer, setMyPlayer] = useState<Player>()

    // TODO: Create a hook to encapsulate setting game id and player
    // Maybe useDuoGame?
    useEffect(() => {
        if (!(gameId && socket)) return

        const thisPlayer = players.find(player => player.id === socket.id)

        if (!thisPlayer) {
            console.error('Player not found')
            router.push('/')

            return
        }

        setMyPlayer(thisPlayer)
        setGameId(gameId)
    }, [gameId, socket])

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.UpdateTimeLimit, setTimeRemaining)
        socket.on(SocketEvent.TimeLimitReached, () => { setState(GameStatus.Lose) })

        return () => {
            socket.off(SocketEvent.UpdateTimeLimit)
            socket.off(SocketEvent.TimeLimitReached)
        }
    }, [socket])

    if (!myPlayer) return null

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">Guesser ({myPlayer.name})</h1>
            <h1 className="text-2xl font-bold">{emoji}</h1>
            <h1 className="text-2xl font-bold">{formatTime(timeRemaining)}</h1>
            <Button className="bg-red-200 text-red-800 hover:bg-red:300" label="PASS!" />
        </div>
    )
}