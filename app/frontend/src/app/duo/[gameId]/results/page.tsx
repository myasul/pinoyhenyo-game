'use client'

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"
import { SocketEvent } from "shared"
import { WaveButton } from "@/components/WaveButton"
import { Repeat, X } from "react-feather"
import { useDuoGameSession } from "@/hooks/useDuoGameSession"
import { PageLayout } from "@/components/PageLayout"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Lose]: 'SAYANG! TRY AGAIN HENYO!',
    [GameStatus.Win]: 'YOU ARE HENYO!',
}

type Props = {
    params: Promise<{ gameId: string }>
}

export default function ResultsPage({ params }: Props) {
    const { gameId } = React.use(params)

    const { leaveGame } = useDuoGameSession(gameId)
    const searchParams = useSearchParams()
    const { handlers, guessWord, timeRemaining, duration, passedWords } = useDuoGameState(gameId)
    const { socket } = useSocket()

    const status = searchParams.get('status') as GameStatus

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])
        socket.on(SocketEvent.NotifyBackToLobby, handlers[SocketEvent.NotifyBackToLobby])

        return (() => {
            socket.off(SocketEvent.NotifyGameStarted)
            socket.off(SocketEvent.NotifyRoleSwitched)
            socket.off(SocketEvent.NotifyBackToLobby)
        })
    }, [socket, handlers])

    return (
        <PageLayout>
            <header>
                <h1 className="text-4xl font-bold break-words text-center">{GameResultText[status as GameStatus]}</h1>
            </header>
            <section className="flex flex-col items-center gap-4 w-full h-full">
                <div className="text-4xl">&quot;{guessWord}&quot;</div>
                <div>
                    {status === GameStatus.Lose ? "⏰ Time ran out!" : `⏰ Guessed in ${duration - timeRemaining} seconds!`}
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
            <footer className="flex w-full gap-2">
                <WaveButton
                    bgColor='bg-gray-300'
                    textColor='text-gray-600'
                    className='w-1/4'
                    onClick={leaveGame}
                >
                    <X size='28' strokeWidth='2.5' />
                </WaveButton>
                <WaveButton onClick={handlers[SocketEvent.RequestStartGame]} className="w-full">
                    <Repeat size='28' strokeWidth='2.5' />
                </WaveButton>
            </footer>
        </PageLayout>
    )
}
