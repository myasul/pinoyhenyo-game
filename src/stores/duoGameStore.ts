import { DuoGameRole, GameState } from '@/utils/constants'
import { create } from 'zustand'

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
    timeRemaining: number
    state: GameState
    setGameId: (id: string) => void
    setRole: (role: DuoGameRole) => void
    setCurrentWord: (currentWord: string) => void
    setHostId: (hostId: string) => void
    setPlayers: (players: Player[]) => void
    setTimeRemaining: (timeRemaining: number) => void
    setState: (state: GameState) => void
}

export const useDuoGameStore = create<DuoGameState>((set) => ({
    gameId: null,
    hostId: null,
    role: null,
    currentWord: null,
    players: [],
    timeRemaining: 0,
    state: GameState.Unknown,
    setState: (state: GameState) => set({ state }),
    setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
    setGameId: (id) => set({ gameId: id }),
    setRole: (role) => set({ role }),
    setCurrentWord: (currentWord) => set({ currentWord }),
    setHostId: (hostId) => set({ hostId }),
    setPlayers: (players) => set({ players })
}))
