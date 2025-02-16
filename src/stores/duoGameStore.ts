import { create } from 'zustand'

export enum DuoGameRole {
    ClueGiver = 'CLUE_GIVER',
    Guesser = 'GUESSER',
    Unknown = 'UNKNOWN'
}

export type Player = {
    id: string
    name: string
    role: DuoGameRole
}

export type DuoGameState = {
    gameId: string | null
    hostId: string | null
    role: DuoGameRole | null
    currentWord: string | null
    players: Player[]
    setGameId: (id: string) => void
    setRole: (role: DuoGameRole) => void
    setCurrentWord: (currentWord: string) => void
    setHostId: (hostId: string) => void
    setPlayers: (players: Player[]) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    gameId: null,
    hostId: null,
    role: null,
    currentWord: null,
    players: [],
    setGameId: (id) => set({ gameId: id }),
    setRole: (role) => set({ role }),
    setCurrentWord: (currentWord) => set({ currentWord }),
    setHostId: (hostId) => set({ hostId }),
    setPlayers: (players) => set({ players })
}))
