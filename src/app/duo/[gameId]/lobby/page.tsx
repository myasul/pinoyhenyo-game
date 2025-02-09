'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DuoGameRole, useDuoGameStore } from '@/stores/duoGameStore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { getSocket, SocketEvent } from '@/utils/socket';
import { Button } from '@/components/Button';

type LobbyPageParams = { gameId: string }

enum GameType {
    Classic = 'CLASSIC',
    Duo = 'DUO',
    Battle = 'BATTLE'
}

type Player = {
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


    useEffect(() => {
        if (!gameId) return

        setGameId(gameId)

        const socket = getSocket()

        const randomName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '-',
            length: 2
        })

        socket.emit(
            SocketEvent.JoinRoom,
            { gameId, gameType: GameType.Duo, playerName: randomName, role: DuoGameRole.Unknown }
        )

        socket.on(
            SocketEvent.PlayerListUpdated,
            (data: { players: Players }) => {
                setPlayers(data.players)
            }
        )

        return (() => {
            socket.off(SocketEvent.PlayerListUpdated)
        })
    }, [gameId, setGameId])

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
            />
        </div>
    );
}
