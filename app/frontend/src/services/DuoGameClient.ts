import { DuoGameState } from "@/stores/duoGameStore";
import { DuoGameRole, GameSettings, GameStatus, SerializedGame, SocketEvent, SocketResponse } from "@henyo/shared";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DuoBaseClient } from "./DuoBaseClient";
import { SocketManager } from "./SocketManager";

type NotificationSocketEvent = SocketEvent.NotifyGameStarted |
    SocketEvent.NotifyBackToLobby |
    SocketEvent.NotifyGuessWordChanged |
    SocketEvent.NotifyRoleSwitched |
    SocketEvent.NotifyPlayersUpdated |
    SocketEvent.NotifyWordGuessFailed |
    SocketEvent.NotifyWordGuessSuccessful |
    SocketEvent.NotifyGamePaused |
    SocketEvent.NotifyGameResumed |
    SocketEvent.NotifyRemainingTimeUpdated;

export class DuoGameClient extends DuoBaseClient {
    constructor(
        gameId: string,
        socket: SocketManager,
        router: AppRouterInstance,
        getStore: () => DuoGameState // Store accessor function
    ) {
        super(gameId, socket, router, getStore)
    }

    // Request methods (Outgoing)
    requestStartGame(settings: GameSettings) {
        return this.createSocketRequest(SocketEvent.RequestStartGame, { settings })
    }

    requestWordGuessSuccessful() {
        return this.createSocketRequest(SocketEvent.RequestWordGuessSuccessful)
    }

    requestSwitchRole() {
        return this.createSocketRequest(SocketEvent.RequestSwitchRole)
    }

    requestBackToLobby() {
        return this.createSocketRequest(SocketEvent.RequestBackToLobby)
    }


    requestChangeGuessWord() {
        return this.createSocketRequest(SocketEvent.RequestChangeGuessWord)
    }

    requestPauseGame() {
        return this.createSocketRequest(SocketEvent.RequestPauseGame)
    }

    requestResumeGame() {
        return this.createSocketRequest(
            SocketEvent.RequestResumeGame,
            {},
            (serverResponse: SocketResponse) => {
                if (!serverResponse.success) {
                    console.error('Failed to resume game. Error: ', serverResponse.error)
                    return
                }

                this.store.setStatus(GameStatus.Ongoing)
            }
        )
    }

    // Notification handlers (Incoming)

    // TODO: Refactor this to use the same pattern as the other handlers.
    private handlePlayersUpdated(game: SerializedGame) {
        const currentMyPlayer = this.store.myPlayer

        if (currentMyPlayer) {
            // Find the updated player in the new game state
            const updatedMyPlayer = game.players[currentMyPlayer.id] ||
                // A disconnected player will have a different id
                Object.values(game.players).find((player) => player.name === currentMyPlayer.name)

            if (!updatedMyPlayer) {
                console.error('Player not found in updated players')

                this.router.push('/')
                return
            }

            this.store.setMyPlayer(updatedMyPlayer)
        }

        this.store.setPlayers(Object.values(game.players))
        this.store.setHostId(game.hostId)
    }

    // TODO: Refactor this to use the same pattern as the other handlers.
    // The store sync should be done before the redirect.
    private handleGameStarted(game: SerializedGame) {
        this.syncStore(game)

        const path = this.store.myPlayer?.role === DuoGameRole.ClueGiver
            ? `/duo/${this.gameId}/clue-giver`
            : `/duo/${this.gameId}/guesser`

        this.router.push(path)
    }

    private notificationHandlers: Record<NotificationSocketEvent, (game: SerializedGame) => void> = {
        [SocketEvent.NotifyGameStarted]: this.handleGameStarted,
        [SocketEvent.NotifyBackToLobby]: this.createSocketNotificationHandler(`/duo/${this.gameId}/lobby`),
        [SocketEvent.NotifyGuessWordChanged]: this.createSocketNotificationHandler(),
        [SocketEvent.NotifyWordGuessSuccessful]: this.createSocketNotificationHandler(`/duo/${this.gameId}/results`),
        [SocketEvent.NotifyWordGuessFailed]: this.createSocketNotificationHandler(`/duo/${this.gameId}/results`),
        [SocketEvent.NotifyGamePaused]: this.createSocketNotificationHandler(),
        [SocketEvent.NotifyGameResumed]: this.createSocketNotificationHandler(),
        [SocketEvent.NotifyRemainingTimeUpdated]: this.createSocketNotificationHandler(),
        [SocketEvent.NotifyRoleSwitched]: this.handlePlayersUpdated,
        [SocketEvent.NotifyPlayersUpdated]: this.handlePlayersUpdated,
    }

    addNotificationEventListeners() {
        const socket = this.socketManager.getSocket()

        Object.entries(this.notificationHandlers).forEach(([event, handler]) => {
            socket.on(event, (game: SerializedGame) => { handler.call(this, game) })
        })
    }

    removeNotificationEventListeners() {
        const socket = this.socketManager.getSocket()

        Object.keys(this.notificationHandlers).forEach((event) => {
            socket.off(event)
        })
    }
}
