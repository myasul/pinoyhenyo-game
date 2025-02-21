export const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60

    if (timeInSeconds > 60) return `${minutes}:${seconds}s`

    return `${timeInSeconds}s`
}
