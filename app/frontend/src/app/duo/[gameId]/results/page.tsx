'use client'

import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { SocketEvent } from "shared"
import { WaveButton } from "@/components/WaveButton"
import { Repeat, X } from "react-feather"
import { useRouter } from "next/navigation"

const GameResultText: Partial<Record<GameStatus, string>> = {
    [GameStatus.Lose]: 'SAYANG! TRY AGAIN HENYO!',
    [GameStatus.Win]: 'YOU ARE HENYO!',
}

export default function ResultsPage() {
    const searchParams = useSearchParams()
    const { handlers, guessWord, timeRemaining, duration, passedWords } = useDuoGameState()
    const socket = useSocket()
    const router = useRouter()

    const status = searchParams.get('status') as GameStatus

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])
        socket.on(SocketEvent.NotifyRoleSwitched, handlers[SocketEvent.NotifyRoleSwitched])
        socket.on(SocketEvent.NotifyBackToLobby, handlers[SocketEvent.NotifyBackToLobby])

        return (() => {
            socket.off(SocketEvent.NotifyGameStarted)
            socket.off(SocketEvent.NotifyRoleSwitched)
            socket.off(SocketEvent.NotifyBackToLobby)
        })
    }, [socket, handlers])

    const handleBackClick = () => {
        router.push('/')
    }

    return (
        <main className="p-6 justify-between flex flex-col items-center gap-5 h-full">
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
                <WaveButton bgColor='bg-gray-300' className='w-1/6' textColor='text-gray-600' onClick={handleBackClick}>
                    <X size='28' strokeWidth='2.5' />
                </WaveButton>
                <WaveButton onClick={handlers[SocketEvent.RequestStartGame]} >
                    <Repeat size='28' strokeWidth='2.5' />
                </WaveButton>
            </footer>
        </main>
    )
}
