'use client'

import { FastForward, Pause } from "react-feather"
import React, { useEffect } from "react"
import { DuoGameRole, SocketEvent } from "shared"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { CountdownCircle } from "@/components/CountdownCircle"
import { TvStaticPlaceholder } from "@/components/TvStaticPlaceholder"
import { GameInstructions } from "@/components/GameInstructions"
import { useDuoGameSession } from "@/hooks/useDuoGameSession"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"

type Props = {
    params: Promise<{ gameId: string }>
}

export default function GuesserPage({ params }: Props) {
    const { gameId } = React.use(params)

    const {
        setTimeRemaining,
        myPlayer,
        guessWord,
        timeRemaining,
        handlers,
        passesRemaining,
        settings: { duration }
    } = useDuoGameState(gameId)
    useDuoGameSession(gameId)

    const { socket } = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setTimeRemaining)
        socket.on(SocketEvent.NotifyGuessWordChanged, handlers[SocketEvent.NotifyGuessWordChanged])

        socket.on(SocketEvent.NotifyWordGuessFailed, ({ passedWords }: { passedWords: string[] }) => {
            const handler = handlers[SocketEvent.NotifyWordGuessFailed]

            handler({ gameStatus: GameStatus.Lose, passedWords })
        })

        socket.on(SocketEvent.NotifyWordGuessSuccessful, ({ passedWords }: { passedWords: string[] }) => {
            const handler = handlers[SocketEvent.NotifyWordGuessFailed]

            handler({ gameStatus: GameStatus.Win, passedWords })
        })

        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyWordGuessFailed)
            socket.off(SocketEvent.NotifyWordGuessSuccessful)
            socket.off(SocketEvent.NotifyGuessWordChanged)
        }
    }, [socket, handlers, setTimeRemaining])

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
                onContinue={handlers[SocketEvent.RequestChangeGuessWord]}
                isBackDisabled={false}
                isContinueDisabled={passesRemaining <= 0}
                continueLabel={<FastForward size='28' strokeWidth='2.5' />}
                cancelLabel={<Pause size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    )
}