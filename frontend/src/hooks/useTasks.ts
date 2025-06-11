import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, CreateTaskData, TaskStatus } from '@/types/task';

export const useTasks = (params?: { status?: TaskStatus; search?: string }) => {
    return useQuery({
        queryKey: ['tasks', params],
        queryFn: () => api.getTasks(params),
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskData: CreateTaskData) => api.createTask(taskData),
        onSuccess: () => {
            // Invalidate and refetch tasks
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, updateData }: { taskId: number; updateData: { status: TaskStatus } }) =>
            api.updateTask(taskId, updateData),
        onSuccess: () => {
            // Invalidate and refetch tasks
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useClaimTask = () => {
    const updateTaskMutation = useUpdateTask();

    return useMutation({
        mutationFn: (taskId: number) =>
            updateTaskMutation.mutateAsync({
                taskId,
                updateData: { status: TaskStatus.IN_PROGRESS }
            }),
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: number) => api.deleteTask(taskId),
        onSuccess: () => {
            // Invalidate and refetch tasks
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};