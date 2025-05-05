'use client'
import { PageLayout } from '@/components/PageLayout';
import { WaveButton } from '@/components/WaveButton';
import axios from 'axios';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter()

  const handleDuoModeClick = async () => {
    try {
      const response = await axios.post('/api/create-room')
      const { gameId } = response.data

      router.push(`/duo/${gameId}/lobby`)
    } catch (error) {
      console.error('Error creating room: ', error)
    }
  }

  return (
    <PageLayout>
      <h1 className="mb-4 text-8xl font-extrabold drop-shadow-md flex space-x-2">
        <span className="text-[#0038A8]">H</span>
        <span className="text-[#CE1126]">E</span>
        <span className="text-[#FCD116]">N</span>
        <span className="text-white">Y</span>
        <span className="text-[#0038A8]">O</span>
      </h1>

      <div>
        <p className="mb-6 text-fil-deepBlue text-lg">Choose a game mode:</p>
        <div className="grid gap-4">
          <WaveButton
            disabled
            onClick={handleDuoModeClick}
            bgColor='bg-fil-deepRed'
            textColor='text-fil-yellow'
            className='!rounded-xl'
          >
            Solo (soon!)
          </WaveButton>
          <WaveButton
            onClick={handleDuoModeClick}
            className='!rounded-xl'
          >
            Duo
          </WaveButton>
        </div>
      </div>

      <div className="mt-6 text-center text-fil-darkText max-w-md h-3/4">
        <p>
          Henyo is a classic Filipino guessing game where one player gives clues and the other guesses the word!
        </p>
      </div>
    </PageLayout>
  );
}
