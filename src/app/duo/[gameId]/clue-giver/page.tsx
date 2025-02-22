'use client'

import { Button } from "@/components/Button"
import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { formatTime } from "@/utils/utils"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

type ClueGiverPageParams = { gameId: string }

export default function ClueGiverPage() {
    const { gameId } = useParams<ClueGiverPageParams>()
    const { setGameId, players, timeRemaining, setTimeRemaining, setState, wordToGuess } = useDuoGameStore()
    const socket = useSocket()

    const [myPlayer, setMyPlayer] = useState<Player>()

    useEffect(() => {
        if (!(gameId && socket)) return

        const thisPlayer = players.find(player => player.id === socket.id)

        if (!thisPlayer) return

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
            <h1 className="text-2xl font-bold">Clue Giver ({myPlayer.name})</h1>
            <h2 className="text-xl font-bold">{formatTime(timeRemaining)}</h2>
            <h2 className="text-xl font-bold">{wordToGuess}</h2>
            <Button variant="primary" label="CORRECT!" />
        </div>
    )
}