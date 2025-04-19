'use client';

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { Player } from '@/stores/duoGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useEffect } from 'react';
import { DuoGameRole, GameType, SocketEvent } from 'shared';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { useRouter } from 'next/navigation';
import { Play } from 'react-feather';
import { InviteLinkBtn } from '@/components/InviteLink';
import { WaveButton } from '@/components/WaveButton';

const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

export default function LobbyPage() {
    const { gameId, players, myPlayer, handlers } = useDuoGameState()
    const router = useRouter()
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
    }, [gameId, players, socket])

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyPlayersUpdated, handlers[SocketEvent.NotifyPlayersUpdated])
        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])

        return (() => {
            socket.off(SocketEvent.NotifyPlayersUpdated)
            socket.off(SocketEvent.NotifyGameStarted)
        })
    }, [socket, myPlayer, handlers])

    const handleBackClick = () => {
        router.push('/')
    }

    return (
        <main className="p-6 flex flex-col justify-between h-full">
            <div className='flex flex-col gap-6'>
                <section className='flex flex-col items-center'>
                    <h1 className='text-3xl mb-2 font-extrabold'>Players</h1>
                    <ul className='list-disc ml-6 mb-5'>
                        {Object.values(players).map((player, index) => (
                            <li key={index}>
                                {player.name} - {DuoGameRoleText[player.role]}
                                {player.id === myPlayer?.id && (<b> (you)</b>)}
                            </li>
                        ))}
                    </ul>
                    <InviteLinkBtn />
                </section>
                <section className='flex flex-col items-center'>
                    <h1 className='text-3xl mb-2 font-extrabold'>Settings</h1>
                </section>
            </div>
            <footer className='flex gap-1'>
                <WaveButton bgColor='bg-gray-300' className='w-1/6' textColor='text-gray-600' onClick={handleBackClick}>
                    <Play className='transform scale-x-[-1]' size='28' strokeWidth='2.5' />
                </WaveButton>
                <WaveButton
                    disabled={!(Object.values(players).length === 2 && myPlayer)}
                    className='flex-1 text-xl'
                    onClick={handlers[SocketEvent.RequestStartGame]}
                >
                    <span className='font-extrabold'>StartGame</span>
                </WaveButton>
            </footer>
        </main>
    );
}
