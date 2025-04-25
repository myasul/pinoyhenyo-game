import 'dotenv/config'

// import * as express from 'express'
import express from 'express'
// import * as http from 'http'
import http from 'http'
// import * as cors from 'cors'
import cors from 'cors'
import { DefaultEventsMap, Server, Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
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
    players: Map<string, Player>
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


type GameSocketData = {
    gameId?: string | null
    playerId?: string | null
}

type GameSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, GameSocketData>

const gameMap: Map<string, Game> = new Map()

const getDefaultGameValues = (): Game => {
    return {
        players: new Map<string, Player>(),
        type: GameType.Unknown,
        settings: {
            duration: 60,
            passLimit: 3
        },
        timeRemaining: 0,
        passesRemaining: 0,
        passedWords: [],
    }
}

const stringifyGame = (game: Game) => {
    const { timeIntervalId, players, ...serializableProps } = game
    const playersObject = Object.fromEntries(players)

    return JSON.stringify({ ...serializableProps, players: playersObject }, null, 2)
}

const stringifyGameMap = (gameMap: Map<string, Game>) => {
    const gameMapObject = Object.fromEntries(gameMap)

    const serializedGameMap = Object.entries(gameMapObject).reduce((acc, [gameId, game]) => {
        const { timeIntervalId, players, ...serializableProps } = game
        const playersObject = Object.fromEntries(players)

        acc[gameId] = { ...serializableProps, players: playersObject }
        return acc
    }, {} as Record<string, unknown>)

    return JSON.stringify(serializedGameMap, null, 2)
}


const getDuoGameRole = (players: Map<string, Player>) => {
    // Get the first player in the map
    const player = players.values().next().value

    if (player) {
        return player.role === DuoGameRole.Guesser
            ? DuoGameRole.ClueGiver
            : DuoGameRole.Guesser
    } else {
        return DuoGameRole.Guesser
    }
}

function removePlayerFromGame(socket: GameSocket, gameId: string, playerId: string) {
    const game = gameMap.get(gameId);

    if (!game) return false;

    // Remove player from game
    game.players.delete(playerId);

    // Clean up socket data
    socket.data.gameId = null;
    socket.data.playerId = null;

    // Leave the room
    socket.leave(gameId);

    // If no players are left, clean up the game
    if (game.players.size === 0) {
        gameMap.delete(gameId);

        return true; // Game was deleted
    }

    console.log(`Player (ID: ${playerId}) removed from game (ID: ${gameId}).`);

    // Notify remaining players
    io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: Object.fromEntries(game.players) });

    return true; // Success
}


