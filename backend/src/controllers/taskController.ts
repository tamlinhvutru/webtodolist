import { Request, Response } from 'express';
import pool from '../db';

// Middleware giả định để trích xuất userId từ token (cần thêm vào dự án)
declare module 'express' {
  interface Request {
    user?: { id: number };
  }
}

// Lấy danh sách task
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Lấy từ middleware JWT
    if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID found' });

    const result = await pool.query(
      'SELECT * FROM tasks WHERE userId = $1 ORDER BY status, "order"',
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// Tạo task mới
export const createTask = async (req: Request, res: Response) => {
  const { title, description, status, order, created_at, updated_at, deadline, list } = req.body;
  const userId = req.user?.id; // Lấy từ middleware JWT
  if (!title || !status || !userId) {
    return res.status(400).json({ error: 'Title, status, and userId are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tasks 
        (title, description, status, "order", created_at, updated_at, deadline, list, userId) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title,
        description || '',
        status,
        order || 0,
        created_at || new Date(),
        updated_at || new Date(),
        deadline || null,
        list || 'personal',
        userId
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// Cập nhật task
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, order, deadline, list } = req.body;
  const userId = req.user?.id; // Lấy từ middleware JWT
  if (!id || !userId) {
    return res.status(400).json({ error: 'ID and userId are required' });
  }
  try {
    const safeList = list || 'personal';
    const result = await pool.query(
      `UPDATE tasks 
       SET title=COALESCE($1, title), description=COALESCE($2, description), 
           status=COALESCE($3, status), "order"=COALESCE($4, "order"), 
           updated_at=NOW(), deadline=COALESCE($5, deadline), list=$6 
       WHERE id=$7 AND userId=$8 
       RETURNING *`,
      [title, description, status, order, deadline, safeList, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// Xóa task
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id; // Lấy từ middleware JWT
  if (!id || !userId) {
    return res.status(400).json({ error: 'ID and userId are required' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id=$1 AND userId=$2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// Cập nhật trạng thái task
export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, order, deadline, list } = req.body;
  const userId = req.user?.id; // Lấy từ middleware JWT
  if (!status || !userId) {
    return res.status(400).json({ error: 'Status and userId are required' });
  }
  try {
    const safeList = list || 'personal';
    const result = await pool.query(
      'UPDATE tasks SET status=$1, "order"=COALESCE($2, "order"), updated_at=NOW(), deadline=COALESCE($3, deadline), list=$4 WHERE id=$5 AND userId=$6 RETURNING *',
      [status, order, deadline, safeList, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};