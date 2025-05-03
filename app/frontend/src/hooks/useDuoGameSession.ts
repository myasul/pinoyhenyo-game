import { useCallback, useEffect, useState } from "react"
import { useSocket } from "./useSocket"
import { SocketEvent, Player, GameType, ServerGame, SerializedGame, SocketResponse } from "shared"
import { usePathname, useRouter } from "next/navigation"
import { useDuoGameStore } from "@/stores/duoGameStore"
import { DuoGamePage } from "@/utils/constants"
import { useEvent } from "./useEvent"

export enum DuoGamePlayerSessionStatus {
    Idle = 'IDLE',
    NewJoiner = 'NEW_JOINER',
    Joining = 'JOINING',
    Joined = 'JOINED',
    Rejoining = 'REJOINING',
    Rejoined = 'REJOINED',
    Left = 'LEFT',
}

export const useDuoGameSession = (gameId: string) => {
    const router = useRouter()
    const pathname = usePathname()
    const { socket, disconnectSocket } = useSocket()
    const [playerSessionStatus, setPlayerSessionStatus] = useState<DuoGamePlayerSessionStatus>(DuoGamePlayerSessionStatus.Idle)
    const store = useDuoGameStore()

    const playerLocalStorageKey = `henyo-duo-player-${gameId}`

    const setupGame = useCallback((joiningPlayer: Player, game: SerializedGame) => {
        store.setMyPlayer(joiningPlayer)
        store.setGuessWord(game.guessWord ?? null)
        store.setPlayers(Object.values(game.players))
        store.setTimeRemaining(game.timeRemaining)
        store.setDuration(game.settings.duration)
        store.setPassesRemaining(game.passesRemaining)
    }, [store])

    const joinGame = useCallback((playerName: string) => {
        if (!socket) return

        setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joining)

        // Player has either rejoined or still in the game
        if (store.myPlayer) {
            localStorage.setItem(playerLocalStorageKey, JSON.stringify(store.myPlayer))
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joined)
            return
        }

        socket.emit(
            SocketEvent.RequestJoinGame,
            { gameId, gameType: GameType.Duo, playerName },
            (serverResponse: SocketResponse<{ joiningPlayer: Player, game: SerializedGame }>) => {
                if (!serverResponse.success) {
                    console.error('Failed to join game. Error: ', serverResponse.error)
                    router.push('/')

                    return
                }

                const { joiningPlayer, game } = serverResponse.data

                localStorage.setItem(playerLocalStorageKey, JSON.stringify(joiningPlayer))

                setupGame(joiningPlayer, game)

                setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joined)
            })
    }, [socket, router, gameId, store, playerLocalStorageKey, setupGame])

    const rejoinGame = useEvent((rejoiningPlayer: Player) => {
        if (!socket) return

        setPlayerSessionStatus(DuoGamePlayerSessionStatus.Rejoining)

        socket.emit(
            SocketEvent.RequestRejoinGame,
            { gameId, rejoiningPlayer },
            (serverResponse: SocketResponse<{ rejoiningPlayer: Player, game: SerializedGame }>) => {
                if (!serverResponse.success) {
                    console.error(`Failed to rejoin game. 'Error: ${serverResponse.error}`)

                    // Join the game as a new player
                    joinGame(rejoiningPlayer.name)
                    return
                }

                setupGame(serverResponse.data.rejoiningPlayer, serverResponse.data.game)
                setPlayerSessionStatus(DuoGamePlayerSessionStatus.Rejoined)

            })
    })

    const leaveGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestLeaveGame, { gameId })

        // Remove player from the game
        setPlayerSessionStatus(DuoGamePlayerSessionStatus.Left)
        localStorage.removeItem(playerLocalStorageKey)
        store.setMyPlayer(null)
        disconnectSocket()

        console.log('[Lobby page] Player left the game. Redirecting to home page...')

        // Redirect to the home page
        router.push('/')
    }, [socket, gameId, playerLocalStorageKey, store, disconnectSocket, router])

    // Determines if the player can join the game (as a new player or rejoining)
    const handlePlayerEnteringTheGame = useEvent((
        socketResponse: SocketResponse<{ game: SerializedGame | null, error: string }>) => {
        if (!socketResponse.success) {
            console.error('Failed to enter the game. Error: ', socketResponse.error)
            router.push('/')
            return
        }

        const { game } = socketResponse.data

        const isPlayerAlreadyInGame = store.myPlayer
        const isPlayerRejoining = playerSessionStatus === DuoGamePlayerSessionStatus.Rejoining

        if (isPlayerAlreadyInGame || isPlayerRejoining) return

        const rejoiningPlayerData = localStorage.getItem(playerLocalStorageKey)
        const rejoiningPlayer = rejoiningPlayerData ? JSON.parse(rejoiningPlayerData) : null
        const isRejoiningPlayer = rejoiningPlayer && game && game.players[rejoiningPlayer.id]

        if (isRejoiningPlayer) {
            rejoinGame(JSON.parse(rejoiningPlayerData!))
            return
        }

        const isGameFull = game && Object.values(game.players).length >= 2
        const hasGameStarted = !pathname.includes(DuoGamePage.Lobby)

        // TODO: Can improve UI/UX by showing a message to the user
        // before redirecting them to the home page
        if (hasGameStarted || isGameFull) {
            console.error('Game is full or has already started. Cannot join the game.')
            router.push('/')
            return
        }

        setPlayerSessionStatus(DuoGamePlayerSessionStatus.NewJoiner)
    })

    // Rejoining logic
    useEffect(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestEnterGame, { gameId }, handlePlayerEnteringTheGame)
    }, [socket, handlePlayerEnteringTheGame, gameId])

    useEffect(() => {
        const isInADuoPage = pathname.includes('duo')

        if (isInADuoPage) return

        // This hook can only be used in a duo game page
        disconnectSocket()
        router.push('/')
    }, [router, pathname, disconnectSocket])

    return {
        joinGame,
        leaveGame,
        playerSessionStatus,
        myPlayer: store.myPlayer,
    }
}
