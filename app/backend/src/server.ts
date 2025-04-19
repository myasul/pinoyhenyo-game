import 'dotenv/config'

import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { DuoGameRole, GameType, SocketEvent } from 'shared'
import { getRandomGuessWord, GuessWord } from './model/guess_word'

const app = express()

app.use(cors())

const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

type Player = {
    id: string
    name: string
    role: DuoGameRole
}

type GameSettings = {
    duration: number
    passLimit: number
}

type Game = {
    players: { [playerId: string]: Player }
    type: GameType
    settings: GameSettings
    guessWord?: string
    timeRemaining: number
    passesRemaining: number
    timeIntervalId?: NodeJS.Timeout
    passedWords: string[]
}

type GameStartedData = {
    finalPlayers: Player[]
    guessWord: string
    duration: number
    timeRemaining: number
    passesRemaining: number
}

const gameMap: Record<string, Game> = {}
const defaultGameValues: Game = {
    players: {},
    type: GameType.Unknown,
    settings: {
        duration: 60,
        passLimit: 3
    },
    timeRemaining: 0,
    passesRemaining: 0,
    passedWords: [],
}

const getDuoGameRole = (players: { [playerId: string]: Player }) => {
    const playerCount = Object.keys(players).length

    if (playerCount === 0) {
        return DuoGameRole.Guesser
    } else {
        const player = Object.values(players)[0]

        return player.role === DuoGameRole.Guesser
            ? DuoGameRole.ClueGiver
            : DuoGameRole.Guesser
    }
}

io.on('connection', (socket) => {
    socket.on(SocketEvent.Disconnect, () => {
        console.log('Player disconnected: ', socket.id)

        const gameId = socket.data.gameId

        if (!gameId) {
            // TODO: Redirect to home page
            console.error('Game ID not available')
            return
        }

        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        delete game.players[socket.id]

        if (Object.keys(game.players).length === 0) {
            delete gameMap[gameId]
            return
        }

        io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players })
    })

    socket.on(
        SocketEvent.RequestJoinGame,
        (data: { gameId: string, type: GameType, player: Player }) => {
            const { gameId, type, player } = data

            socket.join(gameId)
            socket.data.gameId = gameId

            if (!gameMap[gameId]) {
                gameMap[gameId] = { ...defaultGameValues, type }
            }

            console.log(
                `[${SocketEvent.RequestJoinGame}] Player joined game: `,
                JSON.stringify({ gameId, type, player }, null, 2)
            )

            // Only support Duo mode for now
            if (type !== GameType.Duo) return

            const game = gameMap[gameId]

            game.players[socket.id] = {
                id: player.id,
                name: player.name,
                role: getDuoGameRole(game.players)
            }

            io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: game.players })

            // console.log(`[${SocketEvent.RequestJoinGame}] gameMap: `, JSON.stringify(gameMap, null, 2))
        }
    )

    socket.on(SocketEvent.RequestStartGame, async (data: { gameId: string, finalPlayers: Player[] }) => {
        console.log('[SocketEvent.RequestStartGame]')
        const { gameId, finalPlayers } = data

        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        if (game.timeIntervalId) clearInterval(game.timeIntervalId)

        const timeLimitIntervalId = setInterval(() => {
            game.timeRemaining -= 1

            io.to(gameId).emit(SocketEvent.NotifyRemainingTimeUpdated, game.timeRemaining)

            if (game.timeRemaining === 0) {
                clearInterval(timeLimitIntervalId)
                io.to(gameId).emit(SocketEvent.NotifyWordGuessUnsuccessful, { passedWords: game.passedWords })
            }
        }, 1000)

        game.timeIntervalId = timeLimitIntervalId
        game.timeRemaining = game.settings.duration
        game.passesRemaining = game.settings.passLimit
        game.guessWord = await getRandomGuessWord()
        game.passedWords = []

        const gameStartedData: GameStartedData = {
            finalPlayers,
            guessWord: game.guessWord || '',
            timeRemaining: game.timeRemaining,
            passesRemaining: game.settings.passLimit,
            duration: game.settings.duration,
        }

        io.to(gameId).emit(SocketEvent.NotifyGameStarted, { ...gameStartedData })
    })

    socket.on(SocketEvent.RequestWordGuessSuccessful, ({ gameId }: { gameId: string }) => {
        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        clearInterval(game.timeIntervalId)

        io.to(gameId).emit(SocketEvent.NotifyWordGuessSuccessful, { passedWords: game.passedWords })
    })

    socket.on(SocketEvent.RequestSwitchRole, ({ gameId }: { gameId: string }) => {
        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        for (const player of Object.values(game.players)) {
            player.role = player.role === DuoGameRole.Guesser
                ? DuoGameRole.ClueGiver
                : DuoGameRole.Guesser
        }

        io.to(gameId).emit(SocketEvent.NotifyRoleSwitched, { updatedPlayers: game.players })
    })

    socket.on(SocketEvent.RequestBackToLobby, ({ gameId }: { gameId: string }) => {
        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        io.to(gameId).emit(SocketEvent.NotifyBackToLobby)
    })

    socket.on(SocketEvent.RequestChangeGuessWord, async ({ gameId }: { gameId: string }) => {
        const game = gameMap[gameId]

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        const randomGuessWord = await getRandomGuessWord()

        game.passedWords.push(game.guessWord ?? '')
        game.guessWord = randomGuessWord
        game.passesRemaining -= 1

        io.to(gameId).emit(
            SocketEvent.NotifyGuessWordChanged,
            { guessWord: game.guessWord, passesRemaining: game.passesRemaining }
        )
    })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port: ${PORT}`)
})
