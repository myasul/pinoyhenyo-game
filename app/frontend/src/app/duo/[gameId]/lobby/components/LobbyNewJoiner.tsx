import { Footer } from '@/components/Footer';
import { PageLayout } from '@/components/PageLayout';
import { WaveButton } from '@/components/WaveButton';
import { useState } from 'react';
import { LogIn } from 'react-feather';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

type Props = {
    onJoin: (playerName: string) => void;
    onExit?: () => void;
}

export default function LobbyNewJoiner({ onJoin, onExit }: Props) {
    const [name, setName] = useState('');

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onJoin(name.trim());
        }
    };

    const handleRandomNameBtnClick = () => {
        const randomName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: '-',
            length: 2
        })

        setName(randomName);
    }

    return (
        <PageLayout>
            <section className="flex flex-col items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Please enter your nickname:
                </h2>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
                    onKeyDown={handleKeyDown}
                />
                <WaveButton onClick={handleRandomNameBtnClick} className=''>
                    Generate random name
                </WaveButton>
            </section>
            <Footer
                onBack={onExit}
                onContinue={() => onJoin(name.trim())}
                isContinueDisabled={!name.trim()}
                continueLabel={<LogIn size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    );
}
