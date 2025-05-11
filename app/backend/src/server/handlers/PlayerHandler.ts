import { Server } from "socket.io";
import { GameType, Player, SerializedGame, SocketEvent, SocketResponse } from "@henyo/shared";

import { GameSocket } from "../types";
import { DISCONNECTION_GRACE_PERIOD } from "../constants";
import { GameManager } from "../services/GameManager";
import { IHandler } from "./IHandler";

export class PlayerHandler implements IHandler {
    constructor(
        private io: Server,
        private gameManager: GameManager
    ) { }

    register(socket: GameSocket) {
        socket.on(SocketEvent.Disconnect, () => this.onDisconnect(socket))
        socket.on(SocketEvent.RequestLeaveGame, (data, callback) => this.onLeave(socket, data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestJoinGame, (data, callback) => this.onJoin(socket, data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestRejoinGame, (data, callback) => this.onRejoin(socket, data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestEnterGame, (data, callback) => this.onEnter(socket, data, callback ?? this.defaultCallback))
    }

    private defaultCallback(response: SocketResponse) {
        return response
    }

    private onJoin(
        socket: GameSocket,
        gameData: { gameId: string, gameType: GameType, playerName: string },
        callback: (response: SocketResponse<{ joiningPlayer: Player, game: SerializedGame }>) => void
    ) {

        const game = this.gameManager.join(gameData, socket)

        const joiningPlayer = game.players.find(player => player.name === gameData.playerName)

        if (!joiningPlayer) {
            console.error(`Joining player (ID: ${gameData.playerName}) not found in game (ID: ${game.id}).`)
            callback({ success: false, error: `Joining player (ID: ${gameData.playerName}) not found in game (ID: ${game.id}).` })
            return
        }

        this.io
            .to(game.id)
            .emit(SocketEvent.NotifyPlayersUpdated, game.serialize());

        callback({ success: true, data: { joiningPlayer, game: game.serialize() } })
    }

    // TODO: Encapsulate rejoin logic in GameManager class
    private onRejoin(
        socket: GameSocket,
        { gameId, rejoiningPlayer }: { gameId: string, rejoiningPlayer: Player },
        callback: (response: SocketResponse<{ rejoiningPlayer: Player, game: SerializedGame }>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        if (!game.isPlayerInGame(rejoiningPlayer.id)) {
            console.error(`Player (ID: ${rejoiningPlayer.id}) not found in game (ID: ${gameId}).`)
            callback({
                success: false,
                error: `Player (ID: ${rejoiningPlayer.id}) not found in game (ID: ${gameId}).`
            })
            return
        }

        const session = this.gameManager.getSession(socket)
        session.bind(gameId, rejoiningPlayer.id)

        console.log(
            `[${SocketEvent.RequestRejoinGame}] Player rejoined game: `,
            JSON.stringify({ gameId, rejoiningPlayer }, null, 2)
        )

        game.addPlayer(rejoiningPlayer)

        this.io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, game.serialize())

        callback({ success: true, data: { rejoiningPlayer, game: game.serialize() } })
    }

    private onEnter(
        _socket: GameSocket,
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<{ game: SerializedGame | null }>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            callback({ success: true, data: { game: null } })
            return
        }

        callback({ success: true, data: { game: game.serialize() } })
    }

    // TODO: Encapsulate rejoin logic in GameManager class
    private onLeave(
        socket: GameSocket, data: { gameId: string, playerId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        try {
            const game = this.gameManager.leave(data, socket)

            this.io
                .to(game.id)
                .emit(SocketEvent.NotifyPlayersUpdated, game.serialize())

            callback({ success: true, data: null })
        } catch (err) {
            const error = err as Error

            console.error(`Error leaving game: ${error.message}`)
            callback({ success: false, error: `Error leaving game: ${error.message}` })
        }
    }

    private onDisconnect(socket: GameSocket) {
        console.log(`[${SocketEvent.Disconnect}] Player disconnected: `, socket.id)

        const session = this.gameManager.getSession(socket)

        const gameId = session.gameId
        const playerId = session.playerId

        if (!(gameId && playerId)) return

        const handlePlayerDisconnection = () => {
            const isStillConnected = session.isStillConnected(this.io.sockets.sockets)

            // Successfully reconnected
            if (isStillConnected) return

            console.log(
                `[${SocketEvent.Disconnect}] Player permanently disconnected: `,
                JSON.stringify({ gameId: session.gameId, playerId: session.playerId }, null, 2)
            )

            const game = this.gameManager.leave({ gameId, playerId }, socket)

            this.io
                .to(game.id)
                .emit(SocketEvent.NotifyPlayersUpdated, game.serialize())
        }

        setTimeout(handlePlayerDisconnection, DISCONNECTION_GRACE_PERIOD)
    }
}
