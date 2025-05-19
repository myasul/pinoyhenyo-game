'use client'

import { useDuoGameStore } from "@/stores/duoGameStore"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { SocketManager } from "@/services/SocketManager"
import { DuoGameManager } from "@/services/DuoGameManager"
import { useEvent } from "./useEvent"
import { GameSettings, Player } from "@henyo/shared"

export const useDuoGame = (gameId: string) => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useDuoGameStore()
    const socketManager = SocketManager.getInstance()

    const getStore = useEvent(() => store)

    const gameManager = useMemo(
        () => new DuoGameManager(gameId, socketManager, router, getStore),
        [gameId, socketManager, router, getStore]
    )

    useEffect(() => {
        gameManager.setup()

        return () => { gameManager.cleanup() }
    }, [gameManager])


    useEffect(() => {
        const isInADuoPage = pathname.includes('duo')

        if (isInADuoPage) return

        // This hook can only be used in a duo game page
        console.error('useDuoGamePlayerSession can only be used in a duo game page')

        socketManager.disconnect()
        router.push('/')
    }, [router, pathname, socketManager])

    return {
        // Wrapping the gameManager methods in arrow functions to preserve the context
        joinGame: (playerName: string) => gameManager.playerClient.requestJoinGame(playerName),
        rejoinGame: (rejoiningPlayer: Player) => gameManager.playerClient.requestRejoinGame(rejoiningPlayer),
        leaveGame: () => gameManager.playerClient.requestLeaveGame(),
        enterGame: () => gameManager.playerClient.requestEnterGame(),
        startGame: (settings: GameSettings) => gameManager.gameClient.requestStartGame(settings),
        wordGuessSuccessful: () => gameManager.gameClient.requestWordGuessSuccessful(),
        switchRole: () => gameManager.gameClient.requestSwitchRole(),
        backToLobby: () => gameManager.gameClient.requestBackToLobby(),
        changeGuessWord: () => gameManager.gameClient.requestChangeGuessWord(),
        pauseGame: () => gameManager.gameClient.requestPauseGame(),
        resumeGame: () => gameManager.gameClient.requestResumeGame(),
        hostId: store.hostId,
        guessWord: store.guessWord,
        myPlayer: store.myPlayer,
        players: store.players,
        settings: store.settings,
        timeRemaining: store.timeRemaining,
        passesRemaining: store.passesRemaining,
        passedWords: store.passedWords,
        myPlayerStatus: store.myPlayerStatus,
        status: store.status,
    }
}
