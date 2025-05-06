import { Game } from "../models/Game";
import { GameSocket } from "../types";
import { Session } from "./Session";
import { GameType } from "@henyo/shared";

export class GameManager {
    private games: Map<string, Game> = new Map();

    get(gameId: string): Game | undefined {
        return this.games.get(gameId)
    }

    create (gameId: string, gameType: GameType): Game {
        const game = new Game(gameId, gameType)

        this.games.set(gameId, game)

        return game
    }

    remove(gameId: string) {
        this.games.delete(gameId)
    }

    getSession(socket: GameSocket) {
        const session = new Session(socket)

        return session
    }
}
