import { Server } from "socket.io"
import { GameManager } from "../services/GameManager"
import { GameSocket } from "../types"
import { GameSettings, SocketEvent, SocketResponse } from "@henyo/shared"
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
        socket.on(SocketEvent.RequestBackToLobby, (data, callback) => this.onBackToLobby(data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestSwitchRole, (data, callback) => this.onSwitchRoles(data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestResumeGame, (data, callback) => this.onResumeGame(data, callback ?? this.defaultCallback))
        socket.on(SocketEvent.RequestPauseGame, (data, callback) => this.onPauseGame(data, callback ?? this.defaultCallback))
    }

    private defaultCallback(response: SocketResponse) {
        return response
    }

    private onStartGame(
        // Remove settings from the request since this will
        // handled by RequestUpdateSettings event
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
            settings,
            onTick: (game) => this.io.to(gameId).emit(SocketEvent.NotifyRemainingTimeUpdated, game.timeRemaining),
            onGameOver: (game) => this.io.to(gameId).emit(SocketEvent.NotifyWordGuessFailed, { passedWords: game.passedWords }),
            onGameStarted: (game) => this.io.to(gameId).emit(SocketEvent.NotifyGameStarted, game)
        })

        callback({ success: true, data: null })
    }

    private onBackToLobby(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        game.reset((game) => this.io.to(gameId).emit(SocketEvent.NotifyBackToLobby, game))

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

    private onSwitchRoles(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }
        game.switchRoles((game) => this.io.to(gameId).emit(SocketEvent.NotifyRoleSwitched, game))

        callback({ success: true, data: null })
    }

    private onPauseGame(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        game.pause((game) => this.io.to(gameId).emit(SocketEvent.NotifyGamePaused, game))

        callback({ success: true, data: null })
    }

    private onResumeGame(
        { gameId }: { gameId: string },
        callback: (response: SocketResponse<null>) => void
    ) {
        const game = this.gameManager.get(gameId)

        if (!game) {
            console.error(`ServerGame (ID: ${gameId}) not found.`)
            callback({ success: false, error: `ServerGame (ID: ${gameId}) not found.` })
            return
        }

        game.resume({
            onTick: (game) => this.io.to(gameId).emit(SocketEvent.NotifyRemainingTimeUpdated, game.timeRemaining),
            onGameOver: (game) => this.io.to(gameId).emit(SocketEvent.NotifyWordGuessFailed, { passedWords: game.passedWords }),
            onResume: (game) => this.io.to(gameId).emit(SocketEvent.NotifyGameResumed, game)
        })

        callback({ success: true, data: null })
    }
}
