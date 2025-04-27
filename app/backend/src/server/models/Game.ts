import { DuoGameRole, GameSettings, GameType, Player, SerializedGame } from "shared";
import { getRandomGuessWord } from "../../model/guess_word";
import { stringify } from "querystring";

export class Game {
    #players: Map<string, Player> = new Map()
    #guessWord: string | null = null
    #timeRemaining = 0
    #passesRemaining = 0
    #timeIntervaldId?: NodeJS.Timeout
    #passedWords: string[] = []
    #settings: GameSettings = {
        duration: 60,
        passLimit: 3
    }
    #getRandomGuessWord: () => Promise<string | null>

    constructor(
        public readonly id: string,
        public readonly type = GameType.Duo,
        getRandomGuessWordFunc = getRandomGuessWord,
    ) {
        this.#getRandomGuessWord = getRandomGuessWordFunc
    }

    get players() {
        return Object.values(Object.fromEntries(this.#players))
    }

    isEmpty(): boolean {
        return this.#players.size === 0
    }

    removePlayer(playerId: string) {
        this.#players.delete(playerId)
    }

    addPlayer(player: Player) {
        this.#players.set(player.id, player)
    }

    getNextRole(): DuoGameRole {
        // Get the first player in the map
        const player = this.#players.values().next().value

        if (player) {
            return player.role === DuoGameRole.Guesser
                ? DuoGameRole.ClueGiver
                : DuoGameRole.Guesser
        } else {
            return DuoGameRole.Guesser
        }
    }

    isPlayerInGame(playerId: string): boolean {
        return this.#players.has(playerId)
    }

    // TODO: Settings should be passed in the start method
    async start(opts: {
        tickDelaySeconds: number,
        onTick: (game: SerializedGame) => void,
        onGameStarted: (game: SerializedGame) => void,
        onGameOver: (game: SerializedGame) => void
    }) {
        const { tickDelaySeconds, onTick, onGameOver, onGameStarted } = opts

        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)

        const timeIntervaldId = setInterval(() => {
            this.#timeRemaining -= tickDelaySeconds
            onTick(this.serialize())

            if (this.#timeRemaining === 0) {
                clearInterval(this.#timeIntervaldId)
                onGameOver(this.serialize())
            }
        }, tickDelaySeconds * 1000)

        this.#timeIntervaldId = timeIntervaldId
        this.#timeRemaining = this.#settings.duration
        this.#passesRemaining = this.#settings.passLimit
        this.#guessWord = await this.#getRandomGuessWord()
        this.#passedWords = []

        onGameStarted(this.serialize())
    }

    end(onGameOver: (game: SerializedGame) => void) {
        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)
        this.#timeIntervaldId = undefined
        this.#timeRemaining = 0

        onGameOver(this.serialize())
    }

    async changeGuessWord(onChangeGuessWord: (game: SerializedGame) => void) {
        const currentGuessWord = this.#guessWord

        if (this.#passesRemaining === 0) return onChangeGuessWord(this.serialize())

        const nextGuessWord = await this.#getRandomGuessWord()

        if (!nextGuessWord) return  onChangeGuessWord(this.serialize())

        if (currentGuessWord) this.#passedWords.push(currentGuessWord)
        this.#guessWord = nextGuessWord
        this.#passesRemaining -= 1

        return onChangeGuessWord(this.serialize())
    }

    serialize(): SerializedGame {
        const playersObject = Object.fromEntries(this.#players)

        return {
            guessWord: this.#guessWord,
            timeRemaining: this.#timeRemaining,
            passesRemaining: this.#passesRemaining,
            passedWords: this.#passedWords,
            settings: this.#settings,
            type: this.type,
            players: playersObject
        }
    }

    stringify(): string {
        return JSON.stringify(this.serialize(), null, 2)
    }
}
