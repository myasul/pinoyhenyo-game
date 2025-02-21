export enum GameState{
    Started = 'STARTED',
    Won = 'WON',
    Lost = 'LOST',
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

export enum SocketEvent {
    JoinRoom = 'joinRoom',
    PlayerListUpdated = 'playerListUpdated',
    Disconnect = 'disconnect',
    StartGame = 'startGame',
    GameStarted = 'gameStarted',
    UpdateTimeLimit = 'updateTimeLimit',
    TimeLimitReached = 'timeLimitReached'
}
