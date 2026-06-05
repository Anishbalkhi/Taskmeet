import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  acceptInvite,
  declineInvite
} from '../controllers/notificationController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.post('/:id/accept', acceptInvite);
router.post('/:id/decline', declineInvite);

export default router;
