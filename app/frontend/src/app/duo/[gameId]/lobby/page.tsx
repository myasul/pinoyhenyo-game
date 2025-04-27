'use client';

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { useSocket } from '@/hooks/useSocket';
import React, { useEffect } from 'react';
import { DuoGameRole, SocketEvent } from 'shared';
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
    const { joinGame, leaveGame, playerSessionStatus, myPlayer } = useDuoGameSession(gameId)
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

    if (!isLobbyReady) {
        return (
            <main className="p-6 flex flex-col w-full h-full items-center justify-center bg-fil-yellow">
                <LoadingIcon size='100' />
            </main>
        )
    }

    return (
        playerSessionStatus === DuoGamePlayerSessionStatus.NewJoiner || !myPlayer
            ? <LobbyNewJoiner onJoin={joinGame} onExit={leaveGame} />
            : (
                <LobbyMain
                    players={players}
                    myPlayer={myPlayer}
                    onStartGame={handlers[SocketEvent.RequestStartGame]}
                    onExit={leaveGame}
                />
            )
    );
}
