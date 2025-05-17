'use client'

import React from "react"
import { DuoGameRole, GameStatus } from "@henyo/shared"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { Check, Pause } from "react-feather"
import { CountdownCircle } from "@/components/CountdownCircle"
import { GameInstructions } from "@/components/GameInstructions"
import { useDuoGamePlayerSession } from "@/hooks/useDuoGamePlayerSession"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { PauseOverlay } from "@/components/PauseOverlay"

type Props = {
    params: Promise<{ gameId: string }>
}

export default function ClueGiverPage({ params }: Props) {
    const { gameId } = React.use(params)

    const {
        gameClient,
        myPlayer,
        timeRemaining,
        guessWord,
        passesRemaining,
        settings: { duration },
        status
    } = useDuoGameState(gameId)
    useDuoGamePlayerSession(gameId)

    if (!myPlayer) return null

    return (
        <PageLayout>
            <header className="flex items-center justify-between w-full h-16">
                <CountdownCircle duration={duration} timeRemaining={timeRemaining} />
                <span className="text-3xl font-extrabold text-red-500">{passesRemaining}</span>
            </header>
            <section className="flex flex-col items-center gap-4 w-full h-full">
                <GameInstructions role={DuoGameRole.ClueGiver} />
                <div className="h-full pt-10 text-6xl mx-6 break-auto text-center text-fil-deepBlue">
                    {guessWord}
                </div>
            </section>
            <Footer
                onContinue={() => gameClient.requestWordGuessSuccessful()}
                onBack={() => gameClient.requestPauseGame()}
                continueLabel={<Check size='28' strokeWidth='2.5' />}
                backLabel={<Pause size='28' strokeWidth='2.5' />}
            />
            {
                status === GameStatus.Paused && (
                    <PauseOverlay
                        onResume={() => gameClient.requestResumeGame()}
                        onExit={() => gameClient.requestBackToLobby()}
                    />
                )
            }
        </PageLayout>
    )
}
