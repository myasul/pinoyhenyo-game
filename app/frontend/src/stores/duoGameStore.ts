import { DuoGameRole } from 'shared'
import { create } from 'zustand'

export type Player = {
    id: string
    name: string
    role: DuoGameRole
}

export type DuoGameState = {
    hostId: string | null
    role: DuoGameRole | null
    guessWord: string | null
    myPlayer: Player | null
    players: Player[]
    timeRemaining: number
    duration: number
    passesRemaining: number
    setRole: (role: DuoGameRole) => void
    setGuessWord: (guessWord: string) => void
    setHostId: (hostId: string) => void
    setPlayers: (players: Player[]) => void
    setTimeRemaining: (timeRemaining: number) => void
    setPassesRemaining: (passesRemaining: number) => void
    setDuration: (duration: number) => void
    setMyPlayer: (player: Player) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    hostId: null,
    role: null,
    guessWord: null,
    players: [],
    timeRemaining: 0,
    passesRemaining: 0,
    duration: 0,
    myPlayer: null,
    setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
    setPassesRemaining: (passesRemaining) => set({ passesRemaining }),
    setDuration: (duration) => set({ duration }),
    setRole: (role) => set({ role }),
    setGuessWord: (guessWord) => set({ guessWord }),
    setHostId: (hostId) => set({ hostId }),
    setPlayers: (players) => set({ players }),
    setMyPlayer: (player: Player) => set({ myPlayer: player }),
}))
