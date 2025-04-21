'use client'
import { Button } from '@/components/Button';
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
    <main className="p-6 min-h-screen flex flex-col items-center justify-center bg-fil-yellow">
      <h1 className="mb-4 text-8xl font-extrabold drop-shadow-md flex space-x-2">
        <span className="text-[#0038A8]">H</span>
        <span className="text-[#CE1126]">E</span>
        <span className="text-[#FCD116]">N</span>
        <span className="text-white">Y</span>
        <span className="text-[#0038A8]">O</span>
      </h1>

      <p className="mb-6 text-fil-red text-lg">Choose a game mode:</p>

      <div className="grid gap-4">
        <Button
          label='Solo'
          onClick={handleDuoModeClick}
          overrideTWStyle='bg-fil-blue text-blue-900 hover:bg-blue-300'
        />
        <Button
          label='Duo'
          onClick={handleDuoModeClick}
          overrideTWStyle='bg-fil-red text-red-800 hover:bg-red-300'
        />
      </div>

      <div className="mt-6 text-center text-fil-darkText max-w-md">
        <p>
          Henyo is a classic Filipino guessing game where one player gives clues and the other guesses the word!
        </p>
      </div>
    </main>
  );
}
