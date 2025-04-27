export enum SocketEvent {
    // Client initiated
    RequestJoinGame = 'request:joinGame',
    RequestRejoinGame = 'request:rejoinGame',
    RequestLeaveGame = 'request:leaveGame',
    RequestStartGame = 'request:startGame',
    RequestUpdateTimeLimit = 'request:updateTimeLimit',
    RequestWordGuessSuccessful = 'request:wordGuessSuccessful',
    RequestSwitchRole = 'request:switchRole',
    // TODO: Remove RequestBackToLobby logic
    RequestBackToLobby = 'request:backToLobby',
    RequestChangeGuessWord = 'request:changeGuessWord',
    RequestEnterGame = 'request:enterGame',

    // Server initiated
    NotifyPlayersUpdated = 'notify:playersUpdated',
    NotifyGameStarted = 'notify:gameStarted',
    NotifyRemainingTimeUpdated = 'notify:remainingTimeUpdated',
    NotifyWordGuessUnsuccessful = 'notify:wordGuessUnsuccessful',
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
    passLimit: number
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

export type SerializableServerGame = {
    players: Record<string, Player>
    type: GameType
    settings: GameSettings
    guessWord?: string
    timeRemaining: number
    passesRemaining: number
    passedWords: string[]
}
