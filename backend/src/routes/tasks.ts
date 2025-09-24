import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask); // Cập nhật toàn bộ task
router.delete("/:id", deleteTask);

export default router;