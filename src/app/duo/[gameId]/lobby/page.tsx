'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DuoGameRole, useDuoGameStore } from '@/stores/duoGameStore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { getSocket, SocketEvent, useSocket } from '@/utils/socket';
import { Button } from '@/components/Button';

type LobbyPageParams = { gameId: string }

enum GameType {
    Classic = 'CLASSIC',
    Duo = 'DUO',
    Battle = 'BATTLE'
}

type Player = {
    id: string
    name: string
    role: DuoGameRole
}

type Players = { [playerId: string]: Player }

const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

export default function LobbyPage() {
    const { gameId } = useParams<LobbyPageParams>()
    const { setGameId } = useDuoGameStore()

    const [players, setPlayers] = useState<Players>({})
    const [myPlayer, setMyPlayer] = useState<Player>()

    const socket = useSocket()

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

        setMyPlayer(player)

        socket.emit(SocketEvent.JoinRoom, { gameId, gameType: GameType.Duo, player })

        socket.on(
            SocketEvent.PlayerListUpdated,
            (data: { players: Players }) => {
                if (!myPlayer) {
                    console.error('My player not found')
                    return
                }

                const updatedPlayerWithRole = players[myPlayer.id]

                if (!updatedPlayerWithRole) { 
                    console.error('Current player is not included in the player list')
                    return
                }

                setMyPlayer(data.players[player.id])
                setPlayers(data.players)
            }
        )

        return (() => { socket.off(SocketEvent.PlayerListUpdated) })
    }, [gameId, setGameId, socket])

    const handleStartGame = () => {
        
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Lobby ({gameId})</h1>
            <h2 className='mt-4'>Players: </h2>
            <ul className='list-disc ml-6'>
                {Object.values(players).map((player, index) => (
                    <li key={index}>{player.name} - {DuoGameRoleText[player.role]}</li>
                ))}
            </ul>
            <Button
                variant='primary'
                label='Start Game'
                disabled={Object.values(players).length !== 2}
                className='mt-4'
                onClick={handleStartGame}
            />
        </div>
    );
}
