'use client';

import { useEffect } from 'react';
import { Player } from '@/stores/duoGameStore';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { useSocket } from '@/utils/socket';
import { Button } from '@/components/Button';
import { DuoGameRole, GameType, SocketEvent } from '@/utils/constants';
import { useDuoGameState } from '@/hooks/useDuoGameState';

const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

export default function LobbyPage() {
    const { gameId, players, myPlayer, hostId, handlers } = useDuoGameState()
    const socket = useSocket()


    useEffect(() => {
        if (!socket) return

        const isExistingPlayer = Object.values(players).some(player => player.id === socket.id)

        if (isExistingPlayer) return

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

        socket.emit(SocketEvent.RequestJoinGame, { gameId, type: GameType.Duo, player })
    }, [gameId, socket])

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyPlayersUpdated, handlers[SocketEvent.NotifyPlayersUpdated])
        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])

        return (() => {
            socket.off(SocketEvent.NotifyPlayersUpdated)
            socket.off(SocketEvent.NotifyGameStarted)
        })
    }, [socket, myPlayer, handlers])

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
                        onClick={handlers[SocketEvent.RequestStartGame]}
                    />
                )
            }
        </div>
    );
}
