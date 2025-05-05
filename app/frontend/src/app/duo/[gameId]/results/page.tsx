'use client'

import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { SocketEvent } from "shared"
import { Repeat } from "react-feather"

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { DuoGamePlayerSessionStatus, GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { PageLayout } from "@/components/PageLayout"
import { Footer } from "@/components/Footer"
import { LoadingIcon } from "@/components/LoadingIcon"

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
    const [isLoading, setIsLoading] = useState(false)

    const status = searchParams.get('status') as GameStatus

    console.log('ResultsPage', { myPlayerStatus })

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
            <header className="text-4xl font-bold break-normal text-center text-fil-deepBlue">
                {GameResultText[status as GameStatus]}
            </header>
            <section className="flex flex-col items-center gap-4 w-full h-full">
                <div className="text-4xl">&quot;{guessWord}&quot;</div>
                <div>
                    {status === GameStatus.Lose ? "⏰ Time ran out!" : `⏰ Guessed in ${settings.duration - timeRemaining} seconds!`}
                </div>
                <div>
                    {
                        passedWords.map((word, index) => (
                            <div key={index} className="text-2xl">
                                ❌ {word}
                            </div>
                        ))
                    }
                </div>
            </section>
            <Footer
                onBack={handlers[SocketEvent.RequestBackToLobby]}
                onContinue={() => handlers[SocketEvent.RequestStartGame](settings)}
                isContinueDisabled={false}
                continueLabel={<Repeat size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    )
}
