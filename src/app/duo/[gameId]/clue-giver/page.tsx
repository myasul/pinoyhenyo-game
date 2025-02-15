import { useDuoGameStore } from "@/stores/duoGameStore"
import { useParams } from "next/navigation"
import { useEffect } from "react"

type ClueGiverPageParams = { gameId: string }

export default function ClueGiverPage() {
    const { gameId } = useParams<ClueGiverPageParams>()
    const { setGameId } = useDuoGameStore()

    useEffect(() => {
        if (!gameId) return

        setGameId(gameId)
    }, [gameId])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Clue Giver ({gameId})</h1>
        </div>
    )
}