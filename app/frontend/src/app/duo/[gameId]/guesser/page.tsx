'use client'

import { FastForward, Pause } from "react-feather"
import React from "react"
import { DuoGameRole, GameStatus } from "@henyo/shared"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { CountdownCircle } from "@/components/CountdownCircle"
import { TvStaticPlaceholder } from "@/components/TvStaticPlaceholder"
import { GameInstructions } from "@/components/GameInstructions"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { PauseOverlay } from "@/components/PauseOverlay"

type Props = {
    params: Promise<{ gameId: string }>
}

export default function GuesserPage({ params }: Props) {
    const { gameId } = React.use(params)

    const {
        myPlayer,
        guessWord,
        timeRemaining,
        passesRemaining,
        settings: { duration },
        status,
        changeGuessWord,
        pauseGame,
        resumeGame,
        backToLobby,
    } = useDuoGameState(gameId)

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
                onContinue={changeGuessWord}
                onBack={pauseGame}
                isContinueDisabled={passesRemaining <= 0}
                continueLabel={<FastForward size='28' strokeWidth='2.5' />}
                backLabel={<Pause size='28' strokeWidth='2.5' />}
            />
            {
                status === GameStatus.Paused && (
                    <PauseOverlay
                        onResume={resumeGame}
                        onExit={backToLobby}
                    />
                )
            }
        </PageLayout>
    )
}