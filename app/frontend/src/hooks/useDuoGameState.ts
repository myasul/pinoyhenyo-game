'use client'

import { useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "./useSocket"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { DuoGameRole, GameSettings, SerializedGame, SocketEvent } from "shared"
import { DuoGamePlayerSessionStatus, GameStatus } from "@/utils/constants"

type Handler<T extends unknown[] = unknown[]> = (...args: T) => void;

type Handlers = {
    [SocketEvent.RequestStartGame]: Handler<[settings: GameSettings]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.RequestBackToLobby]: Handler<[]>;
    [SocketEvent.RequestChangeGuessWord]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.RequestPauseGame]: Handler<[]>;
    [SocketEvent.RequestResumeGame]: Handler<[]>;
    // TODO: Update handlers for notify events to only accept
    // serialized game object
    [SocketEvent.NotifyGameStarted]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyBackToLobby]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyGuessWordChanged]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyRoleSwitched]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyWordGuessFailed]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
    [SocketEvent.NotifyWordGuessSuccessful]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
};

export const useDuoGameState = (gameId: string) => {
    const router = useRouter()
    const { socket } = useSocket()
    const store = useDuoGameStore()

    // Sync game state coming from the server
    // Only syncing game state that is shared between players
    const syncGameState = useCallback((game: SerializedGame) => {
        store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Syncing)

        // add new player status (syncing)
        store.setSettings(game.settings)
        store.setTimeRemaining(game.timeRemaining)
        store.setPassesRemaining(game.passesRemaining)
        store.setGuessWord(game.guessWord)
        store.setPlayers(Object.values(game.players))
        store.setPassedWords(game.passedWords)

        // Add artificial delay to simulate syncing
        setTimeout(() => {
            store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Synced)
        }, 500)
    }, [store])

    const updatePlayers = useCallback((game: SerializedGame) => {
        if (store.myPlayer) {
            const updatedMyPlayer = game.players[store.myPlayer.id]

            if (!updatedMyPlayer) {
                console.error('Player not found in updated players')

                router.push('/')
                return
            }

            store.setMyPlayer(updatedMyPlayer)
        }

        store.setPlayers(Object.values(game.players))

    }, [store, router])

    const handleRequestStartGame = useCallback((settings: GameSettings) => {
        if (!socket) return

        socket.emit(SocketEvent.RequestStartGame, { gameId, settings })
    }, [socket, gameId])

    const handleRequestWordGuessSuccessful = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestWordGuessSuccessful, { gameId })
    }, [gameId, socket])

    const handleRequestSwitchRole = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestSwitchRole, { gameId })
    }, [socket, gameId])

    const handleRequestBackToLobby = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestBackToLobby, { gameId })
    }, [socket, gameId])


    const handleRequestChangeGuessWord = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestChangeGuessWord, { gameId })
    }, [socket, gameId])

    const handleRequestPauseGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestPauseGame, { gameId })
    }, [socket, gameId])

    const handleRequestResumeGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestResumeGame, { gameId })
    }, [socket, gameId])

    const handleNotifyGameStarted = useCallback((game: SerializedGame) => {
        if (!store.myPlayer) return

        syncGameState(game)

        if (store.myPlayer.role === DuoGameRole.ClueGiver) router.push(`/duo/${gameId}/clue-giver`)
        if (store.myPlayer.role === DuoGameRole.Guesser) router.push(`/duo/${gameId}/guesser`)
    }, [gameId, router, store, syncGameState])

    const handleNotifyBackToLobby = useCallback((game: SerializedGame) => {
        syncGameState(game)

        router.push(`/duo/${gameId}/lobby`)
    }, [syncGameState, router, gameId])

    const handleNotifyWordGuess = useCallback((
        { gameStatus, passedWords }: { gameStatus: GameStatus, passedWords: string[] }
    ) => {
        store.setPassedWords(passedWords)

        router.push(`/duo/${gameId}/results?status=${gameStatus}`)
    }, [gameId, router, store])


    const handleNotifyGuessWordChanged = useCallback((game: SerializedGame) => {
        store.setGuessWord(game.guessWord)
        store.setPassesRemaining(game.passesRemaining)
    }, [store])

    const handlers: Handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.RequestSwitchRole]: handleRequestSwitchRole,
        [SocketEvent.RequestWordGuessSuccessful]: handleRequestWordGuessSuccessful,
        [SocketEvent.RequestBackToLobby]: handleRequestBackToLobby,
        [SocketEvent.RequestChangeGuessWord]: handleRequestChangeGuessWord,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: updatePlayers,
        [SocketEvent.NotifyRoleSwitched]: updatePlayers,
        [SocketEvent.NotifyWordGuessFailed]: handleNotifyWordGuess,
        [SocketEvent.NotifyWordGuessSuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyBackToLobby]: handleNotifyBackToLobby,
        [SocketEvent.NotifyGuessWordChanged]: handleNotifyGuessWordChanged,
        [SocketEvent.RequestPauseGame]: handleRequestPauseGame,
        [SocketEvent.RequestResumeGame]: handleRequestResumeGame
    }

    return { gameId, handlers, syncGameState, ...store }
}
