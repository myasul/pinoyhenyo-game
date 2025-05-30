import { DuoGameState } from "@/stores/duoGameStore";
import { DuoBaseClient } from "./DuoBaseClient";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DuoGamePlayerSessionStatus } from "@/utils/constants";
import { GameStatus, Player, SerializedGame, SocketEvent, SocketResponse } from "@henyo/shared";
import { SocketManager } from "./SocketManager";

export class DuoPlayerClient extends DuoBaseClient {
    private readonly playerLocalStorageKey: string

    constructor(
        gameId: string,
        socketManager: SocketManager,
        router: AppRouterInstance,
        getStore: () => DuoGameState, // Store accessor function
    ) {
        super(gameId, socketManager, router, getStore)

        this.playerLocalStorageKey = `henyo-duo-player-${this.gameId}`
    }

    requestJoinGame(playerName: string) {
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Joining)

        this.createSocketRequest(SocketEvent.RequestJoinGame, { playerName }, this.handleJoinGameResponse)

        return this
    }

    requestRejoinGame(rejoiningPlayer: Player) {
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Rejoining)

        this.createSocketRequest(
            SocketEvent.RequestRejoinGame,
            { rejoiningPlayer },
            socketReponse => this.handleRejoinGameResponse(socketReponse, rejoiningPlayer)
        )

        return this
    }

    requestLeaveGame() {
        // If the player hasn't joined the game yet (they haven't entered their name), 
        // we don't need to emit a leave game event
        if (this.store.myPlayer) {
            this.createSocketRequest(SocketEvent.RequestLeaveGame, { playerId: this.store.myPlayer.id })
        }

        // Remove player from the game
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Left)
        this.store.setMyPlayer(null)
        localStorage.removeItem(this.playerLocalStorageKey)

        this.socketManager.disconnect()

        console.log(`[leaveGame] Player ${this.store.myPlayer?.name ?? 'UNKNOWN'} left the game`)

        // Redirect to the home page
        this.router.push('/')
    }

    requestEnterGame() {
        this.createSocketRequest(SocketEvent.RequestEnterGame, {}, this.handleEnterGameResponse)
    }

    private handleEnterGameResponse = (socketResponse: SocketResponse<{ game: SerializedGame }>) => {
        if (!socketResponse.success) {
            console.error('Failed to enter the game. Error: ', socketResponse.error)
            this.router.push('/')
            return
        }

        const { game } = socketResponse.data

        const isPlayerAlreadyInGame = this.store.myPlayer
        const isPlayerRejoining = this.store.myPlayerStatus === DuoGamePlayerSessionStatus.Rejoining

        if (isPlayerAlreadyInGame || isPlayerRejoining) return

        const rejoiningPlayerData = localStorage.getItem(this.playerLocalStorageKey)
        const rejoiningPlayer = rejoiningPlayerData ? JSON.parse(rejoiningPlayerData) : null
        const isRejoiningPlayer = rejoiningPlayer && game && game.players[rejoiningPlayer.id]

        if (isRejoiningPlayer) {
            this.requestRejoinGame(rejoiningPlayer)
            return
        }

        const isGameFull = game && Object.values(game.players).length >= 2
        const hasGameStarted = this.store.status === GameStatus.Ongoing

        // TODO: Can improve UI/UX by showing a message to the user
        // before redirecting them to the home page
        if (hasGameStarted || isGameFull) {
            console.error('Game is full or has already started. Cannot join the game.')
            this.router.push('/')
            return
        }

        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.NewJoiner)
    }

    private handleJoinGameResponse = (socketResponse: SocketResponse<{ joiningPlayer: Player, game: SerializedGame }>) => {
        if (!socketResponse.success) {
            console.error('Failed to join game. Error: ', socketResponse.error)
            this.router.push('/')

            return
        }

        const { joiningPlayer, game } = socketResponse.data

        localStorage.setItem(this.playerLocalStorageKey, JSON.stringify(joiningPlayer))

        this.syncStore(game, joiningPlayer)

        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Joined)
    }

    private handleRejoinGameResponse = (
        socketResponse: SocketResponse<{ rejoiningPlayer: Player, game: SerializedGame }>,
        rejoiningPlayer: Player
    ) => {
        if (!socketResponse.success) {
            console.error(`Failed to rejoin game. 'Error: ${socketResponse.error}`)

            // Join the game as a new player
            this.requestJoinGame(rejoiningPlayer.name)
            return
        }

        this.syncStore(socketResponse.data.game, socketResponse.data.rejoiningPlayer)
        this.store.setMyPlayerStatus(DuoGamePlayerSessionStatus.Rejoined)
    }

    private handleReconnection = () => {
        const rejoiningPlayerData = localStorage.getItem(this.playerLocalStorageKey)
        const rejoiningPlayer = rejoiningPlayerData ? JSON.parse(rejoiningPlayerData) : null

        if (!rejoiningPlayer) return

        this.requestRejoinGame(rejoiningPlayer)
    }

    addNotificationEventListeners() {
        const socket = this.socketManager.getSocket()

        socket.on(SocketEvent.Connect, this.handleReconnection)
    }

    removeNotificationEventListeners() {
        const socket = this.socketManager.getSocket()

        socket.off(SocketEvent.Connect, this.handleReconnection)
    }
}