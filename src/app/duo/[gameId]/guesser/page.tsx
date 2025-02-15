import { useDuoGameStore } from "@/stores/duoGameStore"
import { useParams } from "next/navigation"
import { useEffect } from "react"

type GuesserPageParams = { gameId: string }

export default function GuesserPage() {
    const { gameId } = useParams<GuesserPageParams>()
    const { setGameId } = useDuoGameStore()

    useEffect(() => {
        if (!gameId) return

        setGameId(gameId)
    }, [gameId])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Guesser ({gameId})</h1>
        </div>
    )
}