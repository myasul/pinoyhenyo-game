'use client'

import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { DuoGameRole, GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { Socket } from "socket.io-client"

type DuoLobbyPageParams = { gameId: string }

type PlayerMap = { [playerId: string]: Player }

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
    [SocketEvent.RequestStartGame]: Handler<[]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.NotifyGameStarted]: Handler<[GameStartedCallbackProps]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[{ updatedPlayers: PlayerMap }]>;
    [SocketEvent.NotifyWordGuessUnsuccessful]: Handler<[GameStatus]>;
    [SocketEvent.NotifyWordGuessSuccessful]: Handler<[GameStatus]>;
    [SocketEvent.NotifyRoleSwitched]: Handler<[{ updatedPlayers: PlayerMap }]>;
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

    const handleRequestWordGuessSuccessful = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestWordGuessSuccessful, { gameId })

        router.push(`/duo/${gameId}/results?status=${GameStatus.Win}`)
    }, [gameId, router, store, socket])

    const handleRequestSwitchRole = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestSwitchRole, { gameId })
    }, [socket])

    const handleNotifyGameStarted = useCallback(({ wordToGuess, finalPlayers, remainingTime, emoji }: GameStartedCallbackProps) => {
        if (!store.myPlayer) return

        store.setWordToGuess(wordToGuess)
        store.setPlayers(finalPlayers)
        store.setRemainingTime(remainingTime)
        store.setEmoji(emoji)

        if (store.myPlayer.role === DuoGameRole.ClueGiver) router.push(`/duo/${gameId}/clue-giver`)
        if (store.myPlayer.role === DuoGameRole.Guesser) router.push(`/duo/${gameId}/guesser`)
    }, [gameId, router, store])

    const handleNotifyPlayersUpdated = useCallback(({ updatedPlayers }: { updatedPlayers: PlayerMap }) => {
        if (!socket) return

        const updatedPlayerWithRole = updatedPlayers[socket.id]

        if (Object.keys(updatedPlayers).length === 1) store.setHostId(updatedPlayerWithRole.id)

        store.setMyPlayer(updatedPlayerWithRole)
        store.setPlayers(Object.values(updatedPlayers))
    }, [store, socket])

    const handleNotifyWordGuess = useCallback((gameStatus: GameStatus) => {
        if (!socket) return

        router.push(`/duo/${gameId}/results?status=${gameStatus}`)
    }, [gameId, router, store, socket])

    const handleNotifyRoleSwitched = useCallback(({ updatedPlayers }: { updatedPlayers: PlayerMap }) => {
        if (!socket) return

        const myPlayerWithUpdatedRole = updatedPlayers[socket.id]

        store.setPlayers(Object.values(updatedPlayers))
        store.setMyPlayer(myPlayerWithUpdatedRole)

        socket.emit(SocketEvent.RequestStartGame, { gameId, finalPlayers: Object.values(updatedPlayers) })
    }, [socket, gameId, store])

    const handlers: Handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.RequestSwitchRole]: handleRequestSwitchRole,
        [SocketEvent.RequestWordGuessSuccessful]: handleRequestWordGuessSuccessful,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: handleNotifyPlayersUpdated,
        [SocketEvent.NotifyWordGuessUnsuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyWordGuessSuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyRoleSwitched]: handleNotifyRoleSwitched,
    }

    return { gameId, ...store, handlers }
}
