export enum GameStatus {
    Started = 'STARTED',
    Win = 'WIN',
    Lose = 'LOSE',
    Waiting = 'WAITING',
    Unknown = 'UNKNOWN'
}

export enum DuoGameRole {
    ClueGiver = 'CLUE_GIVER',
    Guesser = 'GUESSER',
    Unknown = 'UNKNOWN'
}

export enum GameType {
    Classic = 'CLASSIC',
    Duo = 'DUO',
    Battle = 'BATTLE'
}

export enum OutdatedSocketEvent {
    JoinRoom = 'joinRoom',
    PlayerListUpdated = 'playerListUpdated',
    Disconnect = 'disconnect',
    StartGame = 'startGame',
    GameStarted = 'gameStarted',
    UpdateTimeLimit = 'updateTimeLimit',
    TimeLimitReached = 'timeLimitReached'
}

export enum SocketEvent {
    // Client initiated
    RequestJoinGame = 'request:joinGame',
    RequestStartGame = 'request:startGame',
    RequestUpdateTimeLimit = 'request:updateTimeLimit',
    RequestWordGuessSuccessful = 'request:wordGuessSuccessful',
    RequestSwitchRole = 'request:switchRole',

    // Server initiated
    NotifyPlayersUpdated = 'notify:playersUpdated',
    NotifyGameStarted = 'notify:gameStarted',
    NotifyRemainingTimeUpdated = 'notify:remainingTimeUpdated',
    NotifyWordGuessUnsuccessful = 'notify:wordGuessUnsuccessful',
    NotifyWordGuessSuccessful = 'notify:wordGuessSuccessful',
    NotifyRoleSwitched = 'notify:roleSwitched',

    // Default Socket Events
    Disconnect = 'disconnect',
}