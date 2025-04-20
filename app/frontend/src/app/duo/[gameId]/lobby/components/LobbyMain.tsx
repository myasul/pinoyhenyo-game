import { Player } from "shared"
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

        <main className="p-6 flex flex-col justify-between h-full w-full items-center">
            <div className='flex flex-col gap-6'>
                <section className='flex flex-col items-center'>
                    <h1 className='text-3xl mb-2 font-extrabold'>Players</h1>
                    <ul className='list-disc ml-6 mb-5'>
                        {Object.values(players).map((player, index) => (
                            <li key={index}>
                                {player.name} - {DuoGameRoleText[player.role]}
                                {player.id === myPlayer.id && (<b> (you)</b>)}
                            </li>
                        ))}
                    </ul>
                    <InviteLinkBtn />
                </section>
                <section className='flex flex-col items-center'>
                    <h1 className='text-3xl mb-2 font-extrabold'>Sett1ings</h1>
                </section>
            </div>
            <footer className='flex gap-1 w-full'>
                <WaveButton bgColor='bg-gray-300' className='w-1/6' textColor='text-gray-600' onClick={onExit}>
                    <X size='28' strokeWidth='2.5' />
                </WaveButton>
                <WaveButton
                    disabled={!(Object.values(players).length === 2)}
                    className='flex-1 text-xl'
                    onClick={onStartGame}
                >
                    <span className='font-extrabold'>StartGame</span>
                </WaveButton>
            </footer>
        </main>
    )
}