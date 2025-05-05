import { useEffect, useRef, useState } from "react"

// Utility: shuffle the array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}


type Props = {
    word: string
    width?: number
    height?: number
    pixelSize?: number
}

export const TvStaticPlaceholder = ({ word, width = 300, height = 80, pixelSize = 10 }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [tiles, setTiles] = useState<ImageData[]>([])

    const cols = Math.floor(width / pixelSize)
    const rows = Math.floor(height / pixelSize)

    useEffect(() => {
        const canvas = document.createElement('canvas')
        canvas.width = cols
        canvas.height = rows
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // PH flag colors
        // See tailwind.config.ts for the colors
        const palette = [
            [252, 209, 22],   // deepYellow
            [255, 244, 184],  // yellow
            [0, 56, 168],     // deepBlue
            [184, 216, 255],  // blue
            [206, 17, 38],    // deepRed
            [255, 184, 184],  // red
            [253, 253, 253],  // white
        ]
    
        const newTiles: ImageData[] = []
    
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const [r, g, b] = palette[Math.floor(Math.random() * palette.length)]
    
                const tile = ctx.createImageData(1, 1)
                tile.data[0] = r
                tile.data[1] = g
                tile.data[2] = b
                tile.data[3] = 255
                newTiles.push(tile)
            }
        }

        setTiles(shuffleArray(newTiles))

        const timeout = setTimeout(() => {
            setTiles(newTiles)
        }, 300) // duration of glitch effect

        return () => clearTimeout(timeout)
    }, [word, cols, rows])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !tiles.length) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const draw = () => {
            tiles.forEach((tile, index) => {
                const x = (index % cols) * pixelSize
                const y = Math.floor(index / cols) * pixelSize
                const offscreen = document.createElement('canvas')
                offscreen.width = 1
                offscreen.height = 1
                const tileCtx = offscreen.getContext('2d')!
                tileCtx.putImageData(tile, 0, 0)
                ctx.drawImage(offscreen, x, y, pixelSize, pixelSize)
            })
        }

        draw()
    }, [tiles, pixelSize, cols])

    return (
        <div className="inline-block overflow-hidden">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="block w-full h-full"
            />
        </div>
    )
}
