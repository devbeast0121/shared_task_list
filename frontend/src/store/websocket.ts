import { create } from 'zustand';
import { Task, WebSocketMessage } from '@/types/task';

interface WebSocketState {
    socket: WebSocket | null;
    isConnected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    connect: () => void;
    disconnect: () => void;
    onMessage: (callback: (message: WebSocketMessage) => void) => void;
    messageHandlers: ((message: WebSocketMessage) => void)[];
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // 1 second

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    messageHandlers: [],

    connect: () => {
        const state = get();

        // Don't create multiple connections
        if (state.socket?.readyState === WebSocket.CONNECTING ||
            state.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log('WebSocket connected');
                set({
                    socket,
                    isConnected: true,
                    reconnectAttempts: 0
                });
            };

            socket.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    // Call all registered message handlers
                    state.messageHandlers.forEach(handler => handler(message));
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                set({ socket: null, isConnected: false });

                // Attempt to reconnect
                const currentState = get();
                if (currentState.reconnectAttempts < currentState.maxReconnectAttempts) {
                    setTimeout(() => {
                        set(state => ({
                            reconnectAttempts: state.reconnectAttempts + 1
                        }));
                        get().connect();
                    }, RECONNECT_DELAY * (currentState.reconnectAttempts + 1));
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            set({ socket });
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
            set({ socket: null, isConnected: false, reconnectAttempts: 0 });
        }
    },

    onMessage: (callback) => {
        set(state => ({
            messageHandlers: [...state.messageHandlers, callback]
        }));
    },
}));