import { Footer } from '@/components/Footer';
import { PageLayout } from '@/components/PageLayout';
import { useState } from 'react';
import { LogIn } from 'react-feather';

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
            <Footer
                onBack={onExit}
                onContinue={() => onJoin(name.trim())}
                isContinueDisabled={!name.trim()}
                continueLabel={<LogIn size='28' strokeWidth='2.5' />}
            />
        </PageLayout>
    );
}
