import { DefaultGameSettings, DuoGamePlayerSessionStatus } from '@/utils/constants'
import { GameSettings, Player } from "@henyo/shared"
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface DuoGameState {
    hostId: string
    guessWord: string | null
    myPlayer: Player | null
    players: Player[]
    settings: GameSettings
    timeRemaining: number
    passesRemaining: number
    passedWords: string[]
    myPlayerStatus: DuoGamePlayerSessionStatus
    setHostId: (hostId: string) => void
    setMyPlayerStatus: (myPlayerStatus: DuoGamePlayerSessionStatus) => void
    setGuessWord: (guessWord: string | null) => void
    setPlayers: (players: Player[]) => void
    setSettings: (settings: GameSettings) => void
    setTimeRemaining: (timeRemaining: number) => void
    setPassesRemaining: (passesRemaining: number) => void
    setMyPlayer: (player: Player | null) => void
    setPassedWords: (passedWords: string[]) => void
}

export const useDuoGameStore = create<DuoGameState>()(devtools((set) => ({
    hostId: '',
    guessWord: null,
    players: [],
    timeRemaining: 0,
    passesRemaining: 0,
    duration: 0,
    myPlayer: null,
    settings: DefaultGameSettings,
    myPlayerStatus: DuoGamePlayerSessionStatus.Idle,
    passedWords: [],
    setHostId: (hostId: string) => set({ hostId }),
    setMyPlayerStatus: (myPlayerStatus) => set({ myPlayerStatus }),
    setSettings: (settings) => set({ settings }),
    setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
    setPassesRemaining: (passesRemaining) => set({ passesRemaining }),
    setGuessWord: (guessWord) => set({ guessWord }),
    setPlayers: (players) => set({ players }),
    setMyPlayer: (player) => set({ myPlayer: player }),
    setPassedWords: (passedWords) => set({ passedWords }),
})))
