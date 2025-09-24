import { useState } from 'react';
import type { Task } from '../types';

interface AddTaskProps {
  status: Task['status'];
  onAdd: (taskData: Partial<Task>) => Promise<void>;
  tasks: Task[];
}

function AddTask({ status, onAdd, tasks }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [list, setList] = useState<'work' | 'personal' | 'grocery'>('personal');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      const newOrder = tasks.filter((t) => t.status === status).length;
      await onAdd({
        title,
        description,
        status,
        order: newOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deadline: deadline,
        list,
      });
      setTitle('');
      setDescription('');
      setDeadline(undefined);
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nhiệm vụ mới..."
        className="border rounded p-2 text-sm"
        disabled={isLoading}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả..."
        className="border rounded p-2 text-sm"
        disabled={isLoading}
      />
      <input
        type="date"
        value={deadline || ''}
        onChange={(e) => setDeadline(e.target.value || undefined)}
        className="border rounded p-2 text-sm"
        disabled={isLoading}
      />
      <select
        value={list}
        onChange={(e) => setList(e.target.value as 'work' | 'personal' | 'grocery')}
        className="border rounded p-2 text-sm"
        disabled={isLoading}
      >
        <option value="personal">Cá nhân</option>
        <option value="work">Công việc</option>
        <option value="grocery">Danh sách mua sắm</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Đang thêm...' : 'Thêm'}
      </button>
    </form>
  );
}

export default AddTask;