import { DuoGameState } from "@/stores/duoGameStore";
import { DuoGameClient } from "./DuoGameClient";
import { DuoPlayerClient } from "./DuoPlayerClient";
import { SocketManager } from "./SocketManager";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export class DuoGameManager {
    public readonly gameClient: DuoGameClient
    public readonly playerClient: DuoPlayerClient

    constructor(
        gameId: string,
        socketManager: SocketManager,
        router: AppRouterInstance,
        getStore: () => DuoGameState, // Store accessor function
    ) {
        this.gameClient = new DuoGameClient(gameId, socketManager, router, getStore)
        this.playerClient = new DuoPlayerClient(gameId, socketManager, router, getStore)
    }

    setup() {
        this.gameClient.addNotificationEventListeners()
        this.playerClient.addNotificationEventListeners()
        this.playerClient.requestEnterGame()
    }

    cleanup() {
        this.gameClient.removeNotificationEventListeners()
        this.playerClient.removeNotificationEventListeners()
    }
}
