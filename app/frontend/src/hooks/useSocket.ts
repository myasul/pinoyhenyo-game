import { useEffect, useRef, useState } from "react"
import { SocketEvent } from "@henyo/shared"
import io, { Socket } from "socket.io-client"

let socketInstance: typeof io.Socket | null = null

export const getSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    console.log('Connecting to socket:', socketUrl)

    if (!socketInstance) {
        socketInstance = io(socketUrl, {
            transports: ['websocket'],
            upgrade: true,
            reconnection: true,
            forceNew: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            // TODO: Can be fixed by buying a domain
            rejectUnauthorized: false
        })
    }

    return socketInstance
}

export const useSocket = () => {
    const [connectedSocket, setConnectedSocket] = useState<typeof Socket | null>(null)
    const isExplicityDisconnected = useRef(false)

    useEffect(() => {
        const socket = getSocket()

        if (socket.id && socket.connected) {
            setConnectedSocket(socket)
        }

        socket.addEventListener('connect', () => {
            setConnectedSocket(socket)
        })

        return () => {
            if (!isExplicityDisconnected.current) return

            socket.removeListener(SocketEvent.Connect)
            connectedSocket?.disconnect()
        }
    }, [connectedSocket])

    const disconnectSocket = () => {
        isExplicityDisconnected.current = true

        socketInstance?.disconnect()
        setConnectedSocket(null)
        socketInstance = null
    }

    return { disconnectSocket, socket: connectedSocket }
}
