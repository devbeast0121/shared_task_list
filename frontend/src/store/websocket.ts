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

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
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
            console.log('WebSocket already connecting or connected');
            return;
        }

        // Close existing socket if any
        if (state.socket) {
            state.socket.close();
        }

        console.log(`Attempting to connect to WebSocket: ${WS_URL}`);

        try {
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                set({
                    socket,
                    isConnected: true,
                    reconnectAttempts: 0
                });
            };

            socket.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log('📨 Received WebSocket message:', message);

                    // Get current state to access latest message handlers
                    const currentState = get();
                    currentState.messageHandlers.forEach(handler => {
                        try {
                            handler(message);
                        } catch (error) {
                            console.error('Error in message handler:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            socket.onclose = (event) => {
                console.log('❌ WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
                set({ socket: null, isConnected: false });

                // Attempt to reconnect
                const currentState = get();
                if (currentState.reconnectAttempts < currentState.maxReconnectAttempts) {
                    const delay = RECONNECT_DELAY * (currentState.reconnectAttempts + 1);
                    console.log(`🔄 Attempting reconnect ${currentState.reconnectAttempts + 1}/${currentState.maxReconnectAttempts} in ${delay}ms`);

                    setTimeout(() => {
                        set(state => ({
                            reconnectAttempts: state.reconnectAttempts + 1
                        }));
                        get().connect();
                    }, delay);
                } else {
                    console.log('❌ Max reconnection attempts reached');
                }
            };

            socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

            set({ socket });
        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            console.log('Disconnecting WebSocket');
            socket.close();
            set({ socket: null, isConnected: false, reconnectAttempts: 0 });
        }
    },

    onMessage: (callback) => {
        console.log('📝 Registering WebSocket message handler');
        set(state => ({
            messageHandlers: [...state.messageHandlers, callback]
        }));

        // Return cleanup function
        return () => {
            set(state => ({
                messageHandlers: state.messageHandlers.filter(handler => handler !== callback)
            }));
        };
    },
}));