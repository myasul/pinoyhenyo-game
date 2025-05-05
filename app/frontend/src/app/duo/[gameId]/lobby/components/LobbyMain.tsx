import { DuoGameRole, GameSettings, Player, SupportedLanguages } from "shared"
import { InviteLinkBtn } from "./InviteLink"
import { DuoGameRoleText } from "../page"
import { PageLayout } from "@/components/PageLayout"
import { RadioGroup } from "@/components/RadioGroup"
import { useState } from "react"
import { CheckboxGroup } from "@/components/CheckboxGroup"
import { Footer } from "@/components/Footer"
import { Play, RefreshCw } from "react-feather"
import { WaveButton } from "@/components/WaveButton"

type Props = {
    players: Player[]
    myPlayer: Player
    settings: GameSettings
    onExit: () => void
    onStartGame: (settings: GameSettings) => void
    onSwitchRole: () => void
}

const LanguageOptions = [
    { label: 'English', value: SupportedLanguages.English },
    { label: 'Tagalog', value: SupportedLanguages.Tagalog },
]

const SettingsOptions = {
    duration: [30, 60, 90, 120],
    passes: [0, 1, 2, 3, 4, 5],
    languagesUsed: LanguageOptions,
}

export const LobbyMain = ({ players, myPlayer, settings, onExit, onStartGame, onSwitchRole }: Props) => {
    const [duration, setDuration] = useState(settings.duration)
    const [passes, setPasses] = useState(settings.passes)
    const [languagesUsed, setLanguagesUsed] = useState(settings.languagesUsed)

    const handleStartGame = () => {
        const settings: GameSettings = {
            duration,
            passes,
            languagesUsed,
        }

        onStartGame(settings)
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-6 w-full">
                <section className="flex flex-col items-center w-full gap-3">
                    <h1 className="text-3xl font-extrabold text-fil-deepBlue">Players</h1>
                    <ul className="grid grid-cols-1 gap-3 w-full">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                className={
                                    `
                                        flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border-2 
                                        ${player.id === myPlayer.id ? 'bg-fil-blue border-fil-deepBlue animate-pulseJoin text-fil-deepBlue' : 'bg-fil-white border-fil-yellow text-fil-darkText'}
                                    `
                                }
                            >
                                <div className="font-semibold text-lg flex items-center gap-2">
                                    {player.role === DuoGameRole.ClueGiver ? '🎤' : '🧠'}&nbsp;
                                    {player.name}
                                </div>
                                <div className="text-smfont-medium">
                                    {DuoGameRoleText[player.role]}
                                    {player.id === myPlayer.id && <span className="ml-1">(you)</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {
                        players.length < 2
                            ? <InviteLinkBtn />
                            : (
                                <WaveButton
                                    className="w-3/4 shadow-md font-extrabold border border-fil-blue rounded-xl text-lg h-10 flex flex-row"
                                    bgColor='bg-fil-deepBlue'
                                    textColor='text-white'
                                    onClick={onSwitchRole}
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        <RefreshCw /> Switch Roles
                                    </span>
                                </WaveButton>
                            )
                    }
                </section>

                <section className="flex flex-col items-center text-center gap-3">
                    <h1 className="text-3xl font-extrabold text-fil-deepBlue">Settings</h1>
                    <div className="flex flex-col gap-2">
                        <label className="font-extrabold">Duration (seconds)</label>
                        <RadioGroup
                            options={SettingsOptions.duration.map((value) => ({
                                label: value.toString(),
                                value,
                            }))}
                            selected={duration}
                            onSelect={(value) => setDuration(value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-extrabold">Passes</label>
                        <RadioGroup
                            options={SettingsOptions.passes.map((value) => ({
                                label: value.toString(),
                                value,
                            }))}
                            selected={passes}
                            onSelect={(value) => setPasses(value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-extrabold">Languages Used</label>
                        <CheckboxGroup
                            options={SettingsOptions.languagesUsed}
                            selected={languagesUsed}
                            onSelect={(value) => setLanguagesUsed(value)}
                        />
                    </div>
                </section>
            </div>
            <Footer
                onBack={onExit}
                onContinue={handleStartGame}
                isContinueDisabled={players.length !== 2}
                continueLabel={<Play size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    )
}