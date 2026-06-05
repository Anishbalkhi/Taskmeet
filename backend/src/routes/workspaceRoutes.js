import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceMembers,
  inviteMember,
  removeMember
} from '../controllers/workspaceController.js';
import { createTask, getWorkspaceTasks } from '../controllers/taskController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createWorkspace);
router.get('/', getAllWorkspaces);
router.get('/:id/members', getWorkspaceMembers);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:memberId', removeMember);

// nested task routes under workspace
router.post('/:id/tasks', createTask);
router.get('/:id/tasks', getWorkspaceTasks);

export default router;
