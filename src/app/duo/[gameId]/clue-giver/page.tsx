'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { formatTime } from "@/utils/utils"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClueGiverPage() {
    const { myPlayer, setRemainingTime, remainingTime, wordToGuess, handlers } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setRemainingTime)
        socket.on(SocketEvent.NotifyWordGuessUnsuccessful, () => {
            const handler = handlers[SocketEvent.NotifyWordGuessUnsuccessful]

            handler(GameStatus.Lose)
        })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyWordGuessUnsuccessful)
        }
    }, [socket])

    if (!myPlayer) return null

    return (
        <div className="p-6 justify-center flex flex-col items-center gap-5">
            <h1 className="text-2xl font-bold">Clue Giver ({myPlayer.name})</h1>
            <h2 className="text-xl font-bold">{formatTime(remainingTime)}</h2>
            <h2 className="text-xl font-bold">{wordToGuess}</h2>
            <Button variant="primary" label="CORRECT!" onClick={handlers[SocketEvent.RequestWordGuessSuccessful]} />
        </div>
    )
}