import { Server } from "socket.io";
import { GameType, Player, SerializedGame, SocketEvent, SocketResponse } from "shared";
import { v4 as uuid } from 'uuid'

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
        { gameId, gameType, playerName }: { gameId: string, gameType: GameType, playerName: string },
        callback: (response: SocketResponse<{ joiningPlayer: Player, game: SerializedGame }>) => void
    ) {
        const playerId = uuid()

        const session = this.gameManager.getSession(socket)

        session.bind(gameId, playerId)

        const game = this.gameManager.get(gameId) ?? this.gameManager.create(gameId, gameType)

        const joiningPlayer: Player = {
            id: playerId,
            name: playerName,
            role: game.getNextRole(),
        }

        game.addPlayer(joiningPlayer)

        this.io
            .to(game.id)
            .emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players });

        callback({ success: true, data: { joiningPlayer, game: game.serialize() } })
    }

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

        this.io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players })

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

    private onLeave(
        socket: GameSocket, data: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const session = this.gameManager.getSession(socket)

        if (!session.gameId || !session.playerId) {
            console.error("Game ID or Player ID not available")
            callback({ success: false, error: "Game ID or Player ID not available" })

            return
        }

        if (session.gameId !== data.gameId) {
            console.error("Game ID mismatch")
            callback({ success: false, error: "Game ID mismatch" })

            return
        }

        const game = this.gameManager.get(session.gameId)

        if (!game) {
            console.error("Game not found")
            callback({ success: false, error: "Game not found" })

            return
        }

        game.removePlayer(session.playerId)

        this.io
            .to(game.id)
            .emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players });

        if (game.isEmpty()) this.gameManager.remove(game.id)

        session.clear()

        callback({ success: true, data: null })
    }

    private onDisconnect(socket: GameSocket) {
        console.log(`[${SocketEvent.Disconnect}] Player disconnected: `, socket.id)
        
        const session = this.gameManager.getSession(socket)

        if (!session.gameId || !session.playerId) return

        const handlePlayerDisconnection = () => {
            const isStillConnected = session.isStillConnected(this.io.sockets.sockets)

            // Successfully reconnected
            if (isStillConnected) return

            const game = this.gameManager.get(session.gameId!)

            if (!game) return

            game.removePlayer(session.playerId!)

            this.io
                .to(game.id)
                .emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players });

            if (game.isEmpty()) this.gameManager.remove(game.id)

            session.clear()
        }

        setTimeout(handlePlayerDisconnection, DISCONNECTION_GRACE_PERIOD)
    }
}
