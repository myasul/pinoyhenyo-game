import { useCallback, useEffect, useState } from "react"
import { useSocket } from "./useSocket"
import { SocketEvent, Player, GameType } from "shared"
import { usePathname, useRouter } from "next/navigation"
import { useDuoGameStore } from "@/stores/duoGameStore"

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
    const { myPlayer, setMyPlayer } = useDuoGameStore()

    const playerLocalStorageKey = `henyo-duo-player-${gameId}`

    const joinGame = useCallback((playerName: string) => {
        if (!socket) return

        setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joining)

        // Player has either rejoined or still in the game
        if (myPlayer) {
            localStorage.setItem(playerLocalStorageKey, JSON.stringify(myPlayer))
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joined)
            return
        }

        socket.emit(SocketEvent.RequestJoinGame, { gameId, gameType: GameType.Duo, playerName }, (serverResponse: { myPlayer: Player, error: string }) => {
            console.log('[RequestJoinGame] serverResponse: ', serverResponse)

            if (serverResponse.error) {
                console.error('Failed to join game. Error: ', serverResponse.error)
                router.push('/')
            }

            const { myPlayer } = serverResponse

            localStorage.setItem(playerLocalStorageKey, JSON.stringify(myPlayer))
            setMyPlayer(myPlayer)
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.Joined)
        })
    }, [socket, router, gameId, myPlayer, playerLocalStorageKey, setMyPlayer])

    const rejoinGame = useCallback((rejoiningPlayer: Player) => {
        if (!socket) return

        setPlayerSessionStatus(DuoGamePlayerSessionStatus.Rejoining)

        socket.emit(SocketEvent.RequestRejoinGame, { gameId, rejoiningPlayer }, (serverResponse: { myPlayer: Player, error: string }) => {
            if (serverResponse.error) {
                console.error('Failed to rejoin game. Error: ', serverResponse.error)
                // Join the game as a new player
                joinGame(rejoiningPlayer.name)
                return
            }

            const { myPlayer } = serverResponse
            setMyPlayer(myPlayer)
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.Rejoined)
        })
    }, [socket, gameId, setMyPlayer, joinGame])

    useEffect(() => {
        if (!socket) return

        const isInADuoPage = pathname.includes('duo')

        // This hook can only be used in a duo game page
        if (!isInADuoPage) {
            disconnectSocket()
            router.push('/')
        }

        if (myPlayer || playerSessionStatus === DuoGamePlayerSessionStatus.Rejoining) return

        const rejoiningPlayerData = localStorage.getItem(playerLocalStorageKey)

        if (!rejoiningPlayerData) {
            setPlayerSessionStatus(DuoGamePlayerSessionStatus.NewJoiner)
            return
        }

        const rejoiningPlayer: Player = JSON.parse(rejoiningPlayerData)

        rejoinGame(rejoiningPlayer)
    }, [socket, pathname, disconnectSocket, router, playerLocalStorageKey, rejoinGame, myPlayer, playerSessionStatus])

    return {
        joinGame,
        playerSessionStatus,
        myPlayer,
    }
}