io.on('connection', (socket: GameSocket) => {
    socket.on(SocketEvent.Disconnect, () => {
        console.log('Player disconnected: ', socket.data)

        const { gameId: serverGameId, playerId } = socket.data
        const reconnectionGracePeriod = 10000

        setTimeout(() => {
            if (!(playerId && serverGameId)) return

            const isPlayerReconnected = Array.from(io.sockets.sockets.values()).some((socket) => {
                return socket.data.playerId === playerId && socket.data.gameId === serverGameId
            })

            if (isPlayerReconnected) return

            console.log(`Player (ID: ${playerId}) fully disconnected from game (ID: ${serverGameId}).`)

            removePlayerFromGame(socket, serverGameId, playerId)
        }, reconnectionGracePeriod)
    })

    socket.on(SocketEvent.RequestLeaveGame, ({ gameId: clientGameId }: { gameId: string }, callback) => {
        const { gameId: serverGameId, playerId } = socket.data

        if (!(serverGameId && playerId)) {
            const errorMessage = 'Game ID or Player ID not available'

            console.error(errorMessage)
            callback({ error: 'Unsupported game type. Only Duo mode is supported.' })

            return
        }

        if (serverGameId !== clientGameId) {
            const errorMessage = `Game ID mismatch: ${serverGameId} !== ${clientGameId}`

            console.error(errorMessage)
            callback({ error: errorMessage })

            return
        }

        const isPlayerSuccessfullyRemoved = removePlayerFromGame(socket, serverGameId, playerId)

        if (!isPlayerSuccessfullyRemoved) {
            const errorMessage = `Failed to remove player (ID: ${playerId}) from game (ID: ${serverGameId}).`

            console.error(errorMessage)
        }

        // Notify the player that they have left the game
        callback({ isPlayerSuccessfullyRemoved })
    })

    socket.on(
        SocketEvent.RequestJoinGame,
        (data: { gameId: string, gameType: GameType, playerName: string }, callback) => {
            console.log('[RequestJoinGame] games before joining: ', stringifyGameMap(gameMap))

            const { gameId, gameType, playerName } = data

            const playerId = uuid()

            socket.join(gameId)

            socket.data.gameId = gameId
            socket.data.playerId = playerId

            // const game = gameMap[gameId]
            let game = gameMap.get(gameId)

            // Start a new game
            if (!game) {
                game = { ...getDefaultGameValues(), type: gameType }

                gameMap.set(gameId, game)
            }

            console.log(
                `[${SocketEvent.RequestJoinGame}] Player joined game: `,
                JSON.stringify({ gameId, gameType, playerName, playerId }, null, 2)
            )

            // Only support Duo mode for now
            if (gameType !== GameType.Duo) {
                callback({ error: 'Unsupported game type. Only Duo mode is supported.' })
                return
            }


            const newPlayer: Player = {
                id: playerId,
                name: playerName,
                role: getDuoGameRole(game.players)
            }

            game.players.set(playerId, newPlayer)

            console.log('[RequestJoinGame] gameId: ', gameId)
            console.log('[RequestJoinGame] games after joining: ', stringifyGameMap(gameMap))

            io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: Object.fromEntries(game.players) })

            callback({ myPlayer: newPlayer })
        }
    )

    socket.on(
        SocketEvent.RequestRejoinGame,
        ({ gameId, rejoiningPlayer }: { gameId: string, rejoiningPlayer: Player }, callback) => {
            const game = gameMap.get(gameId)

            if (!game) {
                console.error(`Game (ID: ${gameId}) not found.`)
                callback({ error: 'Game not found' })
                return
            }

            if (!game.players.has(rejoiningPlayer.id)) {
                console.error(`Player (ID: ${rejoiningPlayer.id}) not found in game (ID: ${gameId}).`)
                callback({ error: 'Player not found in game' })
                return
            }

            socket.join(gameId)
            socket.data.gameId = gameId
            socket.data.playerId = rejoiningPlayer.id

            console.log(
                `[${SocketEvent.RequestRejoinGame}] Player rejoined game: `,
                JSON.stringify({ gameId, rejoiningPlayer }, null, 2)
            )

            game.players.set(rejoiningPlayer.id, rejoiningPlayer)

            console.log('[RequestRejoinGame] game: ', stringifyGame(game))

            io.to(gameId).emit(SocketEvent.NotifyPlayersUpdated, { updatedPlayers: Object.fromEntries(game.players) })

            callback({ myPlayer: rejoiningPlayer })
        }
    )

    socket.on(SocketEvent.RequestStartGame, async (data: { gameId: string, finalPlayers: Player[] }) => {
        console.log('[SocketEvent.RequestStartGame]')
        const { gameId, finalPlayers } = data

        const game = gameMap.get(gameId)

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
        const game = gameMap.get(gameId)

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        clearInterval(game.timeIntervalId)

        io.to(gameId).emit(SocketEvent.NotifyWordGuessSuccessful, { passedWords: game.passedWords })
    })

    socket.on(SocketEvent.RequestSwitchRole, ({ gameId }: { gameId: string }) => {
        const game = gameMap.get(gameId)

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        for (const player of Object.values(game.players)) {
            player.role = player.role === DuoGameRole.Guesser
                ? DuoGameRole.ClueGiver
                : DuoGameRole.Guesser
        }

        io.to(gameId).emit(SocketEvent.NotifyRoleSwitched, { updatedPlayers: Object.fromEntries(game.players) })
    })

    socket.on(SocketEvent.RequestBackToLobby, ({ gameId }: { gameId: string }) => {
        const game = gameMap.get(gameId)

        if (!game) {
            console.error(`Game (ID: ${gameId}) not found.`)
            return
        }

        io.to(gameId).emit(SocketEvent.NotifyBackToLobby)
    })

    socket.on(SocketEvent.RequestChangeGuessWord, async ({ gameId }: { gameId: string }) => {
        const game = gameMap.get(gameId)

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
