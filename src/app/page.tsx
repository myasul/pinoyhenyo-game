import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Pinoy Henyo</h1>
      <p className="mb-6">Choose a game mode:</p>
      <div className="grid gap-4">
        <Link href="/duo" className="bg-blue-500 text-white p-4 rounded-md">Duo Mode</Link>
        <Link href="/classic" className="bg-green-500 text-white p-4 rounded-md">Classic Mode</Link>
        <Link href="/battle" className="bg-purple-500 text-white p-4 rounded-md">Battle Mode</Link>
      </div>
      <div className="mt-6">
        <p>
          Pinoy Henyo is a guessing game where one player gives clues and the other guesses the word!
        </p>
      </div>
    </div>
  );
}
