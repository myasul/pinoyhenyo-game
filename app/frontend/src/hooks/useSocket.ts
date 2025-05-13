import { useEffect, useRef, useState } from "react"
import { SocketEvent } from "@henyo/shared"
import io from "socket.io-client"

let socketInstance: typeof io.Socket | null = null

export const getSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    if (!socketInstance) {
        socketInstance = io(socketUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,  // Wait 1 second between reconnection attempts
        })
    }

    return socketInstance
}

export const useSocket = () => {
    // const isExplicityDisconnected = useRef(false)


    // const socket = getSocket()

    // useEffect(() => {
    //     const socket = getSocket()

    //     // if (socket.connected) setIsConnected(true)

    //     // socket.on(SocketEvent.Connect, () => {
    //     //     console.log('Connected to socket server! Socket ID:', socket.id)

    //     //     setIsConnected(true)
    //     // })
    //     // socket.on(SocketEvent.Disconnect, () => {
    //     //     console.log('Disconnected from socket server! Socket ID:', socket.id)

    //     //     setIsConnected(false)
    //     //     socket.connect()
    //     // })

    //     return () => {
    //         socket.off(SocketEvent.Connect)
    //         socket.off(SocketEvent.Disconnect)

    //         if (!isExplicityDisconnected.current) return

    //         console.log('Explicitly disconnected. Cleaning up socket connection...')

    //         socket.disconnect()
    //         socketInstance = null
    //     }
    // }, [])

    const disconnectSocket = () => {
        socketInstance?.disconnect()
        socketInstance = null
    }

    return { disconnectSocket, socket: getSocket() }
}
