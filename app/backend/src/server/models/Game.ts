import { DuoGameRole, GameSettings, GameStatus, GameType, Player, SerializedGame, SupportedLanguages } from "@henyo/shared";
import { getRandomGuessWord } from "../../model/guess_word";

const DEFAULT_SETTINGS: GameSettings = {
    duration: 60,
    passes: 3,
    languagesUsed: [SupportedLanguages.English, SupportedLanguages.Tagalog],
}

export class Game {
    #hostId: string
    #players: Map<string, Player> = new Map()
    #status: GameStatus = GameStatus.Unknown
    #guessWord: string | null = null
    #timeRemaining = 0
    #passesRemaining = 0
    #timeIntervaldId?: NodeJS.Timeout
    #passedWords: string[] = []
    #settings: GameSettings = {
        duration: 60,
        passes: 3,
        languagesUsed: [],
    }
    #getRandomGuessWord: (languages?: SupportedLanguages[]) => Promise<string | null>

    constructor(
        public readonly id: string,
        public readonly hostPlayer: Player,
        public readonly type = GameType.Duo,
        settings: Partial<GameSettings> = {},
        getRandomGuessWordFunc = getRandomGuessWord,
    ) {
        this.#hostId = hostPlayer.id
        this.addPlayer(hostPlayer)
        this.#status = GameStatus.Pending

        this.#getRandomGuessWord = getRandomGuessWordFunc
        this.#settings = { ...DEFAULT_SETTINGS, ...settings }
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

    getPlayer(playerId: string): Player | undefined {
        return this.#players.get(playerId)
    }

    setHost(host: Player) {
        const player = this.#players.get(host.id)

        if (!player) {
            throw new Error(`Player (ID: ${host.id}) not found in game (ID: ${this.id}).`)
        }

        this.#hostId = host.id
    }

    getFirstPlayer(): Player | undefined {
        // Get the first player in the map
        return this.#players.values().next().value
    }

    getNextRole(): DuoGameRole {
        // Get the first player in the map
        const player = this.getFirstPlayer()

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
        settings: Partial<GameSettings>,
        onTick: (game: SerializedGame) => void,
        onGameStarted: (game: SerializedGame) => void,
        onGameOver: (game: SerializedGame) => void
    }) {
        const { settings, onTick, onGameOver, onGameStarted } = opts

        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)

        const timeIntervaldId = setInterval(() => {
            this.#timeRemaining -= 1
            onTick(this.serialize())

            if (this.#timeRemaining === 0) {
                clearInterval(this.#timeIntervaldId)
                this.#status = GameStatus.Lose

                onGameOver(this.serialize())
            }
        }, 1000)

        this.#settings = { ...this.#settings, ...settings }
        this.#timeIntervaldId = timeIntervaldId
        this.#timeRemaining = this.#settings.duration
        this.#passesRemaining = this.#settings.passes
        this.#guessWord = await this.#getRandomGuessWord(this.#settings.languagesUsed)
        this.#passedWords = []
        this.#status = GameStatus.Ongoing

        onGameStarted(this.serialize())
    }

    win(onGameWin: (game: SerializedGame) => void) {
        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)
        this.#timeIntervaldId = undefined
        this.#status = GameStatus.Win

        onGameWin(this.serialize())
    }

    async changeGuessWord(onChangeGuessWord: (game: SerializedGame) => void) {
        const currentGuessWord = this.#guessWord

        if (this.#passesRemaining === 0) return onChangeGuessWord(this.serialize())

        const nextGuessWord = await this.#getRandomGuessWord(this.#settings.languagesUsed)

        if (!nextGuessWord) return onChangeGuessWord(this.serialize())

        if (currentGuessWord) this.#passedWords.push(currentGuessWord)
        this.#guessWord = nextGuessWord
        this.#passesRemaining -= 1

        return onChangeGuessWord(this.serialize())
    }

    reset(onReset: (game: SerializedGame) => void) {
        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)
        this.#timeIntervaldId = undefined
        this.#timeRemaining = 0
        this.#passesRemaining = 0
        this.#guessWord = null
        this.#passedWords = []
        this.#status = GameStatus.Pending

        onReset(this.serialize())
    }

    switchRoles(onSwitchRoles: (game: SerializedGame) => void) {
        const players = this.players

        if (players.length < 2) return onSwitchRoles(this.serialize())

        for (const player of players) {
            player.role = player.role === DuoGameRole.Guesser
                ? DuoGameRole.ClueGiver
                : DuoGameRole.Guesser
        }

        onSwitchRoles(this.serialize())
    }

    pause(onPause: (game: SerializedGame) => void) {
        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)
        this.#timeIntervaldId = undefined
        this.#status = GameStatus.Paused

        onPause(this.serialize())
    }

    resume(opts: {
        onTick: (game: SerializedGame) => void,
        onResume: (game: SerializedGame) => void,
        onGameOver: (game: SerializedGame) => void
    }) {
        const { onTick, onResume, onGameOver } = opts

        if (this.#timeIntervaldId) clearInterval(this.#timeIntervaldId)

        this.#status = GameStatus.Ongoing

        const tickDelaySeconds = 1
        this.#timeIntervaldId = setInterval(() => {
            this.#timeRemaining -= tickDelaySeconds
            onTick(this.serialize())

            if (this.#timeRemaining === 0) {
                clearInterval(this.#timeIntervaldId)
                this.#timeIntervaldId = undefined
                this.#status = GameStatus.Lose

                onGameOver(this.serialize())
            }

            onResume(this.serialize())
        }, tickDelaySeconds * 1000)
    }

    serialize(): SerializedGame {
        const playersObject = Object.fromEntries(this.#players)

        return {
            hostId: this.#hostId,
            guessWord: this.#guessWord,
            timeRemaining: this.#timeRemaining,
            passesRemaining: this.#passesRemaining,
            passedWords: this.#passedWords,
            settings: this.#settings,
            type: this.type,
            players: playersObject,
            status: this.#status,
        }
    }

    stringify(): string {
        return JSON.stringify(this.serialize(), null, 2)
    }
}
