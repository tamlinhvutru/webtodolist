import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '../types';

const QUERY_KEY = ['tasks'];

const getTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem('token');
  console.log('Fetching tasks, Token:', token);
  if (!token) throw new Error('User not authenticated: No token available');

  const response = await fetch('http://localhost:3000/tasks', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch tasks: ${errorText}`);
  }
  const data = await response.json();
  return data.map((task: any) => ({
    ...task,
    created_at: task.created_at ? new Date(task.created_at).toISOString() : new Date().toISOString(),
    updated_at: task.updated_at ? new Date(task.updated_at).toISOString() : new Date().toISOString(),
  }));
};

const addTask = async (task: Partial<Task>): Promise<Task> => {
  const token = localStorage.getItem('token');
  console.log('Adding task, Token:', token);
  if (!token) throw new Error('User not authenticated: No token available');

  const response = await fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...task,
      order: task.order ?? 0,
      created_at: task.created_at ?? new Date().toISOString(),
      updated_at: task.updated_at ?? new Date().toISOString(),
      deadline: task.deadline,
      list: task.list || 'personal',
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add task: ${errorText}`);
  }
  return response.json();
};

const editTask = async ({ id, data }: { id: number; data: Partial<Task> }): Promise<Task> => {
  const token = localStorage.getItem('token');
  console.log('Editing task, Token:', token);
  if (!token) throw new Error('User not authenticated: No token available');

  const response = await fetch(`http://localhost:3000/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...data,
      updated_at: new Date().toISOString(),
      deadline: data.deadline,
      list: data.list || 'personal',
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update task: ${errorText}`);
  }
  return response.json();
};

const deleteTask = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  console.log('Deleting task, Token:', token);
  if (!token) throw new Error('User not authenticated: No token available');

  const response = await fetch(`http://localhost:3000/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete task: ${errorText}`);
  }
};

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
    enabled: !!localStorage.getItem('token'),
  });

  const addTaskMutation = useMutation({
    mutationFn: (task: Partial<Task>) => addTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
    },
  });

  const editTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => editTask({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error editing task:', error);
    },
  });

  const removeTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    tasksQuery,
    addTask: addTaskMutation,
    editTask: editTaskMutation,
    removeTask: removeTaskMutation,
  };
}