export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  list?: string;
  created_at: string;
  updated_at: string;
  order: number;
  deadline?: string;
  userId?: string; // Thêm trường userId để phân biệt tài khoản
}