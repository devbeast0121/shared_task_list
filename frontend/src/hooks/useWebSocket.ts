import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketStore } from '@/store/websocket';
import { WebSocketMessage, Task, TaskStatus } from '@/types/task';

export const useWebSocket = () => {
    const { connect, disconnect, onMessage, isConnected } = useWebSocketStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Connect to WebSocket on mount
        connect();

        // Set up message handler
        const handleMessage = (message: WebSocketMessage) => {
            console.log('Received WebSocket message:', message);

            switch (message.type) {
                case 'task_created':
                    // Add new task to cache
                    queryClient.setQueryData<Task[]>(['tasks'], (oldTasks) => {
                        if (!oldTasks) return [message.data as Task];
                        return [message.data as Task, ...oldTasks];
                    });

                    // Also update the "To Do" filtered view
                    queryClient.setQueryData<Task[]>(['tasks', { status: TaskStatus.TODO }], (oldTasks) => {
                        if (!oldTasks) return [message.data as Task];
                        return [message.data as Task, ...oldTasks];
                    });
                    break;

                case 'task_updated':
                    const updatedTask = message.data as Task;

                    // Update task in all relevant queries
                    queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (oldTasks) => {
                        if (!oldTasks) return oldTasks;
                        return oldTasks.map(task =>
                            task.id === updatedTask.id ? updatedTask : task
                        );
                    });

                    // If task status changed to "In Progress", remove from "To Do" view
                    if (updatedTask.status === TaskStatus.IN_PROGRESS) {
                        queryClient.setQueryData<Task[]>(['tasks', { status: TaskStatus.TODO }], (oldTasks) => {
                            if (!oldTasks) return oldTasks;
                            return oldTasks.filter(task => task.id !== updatedTask.id);
                        });
                    }
                    break;

                case 'task_deleted':
                    const deletedTaskId = (message.data as { id: number }).id;

                    // Remove task from all queries
                    queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (oldTasks) => {
                        if (!oldTasks) return oldTasks;
                        return oldTasks.filter(task => task.id !== deletedTaskId);
                    });
                    break;

                default:
                    console.warn('Unknown WebSocket message type:', message.type);
            }
        };

        onMessage(handleMessage);

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [connect, disconnect, onMessage, queryClient]);

    return { isConnected };
};