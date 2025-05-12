import { v4 as uuid } from 'uuid'

import { Game } from "../models/Game";
import { GameSocket } from "../types";
import { Session } from "./Session";
import { DuoGameRole, GameType, Player } from "@henyo/shared";

type JoinGameData = {
    gameId: string
    playerName: string
    gameType: GameType
}

type LeaveGameData = {
    gameId: string
    playerId: string
}

export class GameManager {
    private games: Map<string, Game> = new Map();

    // TODO: Throw error if game is not found
    get(gameId: string, opts?: { shouldThrowIfNotFound: boolean }): Game | undefined {
        const { shouldThrowIfNotFound = false } = opts || {}

        const game = this.games.get(gameId)

        if (!game && shouldThrowIfNotFound) {
            throw new Error(`Game (ID: ${gameId}) not found.`)
        }

        return game
    }

    join(gameData: JoinGameData, socket: GameSocket): Game {
        const { gameId, playerName, gameType } = gameData

        const playerId = uuid()

        const session = this.getSession(socket)
        session.bind(gameId, playerId)

        let game = this.get(gameId);
        let joiningPlayer: Player | undefined

        if (!game) {
            joiningPlayer = {
                id: playerId,
                name: playerName,
                role: DuoGameRole.Guesser,
            }

            game = new Game(gameId, joiningPlayer, gameType)

            this.games.set(gameId, game)
        } else {
            joiningPlayer = {
                id: playerId,
                name: playerName,
                role: game.getNextRole(),
            }

            game.addPlayer(joiningPlayer)
        }

        return game
    }

    leave(gameData: LeaveGameData, socket: GameSocket) {
        const session = this.getSession(socket)
        const { gameId, playerId } = gameData

        if (!session.gameId || !session.playerId) {
            throw new Error("Game ID or Player ID not available")
        }

        if (!(session.gameId === gameId && session.playerId === playerId)) {
            throw new Error("Game/Player ID mismatch")
        }

        const game = this.get(gameId)

        if (!game) throw new Error("Game not found")

        game.removePlayer(playerId)

        const nextHost = game.getFirstPlayer()

        if (nextHost) {
            game.setHost(nextHost)
        } else {
            // If there are no players left in the game, remove it from the manager
            this.games.delete(gameId)
        }

        session.clear()

        return game
    }

    getSession(socket: GameSocket) {
        const session = new Session(socket)

        return session
    }
}
