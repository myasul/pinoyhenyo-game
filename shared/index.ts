export enum SocketEvent {
    // Client initiated
    RequestJoinGame = 'request:joinGame',
    RequestStartGame = 'request:startGame',
    RequestUpdateTimeLimit = 'request:updateTimeLimit',
    RequestWordGuessSuccessful = 'request:wordGuessSuccessful',
    RequestSwitchRole = 'request:switchRole',
    RequestBackToLobby = 'request:backToLobby',

    // Server initiated
    NotifyPlayersUpdated = 'notify:playersUpdated',
    NotifyGameStarted = 'notify:gameStarted',
    NotifyRemainingTimeUpdated = 'notify:remainingTimeUpdated',
    NotifyWordGuessUnsuccessful = 'notify:wordGuessUnsuccessful',
    NotifyWordGuessSuccessful = 'notify:wordGuessSuccessful',
    NotifyRoleSwitched = 'notify:roleSwitched',
    NotifyBackToLobby = 'notify:backToLobby',

    // Default Socket Events
    Disconnect = 'disconnect',
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