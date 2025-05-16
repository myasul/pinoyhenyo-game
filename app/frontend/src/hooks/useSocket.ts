import io from "socket.io-client"

let socketInstance: typeof io.Socket | null = null

export const useSocket = () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    if (!socketInstance) {
        socketInstance = io(socketUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,  // Wait 1 second between reconnection attempts
        })
    }

    const disconnectSocket = () => {
        socketInstance?.disconnect()
        socketInstance = null
    }

    return { disconnectSocket, socket: socketInstance }
}
