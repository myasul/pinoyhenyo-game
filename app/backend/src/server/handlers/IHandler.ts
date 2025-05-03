import { GameSocket } from "../types"

export interface IHandler {
    register(socket: GameSocket): void
}