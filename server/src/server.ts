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
    Disconnect = 'disconnect',
    StartGame = 'startGame',
    GameStarted = 'gameStarted'
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

const getDuoGameRole = (players: { [playerId: string]: Player }) => {
    const playerCount = Object.keys(players).length

    if (playerCount === 0) return DuoGameRole.Guesser

    if (playerCount === 1) {
        const player = Object.values(players)[0]

        return player.role === DuoGameRole.Guesser
            ? DuoGameRole.ClueGiver
            : DuoGameRole.Guesser
    }

    return DuoGameRole.ClueGiver
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
                role: getDuoGameRole(room.players)
            }

            io.to(gameId).emit(SocketEvent.PlayerListUpdated, { players: room.players })

            console.log(`[${SocketEvent.JoinRoom}] rooms: `, JSON.stringify(rooms, null, 2))
        }
    )

    socket.on(SocketEvent.StartGame, (data: { gameId: string, finalPlayers: Player[] }) => {
        const { gameId, finalPlayers } = data

        const room = rooms[gameId]

        if (!room) {
            console.error(`Room (ID: ${gameId}) not found.`)
            return
        }

        // TODO: Implement logic to determine word to guess
        const wordToGuess = 'apple'

        console.log(`[${SocketEvent.StartGame}] Starting game for room (ID: ${gameId})`)

        const gameStartedData = { wordToGuess, finalPlayers }

        console.log(`[${SocketEvent.StartGame}] gameStartedData: `, JSON.stringify(gameStartedData, null, 2))

        io.to(gameId).emit(SocketEvent.GameStarted, gameStartedData)
    })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port: ${PORT}`)
})
