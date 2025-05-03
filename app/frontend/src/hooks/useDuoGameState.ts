'use client'

import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "./useSocket"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { DuoGameRole, SerializedGame, SocketEvent, SocketResponse } from "shared"
import { GameStatus } from "@/utils/constants"
import { useDuoGameSession } from "./useDuoGameSession"

type Handler<T extends unknown[] = unknown[]> = (...args: T) => void;

type Handlers = {
    [SocketEvent.RequestStartGame]: Handler<[]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.RequestBackToLobby]: Handler<[]>;
    [SocketEvent.RequestChangeGuessWord]: Handler<[]>;
    [SocketEvent.NotifyGameStarted]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[{ updatedPlayers: Player[] }]>;
    [SocketEvent.NotifyWordGuessFailed]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
    [SocketEvent.NotifyWordGuessSuccessful]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
    [SocketEvent.NotifyBackToLobby]: Handler<[]>;
    [SocketEvent.NotifyGuessWordChanged]: Handler<[game: SerializedGame]>;
};

export const useDuoGameState = (gameId: string) => {
    const router = useRouter()
    const { socket } = useSocket()
    const store = useDuoGameStore()
    const { myPlayer } = useDuoGameSession(gameId)

    const handleRequestStartGame = useCallback(() => {
        if (!socket) return

        socket.emit(
            SocketEvent.RequestStartGame,
            { gameId, finalPlayers: Object.values(store.players) },
            // TODO: Encapsulate this in a function to handle 
            // errors (redirect to the home page)
            (_socketResponse: SocketResponse) => undefined
        )
    }, [socket, gameId, store.players])

    const handleRequestWordGuessSuccessful = useCallback(() => {
        if (!socket) return

        socket.emit(
            SocketEvent.RequestWordGuessSuccessful,
            { gameId },
            (_socketResponse: SocketResponse) => undefined
        )
    }, [gameId, socket])

    const handleRequestSwitchRole = useCallback(() => {
        if (!socket) return

        socket.emit(
            SocketEvent.RequestSwitchRole,
            { gameId },
            (_socketResponse: SocketResponse) => undefined
        )
    }, [socket, gameId])

    const handleRequestBackToLobby = useCallback(() => {
        if (!socket) return

        socket.emit(
            SocketEvent.RequestBackToLobby,
            { gameId },
            (_socketResponse: SocketResponse) => undefined
        )
    }, [socket, gameId])


    const handleRequestChangeGuessWord = useCallback(() => {
        if (!socket) return

        console.log('[handleRequestChangeGuessWord] called')

        socket.emit(
            SocketEvent.RequestChangeGuessWord,
            { gameId },
            (_socketResponse: SocketResponse) => undefined
        )
    }, [socket, gameId])

    const handleNotifyGameStarted = useCallback((game: SerializedGame) => {
        if (!myPlayer) return

        store.setGuessWord(game.guessWord)
        store.setPlayers(Object.values(game.players))
        store.setTimeRemaining(game.timeRemaining)
        store.setDuration(game.timeRemaining)
        store.setPassesRemaining(game.passesRemaining)

        if (myPlayer.role === DuoGameRole.ClueGiver) router.push(`/duo/${gameId}/clue-giver`)
        if (myPlayer.role === DuoGameRole.Guesser) router.push(`/duo/${gameId}/guesser`)
    }, [gameId, router, store, myPlayer])

    const handleNotifyPlayersUpdated = useCallback(({ updatedPlayers }: { updatedPlayers: Player[] }) => {
        console.log('[handleNotifyPlayersUpdated] updatedPlayers: ', updatedPlayers)

        if (!socket) return

        const isMyPlayerInUpdatedPlayers = updatedPlayers.find((player: Player) => player.id === myPlayer?.id)

        if (myPlayer && !isMyPlayerInUpdatedPlayers) {
            console.error('Player not found in updated players')

            console.log('[Lobby page] Player not found in updated players. Redirecting to home page...')

            router.push('/')
            return
        }

        store.setPlayers(Object.values(updatedPlayers))
    }, [store, socket, myPlayer, router])

    const handleNotifyWordGuess = useCallback((
        { gameStatus, passedWords }: { gameStatus: GameStatus, passedWords: string[] }
    ) => {
        if (!socket) return

        store.setPassedWords(passedWords)

        router.push(`/duo/${gameId}/results?status=${gameStatus}`)
    }, [gameId, router, socket, store])

    const handleNotifyBackToLobby = useCallback(() => {
        if (!socket) return

        router.push(`/duo/${gameId}/lobby`)
    }, [socket, router, gameId])


    const handleNotifyGuessWordChanged = useCallback((game: SerializedGame) => {
        if (!socket) return

        store.setGuessWord(game.guessWord)
        store.setPassesRemaining(game.passesRemaining)
    }, [socket, store])

    const handlers: Handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.RequestSwitchRole]: handleRequestSwitchRole,
        [SocketEvent.RequestWordGuessSuccessful]: handleRequestWordGuessSuccessful,
        [SocketEvent.RequestBackToLobby]: handleRequestBackToLobby,
        [SocketEvent.RequestChangeGuessWord]: handleRequestChangeGuessWord,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: handleNotifyPlayersUpdated,
        [SocketEvent.NotifyWordGuessFailed]: handleNotifyWordGuess,
        [SocketEvent.NotifyWordGuessSuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyBackToLobby]: handleNotifyBackToLobby,
        [SocketEvent.NotifyGuessWordChanged]: handleNotifyGuessWordChanged,
    }

    return { gameId, ...store, handlers }
}
