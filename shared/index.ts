export enum SocketEvent {
    // Client initiated
    RequestJoinGame = 'request:joinGame',
    RequestRejoinGame = 'request:rejoinGame',
    RequestLeaveGame = 'request:leaveGame',
    RequestStartGame = 'request:startGame',
    RequestUpdateTimeLimit = 'request:updateTimeLimit',
    RequestWordGuessSuccessful = 'request:wordGuessSuccessful',
    RequestSwitchRole = 'request:switchRole',
    RequestBackToLobby = 'request:backToLobby',
    RequestChangeGuessWord = 'request:changeGuessWord',
    RequestEnterGame = 'request:enterGame',

    // Server initiated
    NotifyPlayersUpdated = 'notify:playersUpdated',
    NotifyGameStarted = 'notify:gameStarted',
    NotifyRemainingTimeUpdated = 'notify:remainingTimeUpdated',
    NotifyWordGuessFailed = 'notify:wordGuessFailed',
    NotifyWordGuessSuccessful = 'notify:wordGuessSuccessful',
    NotifyRoleSwitched = 'notify:roleSwitched',
    NotifyBackToLobby = 'notify:backToLobby',
    NotifyGuessWordChanged = 'notify:guessWordChanged',

    // Default Socket Events
    Disconnect = 'disconnect',
    Connect = 'connect',
}

export enum DuoGameRole {
    ClueGiver = 'CLUE_GIVER',
    Guesser = 'GUESSER',
    Unknown = 'UNKNOWN'
}

export enum GameType {
    Classic = 'CLASSIC',
    Duo = 'DUO',
    Battle = 'BATTLE',
    Unknown = 'UNKNOWN'
}

export type Player = {
    id: string
    name: string
    role: DuoGameRole
}

export type GameSettings = {
    duration: number
    passes: number
    languagesUsed: SupportedLanguages[]
}

export type ServerGame = {
    players: Map<string, Player>
    type: GameType
    settings: GameSettings
    guessWord?: string
    timeRemaining: number
    passesRemaining: number
    timeIntervalId?: NodeJS.Timeout
    passedWords: string[]
}

export type SerializedGame = {
    players: Record<string, Player>
    type: GameType
    settings: GameSettings
    guessWord: string | null
    timeRemaining: number
    passesRemaining: number
    passedWords: string[]
}

export enum SupportedLanguages {
    English = 'en',
    Tagalog = 'tl',
}

/**
 * Standardized response for client callbacks
 */
export type SocketResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };
