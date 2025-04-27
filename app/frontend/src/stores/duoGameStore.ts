import { DuoGameRole } from 'shared'
import { create } from 'zustand'

export type Player = {
    id: string
    name: string
    role: DuoGameRole
}

export interface DuoGameState {
    role: DuoGameRole | null
    guessWord: string | null
    myPlayer: Player | null
    players: Player[]
    timeRemaining: number
    duration: number
    passesRemaining: number
    passedWords: string[]
    setRole: (role: DuoGameRole) => void
    setGuessWord: (guessWord: string | null) => void
    setPlayers: (players: Player[]) => void
    setTimeRemaining: (timeRemaining: number) => void
    setPassesRemaining: (passesRemaining: number) => void
    setDuration: (duration: number) => void
    setMyPlayer: (player: Player | null) => void
    setPassedWords: (passedWords: string[]) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    role: null,
    guessWord: null,
    players: [],
    timeRemaining: 0,
    passesRemaining: 0,
    duration: 0,
    myPlayer: null,
    passedWords: [],
    setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
    setPassesRemaining: (passesRemaining) => set({ passesRemaining }),
    setDuration: (duration) => set({ duration }),
    setRole: (role) => set({ role }),
    setGuessWord: (guessWord) => set({ guessWord }),
    setPlayers: (players) => set({ players }),
    setMyPlayer: (player) => set({ myPlayer: player }),
    setPassedWords: (passedWords) => set({ passedWords }),
}))
