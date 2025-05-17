'use client'

import { FastForward, Pause } from "react-feather"
import React, { useEffect, useState } from "react"
import { DuoGameRole, SocketEvent } from "@henyo/shared"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { useSocket } from "@/hooks/useSocket"
import { CountdownCircle } from "@/components/CountdownCircle"
import { TvStaticPlaceholder } from "@/components/TvStaticPlaceholder"
import { GameInstructions } from "@/components/GameInstructions"
import { useDuoGamePlayerSession } from "@/hooks/useDuoGamePlayerSession"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { PauseOverlay } from "@/components/PauseOverlay"

type Props = {
    params: Promise<{ gameId: string }>
}

export default function GuesserPage({ params }: Props) {
    const { gameId } = React.use(params)
    const [isPaused, setIsPaused] = useState(false)

    const {
        setTimeRemaining,
        myPlayer,
        guessWord,
        timeRemaining,
        passesRemaining,
        settings: { duration },
        gameClient
    } = useDuoGameState(gameId)
    useDuoGamePlayerSession(gameId)

    const { socket } = useSocket()

    useEffect(() => {
        if (!socket) return

        // TODO: Move to DuoGameClient
        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setTimeRemaining)
        // Pausing the game should be handled in the duoGameStore
        socket.on(SocketEvent.NotifyGamePaused, () => { setIsPaused(true) })
        socket.on(SocketEvent.NotifyGameResumed, () => { setIsPaused(false) })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyGamePaused)
            socket.off(SocketEvent.NotifyGameResumed)
        }
    }, [socket, setTimeRemaining])

    const handlePauseGame = () => {
        setIsPaused(true)
        gameClient.requestPauseGame()
    }

    const handleResumeGame = () => {
        setIsPaused(false)
        gameClient.requestResumeGame()
    }

    if (!myPlayer) return null

    return (
        <PageLayout>
            <header className="flex items-center justify-between w-full h-16">
                <CountdownCircle duration={duration} timeRemaining={timeRemaining} />
                <span className="text-3xl font-extrabold text-red-500">{passesRemaining}</span>
            </header>
            <section className="flex flex-col items-center gap-4 w-full h-full">
                <GameInstructions role={DuoGameRole.Guesser} />
                <div className="h-full pt-10">
                    <TvStaticPlaceholder word={guessWord ?? ''} />
                </div>
            </section>
            <Footer
                onContinue={() => gameClient.requestChangeGuessWord()}
                onBack={handlePauseGame}
                isContinueDisabled={passesRemaining <= 0}
                continueLabel={<FastForward size='28' strokeWidth='2.5' />}
                backLabel={<Pause size='28' strokeWidth='2.5' />}
            />
            {
                isPaused && (
                    <PauseOverlay
                        onResume={handleResumeGame}
                        onExit={() => gameClient.requestBackToLobby()}
                    />
                )
            }
        </PageLayout>
    )
}