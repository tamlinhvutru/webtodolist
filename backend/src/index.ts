import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';
import { authenticateToken } from './middleware/authMiddleware';

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Cho phép frontend Vite
app.use(express.json());

// Routes
app.use('/auth', authRoutes); // Route auth không cần xác thực
app.use('/tasks', authenticateToken, taskRoutes); // Áp dụng middleware JWT

// Server configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});