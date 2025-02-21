'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Player, useDuoGameStore } from '@/stores/duoGameStore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { useSocket } from '@/utils/socket';
import { Button } from '@/components/Button';
import { DuoGameRole, GameType, SocketEvent } from '@/utils/constants';

type LobbyPageParams = { gameId: string }

type Players = { [playerId: string]: Player }

const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

export default function LobbyPage() {
    const { gameId } = useParams<LobbyPageParams>()
    const { setGameId, setHostId, hostId, setCurrentWord, setPlayers: setFinalPlayers, setTimeRemaining } = useDuoGameStore()
    const router = useRouter()

    const [players, setPlayers] = useState<Players>({})
    const [myPlayer, setMyPlayer] = useState<Player>()

    const socket = useSocket()

    const handleStartGame = () => {
        if (!(myPlayer && socket)) return

        socket.emit(SocketEvent.StartGame, { gameId, finalPlayers: Object.values(players) })
    }

    const handleGameStarted = useCallback((
        { wordToGuess, finalPlayers, timeRemaining }: { wordToGuess: string, finalPlayers: Player[], timeRemaining: number }
    ) => {
        if (!myPlayer) return

        setCurrentWord(wordToGuess)
        setFinalPlayers(finalPlayers)
        setTimeRemaining(timeRemaining)

        if (myPlayer.role === DuoGameRole.ClueGiver) {
            router.push(`/duo/${gameId}/clue-giver`)
        }

        if (myPlayer.role === DuoGameRole.Guesser) {
            router.push(`/duo/${gameId}/guesser`)
        }
    }, [setCurrentWord, setFinalPlayers, myPlayer, router, gameId])


    const handlePlayerListUpdated = useCallback(({ players }: { players: Players }) => {
        if (!socket) return

        const updatedPlayerWithRole = players[socket.id]

        if (Object.keys(players).length === 1) setHostId(updatedPlayerWithRole.id)
        if (!myPlayer) setMyPlayer(updatedPlayerWithRole)

        setPlayers(players)
    }, [myPlayer, setMyPlayer, setPlayers, setHostId, socket])


    useEffect(() => {
        if (!(gameId && socket)) return

        setGameId(gameId)

        const randomName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '-',
            length: 2
        })

        const player: Player = {
            id: socket.id,
            name: randomName,
            role: DuoGameRole.Unknown
        }

        socket.emit(SocketEvent.JoinRoom, { gameId, gameType: GameType.Duo, player })
    }, [gameId, setGameId, socket])

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.PlayerListUpdated, handlePlayerListUpdated)
        socket.on(SocketEvent.GameStarted, handleGameStarted)

        return (() => {
            socket.off(SocketEvent.PlayerListUpdated)
            socket.off(SocketEvent.GameStarted)
        })
    }, [socket, myPlayer, handleGameStarted])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Lobby ({gameId})</h1>
            <h2 className='mt-4'>Players: </h2>
            <ul className='list-disc ml-6'>
                {Object.values(players).map((player, index) => (
                    <li key={index}>
                        {player.name} - {DuoGameRoleText[player.role]}
                        {player.id === myPlayer?.id && (<b> (me)</b>)}
                    </li>
                ))}
            </ul>
            {
                hostId === myPlayer?.id && (
                    <Button
                        variant='primary'
                        label='Start Game'
                        disabled={!(Object.values(players).length === 2 && myPlayer)}
                        className='mt-4'
                        onClick={handleStartGame}
                    />
                )
            }
        </div>
    );
}
