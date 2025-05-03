'use client';

import React, { useEffect } from 'react';
import { DuoGameRole, SocketEvent } from 'shared';

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { useSocket } from '@/hooks/useSocket';
import { useDuoGameSession } from '@/hooks/useDuoGameSession';
import LobbyNewJoiner from './components/LobbyNewJoiner';
import { LobbyMain } from './components/LobbyMain';
import { LoadingIcon } from '@/components/LoadingIcon';
import { PageLayout } from '@/components/PageLayout';
import { DuoGamePlayerSessionStatus } from '@/utils/constants';

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

    const { players, handlers, settings, myPlayer, myPlayerStatus } = useDuoGameState(gameId)
    const { joinGame, leaveGame } = useDuoGameSession(gameId)
    const { socket } = useSocket()

    console.log('LobbyPage', { players, handlers, settings, myPlayer, myPlayerStatus })

    const isLobbyReady = [
        DuoGamePlayerSessionStatus.NewJoiner,
        DuoGamePlayerSessionStatus.Joined,
        DuoGamePlayerSessionStatus.Rejoined
    ].includes(myPlayerStatus)

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
            <PageLayout className='justify-center'>
                <LoadingIcon />
            </PageLayout>
        )
    }

    return (
        myPlayerStatus === DuoGamePlayerSessionStatus.NewJoiner || !myPlayer
            ? <LobbyNewJoiner onJoin={joinGame} onExit={leaveGame} />
            : (
                <LobbyMain
                    players={players}
                    myPlayer={myPlayer}
                    settings={settings}
                    onStartGame={handlers[SocketEvent.RequestStartGame]}
                    onExit={leaveGame}
                />
            )
    );
}
