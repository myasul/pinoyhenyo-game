import { useEffect, useState } from "react"
import io, { Socket } from "socket.io-client"

export enum SocketEvent {
    JoinRoom = 'joinRoom',
    PlayerListUpdated = 'playerListUpdated'
}

let socketInstance: typeof io.Socket | null = null

export const getSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    if (!socketInstance) socketInstance = io(socketUrl)

    return socketInstance
}

export const useSocket = () => {
    const [connnectedSocket, setConnectedSocket] = useState<typeof Socket | null>(null)

    useEffect(() => {
        const socket = getSocket()

        socket.addEventListener('connect', () => {
            setConnectedSocket(socket)
        })

        return () => {
            if (connnectedSocket) connnectedSocket.disconnect()
        }
    }, [])

    return connnectedSocket
}
