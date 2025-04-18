'use client'

import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { useEffect } from "react"
import { DuoGameRole, SocketEvent } from "shared"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { Check, Pause } from "react-feather"
import { CountdownCircle } from "@/components/CountdownCircle"
import { GameInstructions } from "@/components/GameInstructions"
import { WaveButton } from "@/components/WaveButton"

export default function ClueGiverPage() {
    const {
        myPlayer,
        setTimeRemaining,
        timeRemaining,
        guessWord,
        handlers,
        duration,
        passesRemaining
    } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGuessWordChanged, handlers[SocketEvent.NotifyGuessWordChanged])
        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setTimeRemaining)
        socket.on(SocketEvent.NotifyWordGuessUnsuccessful, ({ passedWords }: { passedWords: string[] }) => {
            const handler = handlers[SocketEvent.NotifyWordGuessUnsuccessful]

            handler({ gameStatus: GameStatus.Lose, passedWords })
        })

        socket.on(SocketEvent.NotifyWordGuessSuccessful, ({ passedWords }: { passedWords: string[] }) => {
            const handler = handlers[SocketEvent.NotifyWordGuessSuccessful]

            handler({ gameStatus: GameStatus.Win, passedWords })
        })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyWordGuessUnsuccessful)
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
                <GameInstructions role={DuoGameRole.ClueGiver} />
                <div className="h-full pt-10 text-6xl mx-6 break-auto text-center">
                    {guessWord}
                </div>
            </section>
            <footer className="flex w-full">
                <WaveButton onClick={handlers[SocketEvent.RequestWordGuessSuccessful]}  >
                    <Check size='28' strokeWidth='2.5' />
                </WaveButton>
            </footer>
        </main>
    )
}
