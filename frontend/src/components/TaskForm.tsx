'use client';

import { useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { CreateTaskData } from '@/types/task';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function TaskForm() {
    const [formData, setFormData] = useState<CreateTaskData>({
        title: '',
        description: '',
        assignee: '',
    });

    const createTaskMutation = useCreateTask();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title.trim() || !formData.description.trim() || !formData.assignee.trim()) {
            return;
        }

        try {
            await createTaskMutation.mutateAsync({
                title: formData.title.trim(),
                description: formData.description.trim(),
                assignee: formData.assignee.trim(),
            });

            // Reset form on success
            setFormData({ title: '', description: '', assignee: '' });
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleChange = (field: keyof CreateTaskData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const isFormValid = formData.title.trim() && formData.description.trim() && formData.assignee.trim();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Task
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={handleChange('title')}
                        placeholder="Enter task title..."
                        maxLength={200}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createTaskMutation.isPending}
                    />
                </div>

                <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                        Assignee *
                    </label>
                    <input
                        type="text"
                        id="assignee"
                        value={formData.assignee}
                        onChange={handleChange('assignee')}
                        placeholder="Enter assignee name..."
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={createTaskMutation.isPending}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={handleChange('description')}
                        placeholder="Enter task description..."
                        rows={3}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        disabled={createTaskMutation.isPending}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid || createTaskMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {createTaskMutation.isPending ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Creating...
                        </>
                    ) : (
                        'Create Task'
                    )}
                </button>

                {createTaskMutation.error && (
                    <div className="text-red-600 text-sm mt-2">
                        Failed to create task. Please try again.
                    </div>
                )}
            </form>
        </div>
    );
}