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
    wordToGuess: string | null
    emoji: string | null
    myPlayer: Player | null
    players: Player[]
    remainingTime: number
    setRole: (role: DuoGameRole) => void
    setWordToGuess: (wordToGuess: string) => void
    setHostId: (hostId: string) => void
    setPlayers: (players: Player[]) => void
    setRemainingTime: (remainingTime: number) => void
    setEmoji: (emoji: string) => void
    setMyPlayer: (player: Player) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    hostId: null,
    role: null,
    wordToGuess: null,
    emoji: null,
    players: [],
    remainingTime: 0,
    myPlayer: null,
    setRemainingTime: (remainingTime) => set({ remainingTime }),
    setRole: (role) => set({ role }),
    setWordToGuess: (wordToGuess) => set({ wordToGuess }),
    setHostId: (hostId) => set({ hostId }),
    setPlayers: (players) => set({ players }),
    setEmoji: (emoji) => set({ emoji }),
    setMyPlayer: (player: Player) => set({ myPlayer: player }),
}))
