'use client'
import axios from 'axios';

import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter()

  const handleDuoModeClick = async () => {
    try {
      const response = await axios.post('/api/create-room')
      const { gameId } = response.data

      console.log('[handleDuoModeClick] gameId: ', gameId)

      router.push(`/duo/${gameId}/lobby`)
    } catch (error) {
      console.error('Error creating room: ', error)
    }
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Pinoy Henyo</h1>
      <p className="mb-6">Choose a game mode:</p>
      <div className="grid gap-4">
        <Button label='Duo' onClick={handleDuoModeClick} variant='primary' />
        <Button label='Classic' overrideTWStyle='bg-purple-200 text-purple-800 hover:bg-purple:300' onClick={handleDuoModeClick} />
        <Button label='Battle' overrideTWStyle='bg-blue-200 text-blue-800 hover:bg-blue:300' onClick={handleDuoModeClick} />
      </div>
      <div className="mt-6">
        <p>
          Pinoy Henyo is a guessing game where one player gives clues and the other guesses the word!
        </p>
      </div>
    </div>
  );
}
