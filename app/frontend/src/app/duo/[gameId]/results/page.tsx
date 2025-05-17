'use client'

import React from "react"
import { Repeat } from "react-feather"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { DuoGamePlayerSessionStatus } from "@/utils/constants"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { LoadingIcon } from "@/components/LoadingIcon"
import { ResultsNotebook } from "./components/ResultsNotebook"
import { GameStatus } from "@henyo/shared"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Lose]: 'YOU GUYS LOST 😔',
    [GameStatus.Win]: 'YOU ARE HENYO!',
}

type Props = {
    params: Promise<{ gameId: string }>
}

export default function ResultsPage({ params }: Props) {
    const { gameId } = React.use(params)
    const {
        gameClient,
        guessWord,
        timeRemaining,
        settings,
        passedWords,
        myPlayerStatus,
        status
    } = useDuoGameState(gameId)

    if (myPlayerStatus === DuoGamePlayerSessionStatus.Syncing) {
        return (
            <PageLayout className="justify-center">
                <LoadingIcon />
            </PageLayout>
        )
    }

    return (
        <PageLayout>
            <ResultsNotebook
                title={GameResultText[status as GameStatus] ?? ''}
                mainWord={guessWord ?? ''}
                resultMessage={status === GameStatus.Lose ? "⏰ Time ran out!" : `⏰ Guessed in ${settings.duration - timeRemaining} seconds!`}
                passedWords={passedWords}
                subtext={status === GameStatus.Win ? "🎉 Congratulations!" : "😅 Better luck next time!"}
            />
            <Footer
                onBack={() => gameClient.requestBackToLobby()}
                onContinue={() => gameClient.requestStartGame(settings)}
                isContinueDisabled={false}
                continueLabel={<Repeat size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    )
}
