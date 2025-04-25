import { useCallback, useEffect, useState } from "react"
import { useSocket } from "./useSocket"
import { SocketEvent, Player, GameType, ServerGame, SerializableServerGame } from "shared"
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

    const setupGame = useCallback((joiningPlayer: Player, serverGame: SerializableServerGame) => {
        store.setMyPlayer(joiningPlayer)
        store.setGuessWord(serverGame.guessWord)
        store.setPlayers(Object.values(serverGame.players))
        store.setTimeRemaining(serverGame.timeRemaining)
        store.setDuration(serverGame.settings.duration)
        store.setPassesRemaining(serverGame.passesRemaining)
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
            (serverResponse: { joiningPlayer: Player, game: SerializableServerGame, error: string }) => {
                if (serverResponse.error) {
                    console.error('Failed to join game. Error: ', serverResponse.error)
                    router.push('/')
                }

                const { joiningPlayer, game } = serverResponse

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
            (serverResponse: { rejoiningPlayer: Player, game: SerializableServerGame, error: string }) => {
                if (serverResponse.error) {
                    // Join the game as a new player
                    joinGame(rejoiningPlayer.name)
                    return
                }

                setupGame(serverResponse.rejoiningPlayer, serverResponse.game)
                setPlayerSessionStatus(DuoGamePlayerSessionStatus.Rejoined)

            })
    })

    const leaveGame = useCallback(() => {
        if (!socket) return

        socket.emit(SocketEvent.RequestLeaveGame, { gameId }, () => {
            // Remove player from the game
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.Left)
            localStorage.removeItem(playerLocalStorageKey)
            store.setMyPlayer(null)
            disconnectSocket()

            // Redirect to the home page
            router.push('/')
        })
    }, [socket, gameId, playerLocalStorageKey, store, disconnectSocket, router])

    const handleRejoining = useEvent(() => {
        const isInADuoPage = pathname.includes('duo')

        // This hook can only be used in a duo game page
        if (!isInADuoPage) {
            disconnectSocket()
            router.push('/')
        }

        const shouldRejoin = !(store.myPlayer || playerSessionStatus === DuoGamePlayerSessionStatus.Rejoining)

        if (!shouldRejoin) return

        const rejoiningPlayerData = localStorage.getItem(playerLocalStorageKey)

        if (!rejoiningPlayerData) {
            const hasGameStarted = !pathname.includes(DuoGamePage.Lobby)

            if (hasGameStarted) {
                router.push('/')
                return
            }

            setPlayerSessionStatus(DuoGamePlayerSessionStatus.NewJoiner)
            return
        }

        const rejoiningPlayer: Player = JSON.parse(rejoiningPlayerData)

        rejoinGame(rejoiningPlayer)
    })

    // Rejoining logic
    useEffect(() => {
        handleRejoining()
    }, [handleRejoining, socket])

    return {
        joinGame,
        leaveGame,
        playerSessionStatus,
        myPlayer: store.myPlayer,
    }
}
