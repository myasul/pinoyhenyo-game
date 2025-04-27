import { DefaultEventsMap, Socket } from 'socket.io';

export type GameSocketData = {
    gameId?: string;
    playerId?: string;
};

export type GameSocket = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    GameSocketData
>;
