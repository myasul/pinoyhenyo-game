import { Player, useDuoGameStore } from "@/stores/duoGameStore"
import { DuoGameRole, GameStatus, SocketEvent } from "@/utils/constants"
import { useSocket } from "@/utils/socket"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

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

        if (pathname.includes(DuoGamePage.Lobby)) store.setStatus(GameStatus.Waiting)

        if (store.status === GameStatus.Started && !store.myPlayer) {
            console.error('Player not found')
            router.push('/')

            return
        }
    }, [gameId, socket, pathname, router, store.setStatus, store.myPlayer, store.status])

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
        store.setStatus(GameStatus.Started)

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


    const handlers = {
        [SocketEvent.RequestStartGame]: handleRequestStartGame,
        [SocketEvent.NotifyGameStarted]: handleNotifyGameStarted,
        [SocketEvent.NotifyPlayersUpdated]: handleNotifyPlayersUpdated
    }

    return { gameId, ...store, handlers }
}
