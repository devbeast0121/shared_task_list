import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    // Get tasks with optional filtering
    getTasks: async (params?: { status?: TaskStatus; search?: string }): Promise<Task[]> => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.search) searchParams.append('search', params.search);

        const queryString = searchParams.toString();
        const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;

        return fetchApi<Task[]>(endpoint);
    },

    // Create a new task
    createTask: async (taskData: CreateTaskData): Promise<Task> => {
        return fetchApi<Task>('/api/tasks/', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    },

    // Update task status
    updateTask: async (taskId: number, updateData: UpdateTaskData): Promise<Task> => {
        return fetchApi<Task>(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData),
        });
    },

    // Delete a task
    deleteTask: async (taskId: number): Promise<void> => {
        return fetchApi<void>(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });
    },

    // Get single task
    getTask: async (taskId: number): Promise<Task> => {
        return fetchApi<Task>(`/api/tasks/${taskId}`);
    },
};