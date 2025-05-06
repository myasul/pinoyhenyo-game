import { GameSettings, SupportedLanguages } from "@henyo/shared";

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

export const DefaultGameSettings: GameSettings = {
    duration: 60,
    passes: 3,
    languagesUsed: [SupportedLanguages.English, SupportedLanguages.Tagalog]
}

export enum DuoGamePlayerSessionStatus {
    Idle = 'IDLE',
    NewJoiner = 'NEW_JOINER',
    Joining = 'JOINING',
    Joined = 'JOINED',
    Rejoining = 'REJOINING',
    Rejoined = 'REJOINED',
    Left = 'LEFT',
    Syncing = 'SYNCING',
    Synced = 'SYNCED',
}
