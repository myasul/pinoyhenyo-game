'use client'

import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { useSocket } from "./useSocket"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { DuoGameRole, SocketEvent } from "shared"
import { GameStatus } from "@/utils/constants"
import { useDuoGameSession } from "./useDuoGameSession"

type PlayerMap = { [playerId: string]: Player }

type GameStartedCallbackProps = {
    guessWord: string
    finalPlayers: Player[]
    timeRemaining: number
    duration: number
    passesRemaining: number
}

type Handler<T extends unknown[] = unknown[]> = (...args: T) => void;

type Handlers = {
    [SocketEvent.RequestStartGame]: Handler<[]>;
    [SocketEvent.RequestWordGuessSuccessful]: Handler<[]>;
    [SocketEvent.RequestSwitchRole]: Handler<[]>;
    [SocketEvent.RequestBackToLobby]: Handler<[]>;
    [SocketEvent.RequestChangeGuessWord]: Handler<[]>;
    [SocketEvent.NotifyGameStarted]: Handler<[GameStartedCallbackProps]>;
    [SocketEvent.NotifyPlayersUpdated]: Handler<[{ updatedPlayers: PlayerMap }]>;
    [SocketEvent.NotifyWordGuessUnsuccessful]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
    [SocketEvent.NotifyWordGuessSuccessful]: Handler<[{ gameStatus: GameStatus, passedWords: string[] }]>;
    [SocketEvent.NotifyRoleSwitched]: Handler<[{ updatedPlayers: PlayerMap }]>;
    [SocketEvent.NotifyBackToLobby]: Handler<[]>;
    [SocketEvent.NotifyGuessWordChanged]: Handler<[{ guessWord: string }]>;
};

export const useDuoGameState = (gameId: string) => {
    const router = useRouter()
    const { socket } = useSocket()
    const store = useDuoGameStore()
    const { myPlayer } = useDuoGameSession(gameId)

    const handleRequestStartGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestStartGame, { gameId, finalPlayers: Object.values(store.players) })
    }, [socket, gameId, store.players])

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

        console.log('[handleRequestChangeGuessWord] called')

        socket.emit(SocketEvent.RequestChangeGuessWord, { gameId })
    }, [socket, gameId])

    const handleNotifyGameStarted = useCallback(({
        finalPlayers,
        duration,
        guessWord,
        timeRemaining,
        passesRemaining
    }: GameStartedCallbackProps) => {
        if (!myPlayer) return

        store.setGuessWord(guessWord)
        store.setPlayers(finalPlayers)
        store.setTimeRemaining(timeRemaining)
        store.setDuration(duration)
        store.setPassesRemaining(passesRemaining)

        if (myPlayer.role === DuoGameRole.ClueGiver) router.push(`/duo/${gameId}/clue-giver`)
        if (myPlayer.role === DuoGameRole.Guesser) router.push(`/duo/${gameId}/guesser`)
    }, [gameId, router, store, myPlayer])

    const handleNotifyPlayersUpdated = useCallback(({ updatedPlayers }: { updatedPlayers: PlayerMap }) => {
        console.log('[handleNotifyPlayersUpdated] updatedPlayers: ', updatedPlayers)

        if (!socket) return

        if (myPlayer && !updatedPlayers[myPlayer.id]) {
            console.error('Player not found in updated players')
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

    const handleNotifyRoleSwitched = useCallback(({ updatedPlayers }: { updatedPlayers: PlayerMap }) => {
        if (!socket) return

        const myPlayerWithUpdatedRole = updatedPlayers[socket.id]

        store.setPlayers(Object.values(updatedPlayers))
        store.setMyPlayer(myPlayerWithUpdatedRole)

        socket.emit(SocketEvent.RequestStartGame, { gameId, finalPlayers: Object.values(updatedPlayers) })
    }, [socket, gameId, store])

    const handleNotifyBackToLobby = useCallback(() => {
        if (!socket) return

        router.push(`/duo/${gameId}/lobby`)
    }, [socket, router, gameId])


    const handleNotifyGuessWordChanged = useCallback((
        { guessWord, passesRemaining }: { guessWord: string, passesRemaining: number }
    ) => {
        if (!socket) return

        store.setGuessWord(guessWord)
        store.setPassesRemaining(passesRemaining)
    }, [socket, store])

    const handlers: Handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.RequestSwitchRole]: handleRequestSwitchRole,
        [SocketEvent.RequestWordGuessSuccessful]: handleRequestWordGuessSuccessful,
        [SocketEvent.RequestBackToLobby]: handleRequestBackToLobby,
        [SocketEvent.RequestChangeGuessWord]: handleRequestChangeGuessWord,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: handleNotifyPlayersUpdated,
        [SocketEvent.NotifyWordGuessUnsuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyWordGuessSuccessful]: handleNotifyWordGuess,
        [SocketEvent.NotifyRoleSwitched]: handleNotifyRoleSwitched,
        [SocketEvent.NotifyBackToLobby]: handleNotifyBackToLobby,
        [SocketEvent.NotifyGuessWordChanged]: handleNotifyGuessWordChanged,
    }

    return { gameId, ...store, handlers }
}
