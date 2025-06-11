'use client';

import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <TaskForm />
      <TaskList />
    </div>
  );
}