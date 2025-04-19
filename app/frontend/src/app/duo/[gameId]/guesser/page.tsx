'use client'
import { FastForward, Pause } from "react-feather"
import { useEffect } from "react"
import { DuoGameRole, SocketEvent } from "shared"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { CountdownCircle } from "@/components/CountdownCircle"
import { TvStaticPlaceholder } from "@/components/TvStaticPlaceholder"
import { WaveButton } from "@/components/WaveButton"
import { GameInstructions } from "@/components/GameInstructions"

export default function GuesserPage() {
    const { setTimeRemaining, myPlayer, guessWord, timeRemaining, handlers, duration, passesRemaining } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setTimeRemaining)
        socket.on(SocketEvent.NotifyGuessWordChanged, handlers[SocketEvent.NotifyGuessWordChanged])

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
            socket.off(SocketEvent.NotifyGuessWordChanged)
        }
    }, [socket, handlers, setTimeRemaining])

    if (!myPlayer) return null

    return (
        <main className="p-6 justify-between flex flex-col items-center gap-5 h-full">
            <header className="flex items-center justify-between w-full h-16">
                <Pause strokeWidth='2.5' />
                <CountdownCircle duration={duration} timeRemaining={timeRemaining} />
                <span className="text-3xl font-extrabold text-red-500">{passesRemaining}</span>
            </header>
            <section className="flex flex-col items-center gap-4 w-full h-full">
                <GameInstructions role={DuoGameRole.Guesser} />
                <div className="h-full pt-10">
                    <TvStaticPlaceholder word={guessWord} />
                </div>
            </section>
            <footer className="flex w-full">
                <WaveButton onClick={handlers[SocketEvent.RequestChangeGuessWord]} disabled={passesRemaining <= 0}>
                    <FastForward size='28' strokeWidth='2.5' />
                </WaveButton>
            </footer>
        </main>
    )
}