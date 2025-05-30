import { DuoGameState } from "@/stores/duoGameStore"
import { DuoGamePlayerSessionStatus } from "@/utils/constants";
import { Player, SerializedGame, SocketEvent, SocketResponse } from "@henyo/shared"
import { SocketManager } from "./SocketManager";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export class DuoBaseClient {
    constructor(
        protected readonly gameId: string,
        protected readonly socketManager: SocketManager,
        protected readonly router: AppRouterInstance,
        protected readonly getStore: () => DuoGameState, // Store accessor function
    ) { }

    protected get store() {
        return this.getStore()
    }

    protected createSocketRequest<Callback extends (socketResponse: SocketResponse<never>) => void>(
        socketEvent: SocketEvent,
        requestData: Record<string, unknown> = {},
        callback?: Callback
    ) {
        const socket = this.socketManager.getSocket()

        socket.emit(socketEvent, { gameId: this.gameId, ...requestData }, callback)

        return this
    }

    protected createSocketNotificationHandler(redirectTo?: string) {
        return (game: SerializedGame) => {
            this.syncStore(game)

            if (redirectTo) this.router.push(redirectTo)
        }
    }

    protected syncStore(game: SerializedGame, myPlayer?: Player) {
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Syncing);

        if (myPlayer) {
            this.store.setMyPlayer(myPlayer);
        } else {
            const updatedMyPlayer = game.players[this.store.myPlayer?.id ?? ''];

            if (updatedMyPlayer) this.store.setMyPlayer(updatedMyPlayer);
        }

        // Sync common game state properties
        this.store.setHostId(game.hostId);
        this.store.setSettings(game.settings);
        this.store.setTimeRemaining(game.timeRemaining);
        this.store.setPassesRemaining(game.passesRemaining);
        this.store.setGuessWord(game.guessWord ?? null);
        this.store.setPlayers(Object.values(game.players));
        this.store.setPassedWords(game.passedWords);
        this.store.setStatus(game.status);

        // Add artificial delay to simulate syncing
        setTimeout(() => {
            this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Synced);
        }, 500);

        return this;
    }
}
