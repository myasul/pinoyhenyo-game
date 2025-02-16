'use client'

import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "@/utils/socket"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

type GuesserPageParams = { gameId: string }

export default function GuesserPage() {
    const { gameId } = useParams<GuesserPageParams>()
    const { setGameId, players } = useDuoGameStore()
    const socket = useSocket()

    const [myPlayer, setMyPlayer] = useState<Player>()

    useEffect(() => {
        if (!(gameId && socket)) return

        const thisPlayer = players.find(player => player.id === socket.id)

        if (!thisPlayer) return

        setMyPlayer(thisPlayer)
        setGameId(gameId)
    }, [gameId, socket])

    if (!myPlayer) return null

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Guesser ({myPlayer.name})</h1>
        </div>
    )
}