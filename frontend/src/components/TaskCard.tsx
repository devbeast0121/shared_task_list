'use client';

import { Task, TaskStatus } from '@/types/task';
import { useClaimTask, useDeleteTask } from '@/hooks/useTasks';
import { User, Calendar, Loader2, Clock, CheckCircle2, ListTodo, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    showClaimButton?: boolean;
}

export default function TaskCard({ task, showClaimButton = true }: TaskCardProps) {
    const claimTaskMutation = useClaimTask();
    const deleteTaskMutation = useDeleteTask();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleClaim = async () => {
        try {
            await claimTaskMutation.mutateAsync(task.id);
        } catch (error) {
            console.error('Failed to claim task:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTaskMutation.mutateAsync(task.id);
            setShowDeleteConfirm(false);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to delete task:', error);
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

    const truncateAssignee = (name: string, maxLength: number = 6): string => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
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
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow animate-slide-up border border-gray-200 relative">
            {/* Header with title, status, and menu */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
                    {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span>{task.status}</span>
                    </span>

                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Task options"
                        >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200"
                                    disabled={deleteTaskMutation.isPending}
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowMenu(false)}
                />
            )}

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {task.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center" title={task.assignee}>
                        <User className="h-4 w-4 mr-1" />
                        <span>{truncateAssignee(task.assignee)}</span>
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

            {/* Error Messages */}
            {claimTaskMutation.error && (
                <div className="text-red-600 text-xs mt-2">
                    Failed to claim task. Please try again.
                </div>
            )}

            {deleteTaskMutation.error && (
                <div className="text-red-600 text-xs mt-2">
                    Failed to delete task. Please try again.
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to delete this task?</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-md p-3 mb-4">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{task.title}</p>
                            <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                disabled={deleteTaskMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteTaskMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                            >
                                {deleteTaskMutation.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-3 w-3" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}