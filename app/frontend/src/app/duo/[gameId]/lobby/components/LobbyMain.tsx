import { DuoGameRole, Player } from "shared"
import { InviteLinkBtn } from "./InviteLink"
import { WaveButton } from "@/components/WaveButton"
import { X } from "react-feather"
import { DuoGameRoleText } from "../page"
import { PageLayout } from "@/components/PageLayout"
import { RadioGroup } from "@/components/RadioGroup"
import { useState } from "react"

type Props = {
    players: Player[]
    myPlayer: Player
    onExit: () => void
    onStartGame: () => void
}



const SettingsDefaults = {
    duration: 60,
    passes: 3,
    languagesUsed: ['English', 'Tagalog'],
}

const SettingsOptions = {
    duration: [30, 60, 90, 120],
    passes: [0, 1, 2, 3, 4, 5],
}


export const LobbyMain = ({ players, myPlayer, onExit, onStartGame }: Props) => {
    const [duration, setDuration] = useState(SettingsDefaults.duration)
    const [passes, setPasses] = useState(SettingsDefaults.passes)

    return (
        <PageLayout>
            <div className="flex flex-col gap-5 w-full">
                <section className="flex flex-col items-center w-full gap-3">
                    <h1 className="text-3xl font-extrabold text-fil-deepBlue">Players</h1>
                    <ul className="grid grid-cols-1 gap-3 w-full">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                className={
                                    `
                                        flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border-2 
                                        ${player.id === myPlayer.id ? 'bg-fil-blue border-fil-deepBlue animate-pulseJoin text-white' : 'bg-fil-white border-fil-yellow text-fil-darkText'}
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
                    {players.length < 2 && <InviteLinkBtn />}
                    <InviteLinkBtn />
                </section>

                <section className="flex flex-col items-center text-center gap-3">
                    <h1 className="text-3xl mb-2 font-extrabold text-fil-deepBlue">Settings</h1>
                    <div className="flex flex-col gap-2">
                        <label className="font-extrabold">Duration (seconds)</label>
                        <RadioGroup
                            options={SettingsOptions.duration.map((value) => ({
                                label: value.toString(),
                                value,
                            }))}
                            selected={duration}
                            onChange={(value) => setDuration(value)}
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
                            onChange={(value) => setPasses(value)}
                        />
                    </div>
                </section>
            </div>

            <footer className="flex gap-1 w-full max-w-md">
                <WaveButton
                    bgColor='bg-fil-deepBlue'
                    textColor='text-fil-yellow'
                    className='w-1/4'
                    onClick={onExit}
                >
                    <X size="28" strokeWidth="2.5" />
                </WaveButton>
                <WaveButton
                    disabled={players.length !== 2}
                    onClick={onStartGame}
                    className="w-full"
                >
                    <span className="font-extrabold">Start Game</span>
                </WaveButton>
            </footer>
        </PageLayout>
    )
}