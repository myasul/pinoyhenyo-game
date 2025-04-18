'use client';

import { Button } from '@/components/Button';
import { useDuoGameState } from '@/hooks/useDuoGameState';
import { Player } from '@/stores/duoGameStore';
import { useSocket } from '@/hooks/useSocket';
import { useEffect } from 'react';
import { DuoGameRole, GameType, SocketEvent } from 'shared';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'react-feather';

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

    const handleCopyLinkClick = async () => {
        try {
            // TODO: Change the text to Copied when successfully copied.
            await navigator.clipboard.writeText(window.location.href)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    return (
        <main className="p-6 flex flex-col justify-between h-full">
            <div className='flex flex-col gap-6'>
                <section>
                    <h1 className='text-3xl mb-2 font-extrabold'>Players: </h1>
                    <ul className='list-disc ml-6'>
                        {Object.values(players).map((player, index) => (
                            <li key={index}>
                                {player.name} - {DuoGameRoleText[player.role]}
                                {player.id === myPlayer?.id && (<b> (you)</b>)}
                            </li>
                        ))}
                    </ul>
                    <Button label='Copy invite link' className='w-full text-gray-500 mt-10 text-lg' onClick={handleCopyLinkClick} />
                </section>
                <section>
                    <h1 className='text-3xl mb-2 font-extrabold'>Settings: </h1>
                </section>
            </div>
            <footer className='flex gap-1'>
                <Button label={<ChevronLeft size='28' strokeWidth='2.5' />} className='w-20 text-gray-500' onClick={handleBackClick} />
                <Button
                    variant='primary'
                    label='Start Game'
                    disabled={!(Object.values(players).length === 2 && myPlayer)}
                    className='flex-1 text-xl'
                    onClick={handlers[SocketEvent.RequestStartGame]}
                />
            </footer>
        </main>
    );
}
