export enum GameStatus {
    Started = 'STARTED',
    Win = 'WIN',
    Lose = 'LOSE',
    Waiting = 'WAITING',
    Unknown = 'UNKNOWN'
}

export enum DuoGamePage {
    Lobby = 'lobby',
    ClueGiver = 'clue-giver',
    Guesser = 'guesser',
    Results = 'results',
}

export enum Environment {
    Development = 'development',
    Production = 'production'
}