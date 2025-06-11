'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';
import SearchBar from './SearchBar';
import TaskStatusTabs from './TaskStatusTabs';
import { Loader2, AlertCircle, CheckCircle, Wifi, WifiOff, Search } from 'lucide-react';

export default function TaskList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStatus, setActiveStatus] = useState<TaskStatus | 'ALL'>('ALL');
    const { isConnected } = useWebSocket();

    // Get tasks based on active status filter
    const {
        data: tasks,
        isLoading,
        error,
        refetch
    } = useTasks({
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        search: searchQuery || undefined,
    });

    // Get all tasks for counting
    const { data: allTasks } = useTasks({});
    const { data: todoTasks } = useTasks({ status: TaskStatus.TODO });
    const { data: inProgressTasks } = useTasks({ status: TaskStatus.IN_PROGRESS });
    const { data: doneTasks } = useTasks({ status: TaskStatus.DONE });

    const taskCounts = useMemo(() => ({
        [TaskStatus.TODO]: todoTasks?.length || 0,
        [TaskStatus.IN_PROGRESS]: inProgressTasks?.length || 0,
        [TaskStatus.DONE]: doneTasks?.length || 0,
        ALL: allTasks?.length || 0
    }), [todoTasks, inProgressTasks, doneTasks, allTasks]);

    const filteredTasks = useMemo(() => {
        return tasks || [];
    }, [tasks]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleStatusChange = useCallback((status: TaskStatus | 'ALL') => {
        setActiveStatus(status);
        setSearchQuery(''); // Clear search when changing status
    }, []);

    const getStatusDisplayName = (status: TaskStatus | 'ALL') => {
        switch (status) {
            case 'ALL': return 'All Tasks';
            case TaskStatus.TODO: return 'To Do Tasks';
            case TaskStatus.IN_PROGRESS: return 'In Progress Tasks';
            case TaskStatus.DONE: return 'Completed Tasks';
            default: return 'Tasks';
        }
    };

    if (isLoading && !searchQuery) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Tasks</h3>
                <p className="text-red-600 mb-4">There was an error loading the task list.</p>
                <button
                    onClick={() => refetch()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
                </div>

                <div className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors duration-200 ${isConnected
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {isConnected ? (
                        <>
                            <Wifi className="h-4 w-4 mr-1" />
                            Connected
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-4 w-4 mr-1" />
                            Disconnected
                        </>
                    )}
                </div>
            </div>

            {/* Status Filter Tabs */}
            <TaskStatusTabs
                activeStatus={activeStatus}
                onStatusChange={handleStatusChange}
                taskCounts={taskCounts}
            />

            {/* Search Bar */}
            <SearchBar
                onSearch={handleSearch}
                placeholder={`Search ${getStatusDisplayName(activeStatus).toLowerCase()}...`}
                isLoading={isLoading && !!searchQuery}
                resultCount={filteredTasks.length}
                totalCount={taskCounts[activeStatus === 'ALL' ? 'ALL' : activeStatus]}
            />

            {/* Task Count Summary */}
            {!searchQuery && (
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                        {activeStatus !== 'ALL' && ` in ${getStatusDisplayName(activeStatus).toLowerCase()}`}
                    </p>
                </div>
            )}

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} showClaimButton={activeStatus === TaskStatus.TODO || activeStatus === 'ALL'} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    {searchQuery ? (
                        <>
                            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                No tasks found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                No {getStatusDisplayName(activeStatus).toLowerCase()} match your search for "{searchQuery}"
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                            >
                                Clear search to see all {getStatusDisplayName(activeStatus).toLowerCase()}
                            </button>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                No {getStatusDisplayName(activeStatus).toLowerCase()}
                            </h3>
                            <p className="text-gray-500">
                                {activeStatus === TaskStatus.TODO && "New tasks will appear here when they are created"}
                                {activeStatus === TaskStatus.IN_PROGRESS && "Tasks will appear here when they are claimed"}
                                {activeStatus === TaskStatus.DONE && "Completed tasks will appear here"}
                                {activeStatus === 'ALL' && "No tasks have been created yet"}
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Loading overlay for search */}
            {isLoading && searchQuery && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Searching...</span>
                    </div>
                </div>
            )}
        </div>
    );
}