import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()

app.use(cors())

const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

enum SocketEvent {
    JoinRoom = 'joinRoom',
    PlayerListUpdated = 'playerListUpdated',
    Disconnect = 'disconnect'

}

export enum DuoGameRole {
    ClueGiver = 'CLUE_GIVER',
    Guesser = 'GUESSER'
}

enum GameType {
    Classic = 'CLASSIC',
    Duo = 'DUO',
    Battle = 'BATTLE',
    Unknown = 'UNKNOWN'
}

type Player = {
    id: string
    name: string
    role: DuoGameRole
}

type Room = {
    players: { [playerId: string]: Player }
    gameType: GameType
}

const rooms: Record<string, Room> = {}
const defaultRoomValues = {
    players: {},
    gameType: GameType.Unknown
}

io.on('connection', (socket) => {
    socket.on(SocketEvent.Disconnect, () => {
        console.log('Player disconnected: ', socket.id)

        const gameId = socket.data.gameId

        if (!gameId) {
            console.error('Game ID not available')
            return
        }

        const room = rooms[gameId]

        if (!room) {
            console.error(`Room (ID: ${gameId}) not found.`)
            return
        }

        delete room.players[socket.id]

        if (Object.keys(room.players).length === 0) {
            delete rooms[gameId]
            return
        }

        io.to(gameId).emit(SocketEvent.PlayerListUpdated, { players: room.players })
    })

    socket.on(
        SocketEvent.JoinRoom,
        (data: { gameId: string, gameType: GameType, player: Player }) => {
            const { gameId, gameType, player } = data

            socket.join(gameId)
            socket.data.gameId = gameId

            if (!rooms[gameId]) {
                rooms[gameId] = { ...defaultRoomValues, gameType }
            }

            console.log(
                `[${SocketEvent.JoinRoom}] Player joined room: `,
                JSON.stringify({ gameId, gameType, player }, null, 2)
            )

            // Only support Duo mode for now
            if (gameType !== GameType.Duo) return

            const room = rooms[gameId]

            room.players[socket.id] = {
                id: player.id,
                name: player.name,
                role: Object.keys(room.players).length === 0
                    ? DuoGameRole.Guesser
                    : DuoGameRole.ClueGiver
            }

            io.to(gameId).emit(SocketEvent.PlayerListUpdated, { players: room.players })

            console.log(`[${SocketEvent.JoinRoom}] rooms: `, JSON.stringify(rooms, null, 2))
        }
    )
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port: ${PORT}`)
})
