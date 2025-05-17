'use client'

import { useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "./useSocket"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { DuoGameClient } from "@/services/DuoGameClient"

export const useDuoGameState = (gameId: string) => {
    const router = useRouter()
    const { socket } = useSocket()
    const store = useDuoGameStore()

    const gameClient = useMemo(
        () => new DuoGameClient(gameId, socket, store, router),
        [gameId, socket, store, router]
    )

    useEffect(() => {
        gameClient.addNotificationEventListeners()

        return () => {
            gameClient.removeNotificationEventHandlers()
        }
    }, [gameClient])


    return { gameClient, ...store }
}
