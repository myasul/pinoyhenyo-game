'use client'

import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { DuoGameRole, GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"

type DuoLobbyPageParams = { gameId: string }

enum DuoGamePage {
    Lobby = 'lobby',
    ClueGiver = 'clue-giver',
    Guesser = 'guesser',
    Results = 'results',
}

type GameStartedCallbackProps = {
    wordToGuess: string
    finalPlayers: Player[]
    remainingTime: number
    emoji: string
}

type Handler<T extends any[] = any[]> = (...args: T) => void;

type Handlers = {
    [SocketEvent.RequestStartGame]: Handler<[string, any[]]>;
    [SocketEvent.NotifyGameStarted]: Handler<[GameStartedCallbackProps]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[{ players: { [playerId: string]: Player } }]>;
    [SocketEvent.NotifyWordGuessUnsuccessful]: Handler<[GameStatus]>;
    [SocketEvent.NotifyWordGuessSuccessful]: Handler<[GameStatus]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
};

export const useDuoGameState = () => {
    const { gameId } = useParams<DuoLobbyPageParams>()
    const pathname = usePathname()
    const router = useRouter()
    const socket = useSocket()
    const store = useDuoGameStore()

    useEffect(() => {
        if (!gameId) {
            // TODO: Add frontend error logger
            router.push('/')
            return
        }

        if (!socket) return

        const isLobbyPage = pathname.includes(DuoGamePage.Lobby)
        const hasGameStarted = pathname.includes(DuoGamePage.ClueGiver) || pathname.includes(DuoGamePage.Guesser)

        if (hasGameStarted && !store.myPlayer) {
            console.error('Player not found')
            router.push('/')

            return
        }
    }, [gameId, socket, pathname, router, store.myPlayer])

    const handleRequestStartGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestStartGame, { gameId, finalPlayers: Object.values(store.players) })
    }, [socket, gameId, store.players])

    const handleNotifyGameStarted = useCallback(({ wordToGuess, finalPlayers, remainingTime, emoji }: GameStartedCallbackProps) => {
        if (!store.myPlayer) return

        store.setWordToGuess(wordToGuess)
        store.setPlayers(finalPlayers)
        store.setRemainingTime(remainingTime)
        store.setEmoji(emoji)

        if (store.myPlayer.role === DuoGameRole.ClueGiver) {
            router.push(`/duo/${gameId}/clue-giver`)
        }

        if (store.myPlayer.role === DuoGameRole.Guesser) {
            router.push(`/duo/${gameId}/guesser`)
        }
    }, [gameId, router, store])

    const handleNotifyPlayersUpdated = useCallback(({ players }: { players: { [playerId: string]: Player } }) => {
        if (!socket) return

        const updatedPlayerWithRole = players[socket.id]

        if (Object.keys(players).length === 1) store.setHostId(updatedPlayerWithRole.id)

        store.setMyPlayer(updatedPlayerWithRole)
        store.setPlayers(Object.values(players))
    }, [store, socket])

    const handleNotifyWordGuess = useCallback((gameStatus: GameStatus) => {
        if (!socket) return

        router.push(`/duo/${gameId}/results?status=${gameStatus}`)
    }, [gameId, router, store, socket])

    const handleRequestWordGuessSuccessful = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestWordGuessSuccessful, { gameId })

        router.push(`/duo/${gameId}/results?status=${GameStatus.Win}`)
    }, [gameId, router, store, socket])

    const handlers: Handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: handleNotifyPlayersUpdated,
        [SocketEvent.NotifyWordGuessUnsuccessful]: handleNotifyWordGuess,
        [SocketEvent.RequestWordGuessSuccessful]: handleRequestWordGuessSuccessful,
        [SocketEvent.NotifyWordGuessSuccessful]: handleNotifyWordGuess
    }

    return { gameId, ...store, handlers }
}
