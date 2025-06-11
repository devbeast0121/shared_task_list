import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketStore } from '@/store/websocket';
import { WebSocketMessage, Task, TaskStatus } from '@/types/task';

export const useWebSocket = () => {
    const { connect, disconnect, onMessage, isConnected } = useWebSocketStore();
    const queryClient = useQueryClient();
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        console.log('🚀 Initializing WebSocket connection...');

        // Connect to WebSocket on mount
        connect();

        // Set up message handler
        const handleMessage = (message: WebSocketMessage) => {
            console.log('🔄 Processing WebSocket message:', message.type, message.data);

            switch (message.type) {
                case 'task_created':
                    const newTask = message.data as Task;
                    console.log('➕ Adding new task to cache:', newTask.title);

                    // Add to all tasks query
                    queryClient.setQueryData<Task[]>(['tasks'], (oldTasks) => {
                        if (!oldTasks) return [newTask];
                        return [newTask, ...oldTasks];
                    });

                    // Add to filtered queries
                    queryClient.setQueryData<Task[]>(['tasks', { status: TaskStatus.TODO }], (oldTasks) => {
                        if (!oldTasks) return [newTask];
                        return [newTask, ...oldTasks];
                    });

                    // Invalidate all task queries to ensure consistency
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    break;

                case 'task_updated':
                    const updatedTask = message.data as Task;
                    console.log('📝 Updating task in cache:', updatedTask.title, 'Status:', updatedTask.status);

                    // Update in all queries
                    queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (oldTasks) => {
                        if (!oldTasks) return oldTasks;
                        return oldTasks.map(task =>
                            task.id === updatedTask.id ? updatedTask : task
                        );
                    });

                    // If task moved to "In Progress", remove from "To Do" queries
                    if (updatedTask.status === TaskStatus.IN_PROGRESS) {
                        queryClient.setQueryData<Task[]>(['tasks', { status: TaskStatus.TODO }], (oldTasks) => {
                            if (!oldTasks) return oldTasks;
                            return oldTasks.filter(task => task.id !== updatedTask.id);
                        });
                    }

                    // Invalidate to ensure all views are updated
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    break;

                case 'task_deleted':
                    const deletedTaskId = (message.data as { id: number }).id;
                    console.log('🗑️ Removing task from cache:', deletedTaskId);

                    // Remove from all queries
                    queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (oldTasks) => {
                        if (!oldTasks) return oldTasks;
                        return oldTasks.filter(task => task.id !== deletedTaskId);
                    });

                    // Invalidate all task queries
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    break;

                default:
                    console.warn('❓ Unknown WebSocket message type:', message.type);
            }
        };

        // Register message handler and store cleanup function
        const cleanup = onMessage(handleMessage);
        cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up WebSocket connection...');
            if (cleanupRef.current) {
                cleanupRef.current();
            }
            disconnect();
        };
    }, [connect, disconnect, onMessage, queryClient]);

    return { isConnected };
};