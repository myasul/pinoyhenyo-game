'use client'

import { useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "./useSocket"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { DuoGameRole, GameSettings, Player, SerializedGame, SocketEvent } from "shared"
import { DuoGamePlayerSessionStatus, GameStatus } from "@/utils/constants"

type Handler<T extends unknown[] = unknown[]> = (...args: T) => void;

type Handlers = {
    [SocketEvent.RequestStartGame]: Handler<[settings: GameSettings]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.RequestBackToLobby]: Handler<[]>;
    [SocketEvent.RequestChangeGuessWord]: Handler<[]>;
    // TODO: Update handlers for notify events to only accept
    // serialized game object
    [SocketEvent.NotifyGameStarted]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyBackToLobby]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyGuessWordChanged]: Handler<[game: SerializedGame]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[{ updatedPlayers: Player[] }]>;
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

    const handleNotifyPlayersUpdated = useCallback(({ updatedPlayers }: { updatedPlayers: Player[] }) => {
        console.log('[handleNotifyPlayersUpdated] updatedPlayers: ', updatedPlayers)

        if (!socket) return

        const isMyPlayerInUpdatedPlayers = updatedPlayers
            .find((player: Player) => player.id === store.myPlayer?.id)

        if (store.myPlayer && !isMyPlayerInUpdatedPlayers) {
            console.error('Player not found in updated players')

            console.log('[Lobby page] Player not found in updated players. Redirecting to home page...')

            router.push('/')
            return
        }

        store.setPlayers(Object.values(updatedPlayers))
    }, [store, socket, router])

    const handleNotifyWordGuess = useCallback((
        { gameStatus, passedWords }: { gameStatus: GameStatus, passedWords: string[] }
    ) => {
        if (!socket) return

        store.setPassedWords(passedWords)

        router.push(`/duo/${gameId}/results?status=${gameStatus}`)
    }, [gameId, router, socket, store])


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

    return { gameId, handlers, syncGameState, ...store }
}
