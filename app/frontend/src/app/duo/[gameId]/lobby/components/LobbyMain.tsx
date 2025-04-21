import { DuoGameRole, Player } from "shared"
import { InviteLinkBtn } from "./InviteLink"
import { WaveButton } from "@/components/WaveButton"
import { X } from "react-feather"
import { DuoGameRoleText } from "../page"

type Props = {
    players: Player[]
    myPlayer: Player
    onExit: () => void
    onStartGame: () => void
}

export const LobbyMain = ({ players, myPlayer, onExit, onStartGame }: Props) => {
    return (
        <main className="p-6 flex flex-col justify-between h-full w-full items-center bg-fil-yellow">
            <div className="flex flex-col gap-6 w-full max-w-md">
                <section className="flex flex-col items-center w-full gap-4">
                    <h1 className="text-3xl mb-2 font-extrabold text-fil-darkText">Players</h1>
                    <ul className="grid grid-cols-1 gap-3 w-full">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                className={
                                    `
                                        flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border-2 
                                        ${player.id === myPlayer.id ? 'bg-fil-blue border-fil-darkText animate-pulseJoin' : 'bg-fil-white border-fil-yellow'}
                                    `
                                }
                            >
                                <div className="text-fil-darkText font-semibold text-lg flex items-center gap-2">
                                    {player.role === DuoGameRole.ClueGiver ? '🎤' : '🧠'}&nbsp;
                                    {player.name}
                                </div>
                                <div className="text-sm text-fil-darkText font-medium">
                                    {DuoGameRoleText[player.role]}
                                    {player.id === myPlayer.id && <span className="ml-1">(you)</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <InviteLinkBtn />
                </section>

                <section className="flex flex-col items-center">
                    <h1 className="text-3xl mb-2 font-extrabold text-fil-darkText">🛠️ Settings</h1>
                </section>
            </div>

            <footer className="flex gap-1 w-full max-w-md">
                <WaveButton
                    bgColor='bg-white'
                    className='w-1/4'
                    textColor='text-fil-darkGrey'
                    onClick={onExit}
                >
                    <X size="28" strokeWidth="2.5" />
                </WaveButton>
                <WaveButton
                    disabled={players.length !== 2}
                    className='flex-1 text-xl w-full font-extrabold flex-grow hover:bg-blue-300'
                    bgColor="bg-fil-blue"
                    textColor="text-[#0038A8]"
                    onClick={onStartGame}
                >
                    <span className="font-extrabold">Start Game</span>
                </WaveButton>
            </footer>
        </main>
    )
}