'use client';

import React, { useEffect } from 'react';
import { SocketEvent } from "@henyo/shared";

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { useSocket } from '@/hooks/useSocket';
import { useDuoGameSession } from '@/hooks/useDuoGameSession';
import LobbyNewJoiner from './components/LobbyNewJoiner';
import { LobbyMain } from './components/LobbyMain';
import { LoadingIcon } from '@/components/LoadingIcon';
import { PageLayout } from '@/components/PageLayout';
import { DuoGamePlayerSessionStatus } from '@/utils/constants';

type Props = {
    params: Promise<{ gameId: string }>
}

export default function LobbyPage({ params }: Props) {
    const { gameId } = React.use(params)

    const { players, handlers, settings, myPlayer, myPlayerStatus } = useDuoGameState(gameId)
    const { joinGame, leaveGame } = useDuoGameSession(gameId)
    const { socket } = useSocket()

    const isLobbyReady = [
        DuoGamePlayerSessionStatus.NewJoiner,
        DuoGamePlayerSessionStatus.Joined,
        DuoGamePlayerSessionStatus.Rejoined,
        DuoGamePlayerSessionStatus.Synced
    ].includes(myPlayerStatus)

    useEffect(() => {
        if (!socket) return

        socket.on(SocketEvent.NotifyPlayersUpdated, handlers[SocketEvent.NotifyPlayersUpdated])
        socket.on(SocketEvent.NotifyGameStarted, handlers[SocketEvent.NotifyGameStarted])
        socket.on(SocketEvent.NotifyRoleSwitched, handlers[SocketEvent.NotifyRoleSwitched])

        return (() => {
            socket.off(SocketEvent.NotifyPlayersUpdated)
            socket.off(SocketEvent.NotifyGameStarted)
            socket.off(SocketEvent.NotifyRoleSwitched)
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
                    onSwitchRole={handlers[SocketEvent.RequestSwitchRole]}
                    onExit={leaveGame}
                />
            )
    );
}
