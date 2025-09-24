import axios from 'axios';
import type { Task } from '../types';

const API_URL = 'http://localhost:3000/tasks'; // Replace with your backend URL

export const getTasks = () => axios.get<Task[]>(API_URL).then(res => res.data);

export const createTask = (task: Partial<Task>) => axios.post<Task>(API_URL, task).then(res => res.data);

export const updateTask = (id: number, task: Partial<Task>) => axios.put<Task>(`${API_URL}/${id}`, task).then(res => res.data);

export const deleteTask = (id: number) => axios.delete(`${API_URL}/${id}`).then(() => true);