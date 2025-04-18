'use client'

import { Button } from "@/components/Button"
import { useDuoGameState } from "@/hooks/useDuoGameState"
import { GameStatus } from "@/utils/constants"
import { useSocket } from "@/hooks/useSocket"
import { useEffect } from "react"
import { SocketEvent } from "shared"
import { CountdownCircle } from "@/components/CountdownCircle"
import { FastForward, Pause } from "react-feather"

export default function GuesserPage() {
    const { setTimeRemaining, myPlayer, emoji, timeRemaining, handlers, duration, passesRemaining } = useDuoGameState()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyRemainingTimeUpdated, setTimeRemaining)
        socket.on(SocketEvent.NotifyGuessWordChanged, handlers[SocketEvent.NotifyGuessWordChanged])

        socket.on(SocketEvent.NotifyWordGuessUnsuccessful, () => {
            const handler = handlers[SocketEvent.NotifyWordGuessUnsuccessful]

            handler(GameStatus.Lose)
        })

        socket.on(SocketEvent.NotifyWordGuessSuccessful, () => {
            const handler = handlers[SocketEvent.NotifyWordGuessSuccessful]

            handler(GameStatus.Win)
        })


        return () => {
            socket.off(SocketEvent.NotifyRemainingTimeUpdated)
            socket.off(SocketEvent.NotifyWordGuessUnsuccessful)
            socket.off(SocketEvent.NotifyWordGuessSuccessful)
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
            <section className="flex flex-col items-center justify-between gap-4 w-full h-full">
                <div className="border-gray-300 border rounded-md p-2 w-full bg-gray-100">
                    Ask a yes-or-no questions to figure out the word. Start by narrowing down the category (person, place, object, nature, food, action). Then keep guessing!!
                </div>
                <h1 className="text-2xl font-bold flex-1">{emoji}</h1>
            </section>
            <footer className="flex w-full">
                <Button label={<FastForward size='28' strokeWidth='2.5' />} className='w-full bg-red-200 text-red-800 hover:bg-red:300' onClick={handlers[SocketEvent.RequestChangeGuessWord]} />
            </footer>
        </main>
    )
}