export enum TaskStatus {
    TODO = "To Do",
    IN_PROGRESS = "In Progress",
    DONE = "Done"
}

export interface Task {
    id: number;
    title: string;
    description: string;
    assignee: string;
    status: TaskStatus;
    created_at: string;
    updated_at?: string;
}

export interface CreateTaskData {
    title: string;
    description: string;
    assignee: string;
}

export interface UpdateTaskData {
    status: TaskStatus;
}

export interface WebSocketMessage {
    type: 'task_created' | 'task_updated' | 'task_deleted';
    data: Task | { id: number };
}