'use client'
import { PageLayout } from '@/components/PageLayout';
import { WaveButton } from '@/components/WaveButton';
import axios from 'axios';
import Image from 'next/image';

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
    <PageLayout className='h-full'>
      <header className="mb-4 text-8xl font-extrabold drop-shadow-md flex space-x-2">
        <span className="text-fil-deepBlue">H</span>
        <span className="text-fil-deepRed">E</span>
        <span className="text-fil-deepYellow">N</span>
        <span className="text-white">Y</span>
        <span className="text-fil-deepBlue">O</span>
      </header>

      <section className="flex flex-col items-center gap-10 h-3/4">
        <Image
          src='/images/henyo-icon.png'
          width={62.5} height={62.5}
          alt='Henyo icon'
        />
        <WaveButton
          onClick={handleDuoModeClick}
          className='!rounded-xl'
        >
          New Game
        </WaveButton>
        <div>
          <p className="text-fil-darkText max-w-md text-justify">
            It&apos;s time to put your deduction skills to the test! 🤔
          </p>
          <p className="text-fil-darkText max-w-md text-justify">
            This beloved Filipino guessing game challenges one player to give clever clues while the other races to guess the word. Can you guess before time runs out?
          </p>
        </div>
      </section>

      <footer className="text-center text-fil-darkText max-w-md">
        <p>
          Free,&nbsp;
          <a href="https://github.com/myasul/pinoyhenyo-game" target="_blank" className="underline text-fil-deepBlue">open source</a>,
          and made with ❤️ 🇵🇭
        </p>
      </footer>
    </PageLayout >
  );
}
