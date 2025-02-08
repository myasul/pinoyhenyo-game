import { create } from 'zustand'

export enum DuoGameRole {
    ClueGiver = 'CLUE_GIVER',
    Guesser = 'GUESSER'
}

export type DuoGameState = {
    gameId: string | null
    role: DuoGameRole | null
    currentWord: string | null
    setGameId: (id: string) => void
    setRole: (role: DuoGameRole) => void
    setCurrentWord: (currentWord: string) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    gameId: null,
    role: null,
    currentWord: null,
    setGameId: (id) => set({ gameId: id }),
    setRole: (role) => set({ role }),
    setCurrentWord: (currentWord) => set({ currentWord }),
}))
