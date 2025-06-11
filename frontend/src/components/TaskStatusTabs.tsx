'use client';

import { TaskStatus } from '@/types/task';
import { CheckCircle, Clock, ListTodo, Grid3X3 } from 'lucide-react';

interface TaskStatusTabsProps {
    activeStatus: TaskStatus | 'ALL';
    onStatusChange: (status: TaskStatus | 'ALL') => void;
    taskCounts: {
        [TaskStatus.TODO]: number;
        [TaskStatus.IN_PROGRESS]: number;
        [TaskStatus.DONE]: number;
        ALL: number;
    };
}

export default function TaskStatusTabs({
    activeStatus,
    onStatusChange,
    taskCounts
}: TaskStatusTabsProps) {
    const tabs = [
        {
            key: 'ALL' as const,
            label: 'All Tasks',
            icon: Grid3X3,
            count: taskCounts.ALL,
            color: 'gray'
        },
        {
            key: TaskStatus.TODO,
            label: 'To Do',
            icon: ListTodo,
            count: taskCounts[TaskStatus.TODO],
            color: 'blue'
        },
        {
            key: TaskStatus.IN_PROGRESS,
            label: 'In Progress',
            icon: Clock,
            count: taskCounts[TaskStatus.IN_PROGRESS],
            color: 'orange'
        },
        {
            key: TaskStatus.DONE,
            label: 'Completed',
            icon: CheckCircle,
            count: taskCounts[TaskStatus.DONE],
            color: 'green'
        }
    ];

    const getTabStyles = (tabKey: string, color: string) => {
        const isActive = activeStatus === tabKey;

        const baseStyles = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer";

        if (isActive) {
            const activeColors = {
                gray: 'bg-gray-100 text-gray-800 border-gray-300',
                blue: 'bg-blue-100 text-blue-800 border-blue-300',
                orange: 'bg-orange-100 text-orange-800 border-orange-300',
                green: 'bg-green-100 text-green-800 border-green-300'
            };
            return `${baseStyles} ${activeColors[color as keyof typeof activeColors]} border-2`;
        } else {
            return `${baseStyles} text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-2 border-transparent`;
        }
    };

    return (
        <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide pb-4">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onStatusChange(tab.key)}
                            className={getTabStyles(tab.key, tab.color)}
                        >
                            <IconComponent className="h-4 w-4" />
                            <span className="whitespace-nowrap">{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeStatus === tab.key
                                    ? 'bg-white bg-opacity-70'
                                    : 'bg-gray-200'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}