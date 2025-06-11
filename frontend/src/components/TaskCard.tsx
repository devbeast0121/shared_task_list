'use client';

import { Task, TaskStatus } from '@/types/task';
import { useClaimTask } from '@/hooks/useTasks';
import { User, Calendar, Loader2, Clock, CheckCircle2, ListTodo } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    showClaimButton?: boolean;
}

export default function TaskCard({ task, showClaimButton = true }: TaskCardProps) {
    const claimTaskMutation = useClaimTask();

    const handleClaim = async () => {
        try {
            await claimTaskMutation.mutateAsync(task.id);
        } catch (error) {
            console.error('Failed to claim task:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return <ListTodo className="h-4 w-4" />;
            case TaskStatus.IN_PROGRESS:
                return <Clock className="h-4 w-4" />;
            case TaskStatus.DONE:
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return 'bg-gray-100 text-gray-800';
            case TaskStatus.IN_PROGRESS:
                return 'bg-orange-100 text-orange-800';
            case TaskStatus.DONE:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow animate-slide-up border border-gray-200">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
                    {task.title}
                </h3>
                <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>{task.status}</span>
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {task.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(task.created_at)}</span>
                    </div>
                </div>

                {showClaimButton && task.status === TaskStatus.TODO && (
                    <button
                        onClick={handleClaim}
                        disabled={claimTaskMutation.isPending}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                    >
                        {claimTaskMutation.isPending ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-1 h-3 w-3" />
                                Claiming...
                            </>
                        ) : (
                            'Claim Task'
                        )}
                    </button>
                )}
            </div>

            {claimTaskMutation.error && (
                <div className="text-red-600 text-xs mt-2">
                    Failed to claim task. Please try again.
                </div>
            )}
        </div>
    );
}