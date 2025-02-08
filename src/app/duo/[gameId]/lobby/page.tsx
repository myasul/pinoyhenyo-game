'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDuoGameStore } from '@/stores/duoGameStore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { getSocket, SocketEvent } from '@/utils/socket';

type LobbyPageParams = { gameId: string }

type Player = {
    name: string
}

type Players = { [playerId: string]: Player }


export default function LobbyPage() {
    const { gameId } = useParams<LobbyPageParams>()
    const { setGameId } = useDuoGameStore()

    const [players, setPlayers] = useState<Players>({})


    useEffect(() => {
        if (!gameId) return

        setGameId(gameId)

        const socket = getSocket()

        socket.on('connect', () => {
            console.log('Connected with ID:', socket.id);
        });

        const randomName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '-',
            length: 2
        })

        socket.emit(SocketEvent.JoinRoom, { gameId, playerName: randomName })
        socket.on(SocketEvent.PlayerListUpdated, (data: { players: Players }) => {
            console.log(`[LobbyPage] ${SocketEvent.PlayerListUpdated} data:`, data)

            setPlayers(data.players)
        })

        return (() => {
            socket.off(SocketEvent.PlayerListUpdated)
        })
    }, [gameId, setGameId])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Lobby ({gameId})</h1>
            <h2 className='mt-4'>Players: </h2>
            <ul className='list-disc ml-6'>
                {console.log('PLAYERS: ', players)}
                {Object.values(players).map((player, index) => (
                    <li key={index}>{player.name}</li>
                ))}
            </ul>
        </div>
    );
}
