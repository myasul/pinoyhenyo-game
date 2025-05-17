import { DuoGameState } from "@/stores/duoGameStore";
import { DuoGamePlayerSessionStatus, GameStatus } from "@/utils/constants";
import { DuoGameRole, GameSettings, SerializedGame, SocketEvent } from "@henyo/shared";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type NotificationSocketEvent = SocketEvent.NotifyGameStarted |
    SocketEvent.NotifyBackToLobby |
    SocketEvent.NotifyGuessWordChanged |
    SocketEvent.NotifyRoleSwitched |
    SocketEvent.NotifyPlayersUpdated |
    SocketEvent.NotifyWordGuessFailed |
    SocketEvent.NotifyWordGuessSuccessful;

export class DuoGameClient {
    private notificationHandlers: Record<NotificationSocketEvent, (game: SerializedGame) => void> = {
        [SocketEvent.NotifyGameStarted]: this.handleNotifyGameStarted,
        [SocketEvent.NotifyBackToLobby]: this.handleNotifyBackToLobby,
        [SocketEvent.NotifyGuessWordChanged]: this.handleNotifyGuessWordChanged,
        [SocketEvent.NotifyRoleSwitched]: this.handlePlayersUpdated,
        [SocketEvent.NotifyPlayersUpdated]: this.handlePlayersUpdated,
        [SocketEvent.NotifyWordGuessSuccessful]: this.handleNotifyWordGuessSuccessful,
        [SocketEvent.NotifyWordGuessFailed]: this.handleNotifyWordGuessFailed,
    }

    constructor(
        private readonly gameId: string,
        private readonly socket: SocketIOClient.Socket,
        private readonly store: DuoGameState,
        private readonly router: AppRouterInstance
    ) { }

    // Request methods (Outgoing)

    requestStartGame(settings: GameSettings) {
        this.socket.emit(SocketEvent.RequestStartGame, { gameId: this.gameId, settings })
        return this
    }

    requestWordGuessSuccessful() {
        this.socket.emit(SocketEvent.RequestWordGuessSuccessful, { gameId: this.gameId })
        return this
    }

    requestSwitchRole() {
        this.socket.emit(SocketEvent.RequestSwitchRole, { gameId: this.gameId })
        return this
    }

    requestBackToLobby() {
        this.socket.emit(SocketEvent.RequestBackToLobby, { gameId: this.gameId })
        return this
    }


    requestChangeGuessWord() {
        this.socket.emit(SocketEvent.RequestChangeGuessWord, { gameId: this.gameId })
        return this
    }

    requestPauseGame() {
        this.socket.emit(SocketEvent.RequestPauseGame, { gameId: this.gameId })
        return this
    }

    requestResumeGame() {
        this.socket.emit(SocketEvent.RequestResumeGame, { gameId: this.gameId })
        return this
    }

    // Notification handlers (Incoming)

    private syncStore(game: SerializedGame) {
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Syncing)

        const updatedMyPlayer = this.store.myPlayer ? game.players[this.store.myPlayer.id] : undefined

        if (updatedMyPlayer) this.store.setMyPlayer(updatedMyPlayer)

        // add new player status (syncing)
        this.store.setHostId(game.hostId)
        this.store.setSettings(game.settings)
        this.store.setTimeRemaining(game.timeRemaining)
        this.store.setPassesRemaining(game.passesRemaining)
        this.store.setGuessWord(game.guessWord)
        this.store.setPlayers(Object.values(game.players))
        this.store.setPassedWords(game.passedWords)

        // Add artificial delay to simulate syncing
        setTimeout(() => {
            this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Synced)
        }, 500)
    }

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

    private handleNotifyGameStarted(game: SerializedGame) {
        this.syncStore(game)

        if (this.store.myPlayer?.role === DuoGameRole.ClueGiver) this.router.push(`/duo/${this.gameId}/clue-giver`)
        if (this.store.myPlayer?.role === DuoGameRole.Guesser) this.router.push(`/duo/${this.gameId}/guesser`)
    }

    private handleNotifyBackToLobby(game: SerializedGame) {
        this.syncStore(game)
        this.router.push(`/duo/${this.gameId}/lobby`)
    }

    private handleNotifyWordGuessSuccessful(game: SerializedGame) {
        this.syncStore(game)
        this.router.push(`/duo/${this.gameId}/results?status=${GameStatus.Win}`)
    }

    private handleNotifyWordGuessFailed(game: SerializedGame) {
        this.syncStore(game)
        this.router.push(`/duo/${this.gameId}/results?status=${GameStatus.Lose}`)
    }

    private handleNotifyGuessWordChanged(game: SerializedGame) {
        this.syncStore(game)
    }

    addNotificationEventListeners() {
        Object.entries(this.notificationHandlers).forEach(([event, handler]) => {
            this.socket.on(event, (game: SerializedGame) => { handler.call(this, game) })
        })
    }

    removeNotificationEventHandlers() {
        Object.keys(this.notificationHandlers).forEach((event) => {
            this.socket.off(event)
        })
    }
}