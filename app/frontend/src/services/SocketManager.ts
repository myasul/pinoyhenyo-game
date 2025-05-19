import io from "socket.io-client"

export class SocketManager {
    private static instance: SocketManager | null = null
    private socket: SocketIOClient.Socket | null = null

    // Private constructor to prevent instantiation
    // outside of this class
    private constructor() { }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager()
        }
        return SocketManager.instance
    }

    connect(): SocketIOClient.Socket {
        if (typeof window === 'undefined') {
            throw new Error('SocketManager can only be used in the browser')
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

        if (!this.socket) {
            this.socket = io(socketUrl, {
                transports: ['websocket'],
                reconnectionAttempts: 10,
                reconnectionDelay: 1000, // Wait 1 second between reconnection attempts
            })

            console.log('Socket connected:', this.socket.id)
        }

        return this.socket
    }

    disconnect(): void {
        if (!this.socket) return

        this.socket.disconnect()
        this.socket = null
        console.log('Socket disconnected')
    }

    getSocket(): SocketIOClient.Socket {
        return this.socket ? this.socket : this.connect()
    }
}
