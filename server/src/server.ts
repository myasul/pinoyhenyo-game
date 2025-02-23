import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import * as emoji from 'node-emoji'

const app = express()

app.use(cors())

const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

export enum SocketEvent {
    // Client initiated
    RequestJoinGame = 'request:joinGame',
    RequestStartGame = 'request:startGame',
    RequestUpdateTimeLimit = 'request:updateTimeLimit',
    RequestWordGuessSuccessful = 'request:wordGuessSuccessful',

    // Server initiated
    NotifyPlayersUpdated = 'notify:playersUpdated',
    NotifyGameStarted = 'notify:gameStarted',
    NotifyRemainingTimeUpdated = 'notify:remainingTimeUpdated',
    NotifyWordGuessUnsusccessful = 'notify:wordGuessUnsuccessful',
    NotifyWordGuessSuccessful = 'notify:wordGuessSuccessful',

    // Default Socket Events
    Disconnect = 'disconnect',
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
    remainingTime: number
}

const rooms: Record<string, Room> = {}
const defaultRoomValues = {
    players: {},
    gameType: GameType.Unknown
}

const GameDefaults = {
    wordToGuess: 'Watermelon',
    timeLimit: 5
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

        io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { players: room.players })
    })

    socket.on(
        SocketEvent.RequestJoinGame,
        (data: { gameId: string, gameType: GameType, player: Player }) => {
            const { gameId, gameType, player } = data

            socket.join(gameId)
            socket.data.gameId = gameId

            if (!rooms[gameId]) {
                rooms[gameId] = { ...defaultRoomValues, gameType, remainingTime: GameDefaults.timeLimit }
            }

            console.log(
                `[${SocketEvent.RequestJoinGame}] Player joined room: `,
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

            io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { players: room.players })

            console.log(`[${SocketEvent.RequestJoinGame}] rooms: `, JSON.stringify(rooms, null, 2))
        }
    )

    socket.on(SocketEvent.RequestStartGame, (data: { gameId: string, finalPlayers: Player[] }) => {
        const { gameId, finalPlayers } = data

        const room = rooms[gameId]

        if (!room) {
            console.error(`Room (ID: ${gameId}) not found.`)
            return
        }

        const timeLimitIntervalId = setInterval(() => {
            room.remainingTime--

            io.to(gameId).emit(SocketEvent.NotifyRemainingTimeUpdated, room.remainingTime)

            if (room.remainingTime === 0) {
                clearInterval(timeLimitIntervalId)
                io.to(gameId).emit(SocketEvent.NotifyWordGuessUnsusccessful)
            }
        }, 1000)

        const gameStartedData = {
            finalPlayers,
            wordToGuess: GameDefaults.wordToGuess,
            remainingTime: GameDefaults.timeLimit,
            emoji: emoji.random().emoji
        }

        io.to(gameId).emit(SocketEvent.NotifyGameStarted, gameStartedData)
    })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port: ${PORT}`)
})
