'use client'

import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"
import { SocketEvent } from "@henyo/shared"
import { Repeat } from "react-feather"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { DuoGamePlayerSessionStatus, GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { LoadingIcon } from "@/components/LoadingIcon"
import { ResultsNotebook } from "./components/ResultsNotebook"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Lose]: 'YOU GUYS LOST 😔',
    [GameStatus.Win]: 'YOU ARE HENYO!',
}

type Props = {
    params: Promise<{ gameId: string }>
}

// TODO: Wrap the results information in a card that looks like a notebook
export default function ResultsPage({ params }: Props) {
    const { gameId } = React.use(params)

    const searchParams = useSearchParams()
    const { handlers, guessWord, timeRemaining, settings, passedWords, myPlayerStatus } = useDuoGameState(gameId)
    const { socket } = useSocket()

    const status = searchParams.get('status') as GameStatus

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])
        socket.on(SocketEvent.NotifyBackToLobby, handlers[SocketEvent.NotifyBackToLobby])

        return (() => {
            socket.off(SocketEvent.NotifyGameStarted)
            socket.off(SocketEvent.NotifyBackToLobby)
        })
    }, [socket, handlers])

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
                onBack={handlers[SocketEvent.RequestBackToLobby]}
                onContinue={() => handlers[SocketEvent.RequestStartGame](settings)}
                isContinueDisabled={false}
                continueLabel={<Repeat size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    )
}
