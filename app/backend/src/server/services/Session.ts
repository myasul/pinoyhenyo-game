import { GameSocket } from "../types";

export class Session {
    constructor(private socket: GameSocket) { }

    get gameId(): string | undefined {
        return this.socket.data.gameId
    }

    get playerId(): string | undefined {
        return this.socket.data.playerId
    }

    /**
     * Associate a socket with a game & player.
     * Also joins socket room
     */
    bind(gameId: string, playerId: string) {
        this.socket.data.gameId = gameId
        this.socket.data.playerId = playerId
        this.socket.join(gameId)
    }

    /**
     * Clear session data and leave socket room
     */
    clear() {
        if (this.gameId) this.socket.leave(this.gameId)
        this.socket.data.gameId = undefined
        this.socket.data.playerId = undefined

        this.socket.disconnect()
    }

    isStillConnected(connectedSockets: Map<string, GameSocket>): boolean {
        return Array.from(connectedSockets.values()).some(socket =>
            socket.data.playerId === this.playerId && socket.data.gameId === this.gameId
        )
    }
}
