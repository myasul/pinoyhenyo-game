import { DuoGameRole, GameSettings, Player } from "@henyo/shared"
import { InviteLinkBtn } from "./InviteLink"
import { PageLayout } from "@/components/PageLayout"
import { useState } from "react"
import { Footer } from "@/components/Footer"
import { Play, RefreshCw } from "react-feather"
import { WaveButton } from "@/components/WaveButton"
import { SettingsSection } from "./SettingsSection"

type Props = {
    isHost: boolean
    players: Player[]
    myPlayer: Player
    settings: GameSettings
    onExit: () => void
    onStartGame: (settings: GameSettings) => void
    onSwitchRole: () => void
}

const DuoGameRoleText = {
    [DuoGameRole.ClueGiver]: 'Clue Giver',
    [DuoGameRole.Guesser]: 'Guesser',
    [DuoGameRole.Unknown]: 'Unknown',
}

export const LobbyMain = ({ isHost, players, myPlayer, settings, onExit, onStartGame, onSwitchRole }: Props) => {
    const [duration, setDuration] = useState(settings.duration)
    const [passes, setPasses] = useState(settings.passes)
    const [languagesUsed, setLanguagesUsed] = useState(settings.languagesUsed)

    const isGameFull = players.length >= 2

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
                        isHost
                            ? (
                                isGameFull
                                    ? (
                                        <WaveButton
                                            className="w-3/4 shadow-md font-extrabold border border-fil-blue rounded-xl text-lg h-10 flex flex-row"
                                            bgColor='bg-fil-deepBlue'
                                            textColor='text-white'
                                            onClick={onSwitchRole}
                                        >
                                            <span className="flex items-center justify-center gap-3">
                                                <RefreshCw className="text-fil-deepYellow" /> Switch Roles
                                            </span>
                                        </WaveButton>
                                    )
                                    : <InviteLinkBtn />
                            ) : null
                    }
                </section>
                {isHost &&
                    <SettingsSection
                        duration={duration}
                        passes={passes}
                        languagesUsed={languagesUsed}
                        onChangeDuration={setDuration}
                        onChangePasses={setPasses}
                        onChangeLanguagesUsed={setLanguagesUsed}
                    />
                }
            </div>
            <Footer
                onBack={onExit}
                onContinue={handleStartGame}
                isContinueDisabled={players.length !== 2}
                continueLabel={<Play size='28' strokeWidth='2.5' />}
                isContinueHidden={!isHost}
            />
        </PageLayout>
    )
}