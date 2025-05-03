import { PageLayout } from '@/components/PageLayout';
import { WaveButton } from '@/components/WaveButton';
import { useState } from 'react';
import { X } from 'react-feather';

type Props = {
    onJoin: (playerName: string) => void;
    onExit?: () => void;
}

export default function LobbyNewJoiner({ onJoin, onExit }: Props) {
    const [name, setName] = useState('');

    return (
        <PageLayout>
            <section className="flex flex-col items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                    Please enter your nickname:
                </h2>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your nickname here"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </section>
            <footer className='flex gap-1 w-full'>
                <WaveButton
                    bgColor='bg-fil-deepBlue'
                    textColor='text-fil-yellow'
                    className='w-1/4'
                    onClick={onExit}
                >
                    <X size='28' strokeWidth='2.5' />
                </WaveButton>
                <WaveButton
                    onClick={() => onJoin(name.trim())}
                    disabled={!name.trim()}
                    className='w-full'
                >
                    Join Game
                </WaveButton>
            </footer>
        </PageLayout>
    );
}
