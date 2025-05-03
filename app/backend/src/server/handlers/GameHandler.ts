import { Server } from "socket.io"
import { GameManager } from "../services/GameManager"
import { GameSocket } from "../types"
import { GameSettings, SocketEvent, SocketResponse } from "shared"
import { IHandler } from "./IHandler"

export class GameHandler implements IHandler {
    constructor(
        private io: Server,
        private gameManager: GameManager
    ) { }

    register(socket: GameSocket) {
        socket.on(SocketEvent.RequestStartGame, (data, callback) => this.onStartGame(data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestWordGuessSuccessful, (data, callback) => this.onWordGuessSuccessful(data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestChangeGuessWord, (data, callback) => this.onChangeGuessWord(data, callback ?? this.defaultCallback))
    }

    private defaultCallback(response: SocketResponse) {
        return response
    }

    private onStartGame(
        { gameId, settings }: { gameId: string, settings: GameSettings },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        game.start({
            tickDelaySeconds: 1,
            settings,
            onTick: (game) => {
                this.io.to(gameId).emit(SocketEvent.NotifyRemainingTimeUpdated, game.timeRemaining)
            },
            onGameOver: (game) => {
                this.io.to(gameId).emit(SocketEvent.NotifyWordGuessFailed, { passedWords: game.passedWords })
            },
            onGameStarted: (game) => {
                this.io.to(gameId).emit(SocketEvent.NotifyGameStarted, game)
            }
        })

        callback({ success: true, data: null })
    }

    private onWordGuessSuccessful(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        game.end((game) =>
            this.io.to(gameId).emit(SocketEvent.NotifyWordGuessSuccessful, { passedWords: game.passedWords })
        )

        callback({ success: true, data: null })
    }

    private onChangeGuessWord(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }
        game.changeGuessWord((game) =>
            this.io.to(gameId).emit(SocketEvent.NotifyGuessWordChanged, game)
        )

        callback({ success: true, data: null })
    }
}
