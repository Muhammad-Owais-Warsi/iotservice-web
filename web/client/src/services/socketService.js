import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to WebSocket server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService();
