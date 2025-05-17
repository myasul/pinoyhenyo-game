'use client';

import React from 'react';

import { useDuoGameState } from '@/hooks/useDuoGameState';
import { useDuoGamePlayerSession } from '@/hooks/useDuoGamePlayerSession';
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
    const { players, settings, myPlayer, myPlayerStatus, hostId, gameClient } = useDuoGameState(gameId)
    const { joinGame, leaveGame } = useDuoGamePlayerSession(gameId)

    const isLobbyReady = [
        DuoGamePlayerSessionStatus.NewJoiner,
        DuoGamePlayerSessionStatus.Joined,
        DuoGamePlayerSessionStatus.Rejoined,
        DuoGamePlayerSessionStatus.Synced
    ].includes(myPlayerStatus)

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
                    onStartGame={(updatedSettings) => gameClient.requestStartGame(updatedSettings)}
                    onSwitchRole={() => gameClient.requestSwitchRole()}
                    onExit={leaveGame}
                    isHost={myPlayer.id === hostId}
                />
            )
    );
}
