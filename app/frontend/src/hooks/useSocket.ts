import { useEffect, useRef, useState } from "react"
import { SocketEvent } from "@henyo/shared"
import io from "socket.io-client"

let socketInstance: typeof io.Socket | null = null

export const getSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    if (!socketInstance) {
        socketInstance = io(socketUrl, {
            transports: ['websocket'],
            upgrade: true,
            reconnection: true,
            forceNew: false,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,  // Wait 1 second between reconnection attempts
        })
    }

    return socketInstance
}

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false)
    const isExplicityDisconnected = useRef(false)

    useEffect(() => {
        const socket = getSocket()

        if (socket.connected) setIsConnected(true)

        socket.on('connect', () => setIsConnected(true))
        socket.on('disconnect', () => setIsConnected(false))

        return () => {
            socket.off(SocketEvent.Connect)
            socket.off(SocketEvent.Disconnect)

            if (!isExplicityDisconnected.current) return

            socket.disconnect()
            socketInstance = null
        }
    }, [])

    const disconnectSocket = () => {
        isExplicityDisconnected.current = true
        socketInstance?.disconnect()
        socketInstance = null
        setIsConnected(false)
    }

    return { disconnectSocket, socket: isConnected ? socketInstance : null }
}
