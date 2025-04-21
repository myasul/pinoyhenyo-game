'use client';

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { useSocket } from '@/hooks/useSocket';
import React, { useCallback, useEffect } from 'react';
import { DuoGameRole, SocketEvent } from 'shared';
import { useRouter } from 'next/navigation';
import { DuoGamePlayerSessionStatus, useDuoGameSession } from '@/hooks/useDuoGameSession';
import LobbyNewJoiner from './components/LobbyNewJoiner';
import { LobbyMain } from './components/LobbyMain';
import { LoadingIcon } from '@/components/LoadingIcon';

export const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

type Props = {
    params: Promise<{ gameId: string }>
}

export default function LobbyPage({ params }: Props) {
    const { gameId } = React.use(params)

    const { players, handlers } = useDuoGameState(gameId)
    const { joinGame, playerSessionStatus, myPlayer } = useDuoGameSession(gameId)
    const router = useRouter()
    const { socket } = useSocket()

    const isLobbyReady = [
        DuoGamePlayerSessionStatus.NewJoiner,
        DuoGamePlayerSessionStatus.Joined,
        DuoGamePlayerSessionStatus.Rejoined
    ].includes(playerSessionStatus)

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyPlayersUpdated, handlers[SocketEvent.NotifyPlayersUpdated])
        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])

        return (() => {
            socket.off(SocketEvent.NotifyPlayersUpdated)
            socket.off(SocketEvent.NotifyGameStarted)
        })
    }, [socket, myPlayer, handlers])

    const handleBackClick = useCallback(() => {
        socket.disconnect()
        router.push('/')
    }, [socket, router])

    if (!isLobbyReady) {
        return (
            <main className="p-6 flex flex-col w-full h-full items-center justify-center bg-fil-yellow">
                <LoadingIcon size='100' />
            </main>
        )
    }

    return (
        playerSessionStatus === DuoGamePlayerSessionStatus.NewJoiner
            ? <LobbyNewJoiner onJoin={joinGame} onExit={handleBackClick} />
            : (
                <LobbyMain
                    players={players}
                    myPlayer={myPlayer}
                    onStartGame={handlers[SocketEvent.RequestStartGame]}
                    onExit={handleBackClick}
                />
            )
    );
}
