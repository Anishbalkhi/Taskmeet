import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getUserTasks, updateTaskStatus, assignTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUserTasks);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', assignTask);
router.delete('/:id', deleteTask);

export default router;
