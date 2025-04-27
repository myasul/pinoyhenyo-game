import { Server } from "socket.io";
import { GameManager } from "./services/GameManager";
import { PlayerHandler } from "./handlers/PlayerHandler";
import { GameHandler } from "./handlers/GameHandler";
import { GameSocket } from "./types";

export function setupSocketHandlers(io: Server) {
    const gameManager = new GameManager();
    const playerHandler = new PlayerHandler(io, gameManager);
    const gameHandler = new GameHandler(io, gameManager);

    io.on("connection", (socket: GameSocket) => {
        console.log(`New client connected (ID: ${socket.id})`);

        playerHandler.register(socket);
        gameHandler.register(socket);
    });
}
