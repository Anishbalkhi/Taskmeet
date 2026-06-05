import Notification from '../models/Notification.js';
import Workspace from '../models/Workspace.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('task', 'title workspace')
    .populate('workspace', 'name')
    .populate('invitedBy', 'name email')
    .sort({ created_at: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

  res.json({
    success: true,
    data: notifications.map(formatNotification),
    unreadCount,
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notif) return next(new ErrorResponse('Notification not found', 404));
  res.json({ success: true });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

export const acceptInvite = asyncHandler(async (req, res, next) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
    type: 'workspace_invite',
    inviteStatus: 'pending',
  });
  if (!notif) return next(new ErrorResponse('Invite not found or already handled', 404));

  const workspace = await Workspace.findById(notif.workspace);
  if (!workspace) return next(new ErrorResponse('Workspace no longer exists', 404));

  const alreadyMember = workspace.members.some(m => String(m.user) === String(req.user._id));
  if (!alreadyMember) {
    workspace.members.push({ user: req.user._id, role: notif.inviteRole || 'member' });
    await workspace.save();
  }

  notif.inviteStatus = 'accepted';
  notif.read = true;
  await notif.save();

  res.json({ success: true, message: `You joined ${workspace.name}!`, workspaceId: workspace._id });
});

export const declineInvite = asyncHandler(async (req, res, next) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
    type: 'workspace_invite',
    inviteStatus: 'pending',
  });
  if (!notif) return next(new ErrorResponse('Invite not found or already handled', 404));

  notif.inviteStatus = 'declined';
  notif.read = true;
  await notif.save();

  res.json({ success: true, message: 'Invitation declined.' });
});

function formatNotification(n) {
  return {
    id: n._id?.toString(),
    type: n.type,
    read: n.read,
    message: n.message,
    inviteStatus: n.inviteStatus,
    inviteRole: n.inviteRole,
    task: n.task ? { id: n.task._id?.toString(), title: n.task.title } : null,
    workspace: n.workspace ? { id: n.workspace._id?.toString(), name: n.workspace.name } : null,
    invitedBy: n.invitedBy
      ? { id: n.invitedBy._id?.toString(), name: n.invitedBy.name, email: n.invitedBy.email }
      : null,
    created_at: n.created_at,
  };
}
