import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { sendWorkspaceInviteEmail } from '../services/emailService.js';

export const createWorkspace = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return next(new ErrorResponse('Workspace name is required', 400));
  }

  const workspace = await Workspace.create({
    name: name.trim(),
    description: description || '',
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  res.status(201).json({
    success: true,
    ...formatWorkspace(workspace, req.user._id),
  });
});

export const getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    'members.user': req.user._id,
  }).populate('members.user', 'name email');

  const result = workspaces.map(ws => {
    const member = ws.members.find(m => String(m.user._id) === String(req.user._id));
    return {
      id: ws._id,
      name: ws.name,
      description: ws.description,
      role: member?.role || 'member',
      memberCount: ws.members.length,
      created_at: ws.created_at,
    };
  });

  res.json({ success: true, data: result });
});

export const getWorkspaceMembers = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id).populate('members.user', 'name email');
  if (!workspace) return next(new ErrorResponse('Workspace not found', 404));

  const isMember = workspace.members.some(m => String(m.user._id) === String(req.user._id));
  if (!isMember) return next(new ErrorResponse('Not a member of this workspace', 403));

  const members = workspace.members.map(m => ({
    id: m.user._id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  res.json({ success: true, data: members });
});

export const inviteMember = asyncHandler(async (req, res, next) => {
  const { email, role: inviteRole } = req.body;
  if (!email) return next(new ErrorResponse('Email is required', 400));

  const allowed = ['member', 'manager', 'admin'];
  const memberRole = allowed.includes(inviteRole) ? inviteRole : 'member';

  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return next(new ErrorResponse('Workspace not found', 404));

  const requester = workspace.members.find(m => String(m.user) === String(req.user._id));
  if (!requester || !['owner', 'admin'].includes(requester.role)) {
    return next(new ErrorResponse('Not authorized to invite members', 403));
  }

  const invitee = await User.findOne({ email: email.toLowerCase() });
  if (!invitee) return next(new ErrorResponse('No user found with that email. They must register first.', 404));

  const alreadyMember = workspace.members.some(m => String(m.user) === String(invitee._id));
  if (alreadyMember) return next(new ErrorResponse('User is already a member', 400));

  const Notification = (await import('../models/Notification.js')).default;

  const existingInvite = await Notification.findOne({
    recipient: invitee._id,
    type: 'workspace_invite',
    workspace: workspace._id,
    inviteStatus: 'pending',
  });
  if (existingInvite) return next(new ErrorResponse('An invitation is already pending for this user', 400));

  await Notification.create({
    recipient: invitee._id,
    type: 'workspace_invite',
    workspace: workspace._id,
    invitedBy: req.user._id,
    inviteRole: memberRole,
    message: `${req.user.name || req.user.email} invited you to join "${workspace.name}" as ${memberRole}.`,
  });

  // Also send email notification
  sendWorkspaceInviteEmail(
    invitee.email,
    invitee.name || invitee.email,
    req.user.name || req.user.email,
    workspace.name,
    memberRole
  ).catch(err => console.error('Invite email failed:', err.message));

  res.json({
    success: true,
    message: `Invitation sent to ${invitee.name || invitee.email}. They'll see it in their notifications.`,
  });
});

export const removeMember = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return next(new ErrorResponse('Workspace not found', 404));

  const requester = workspace.members.find(m => String(m.user) === String(req.user._id));
  if (!requester || !['owner', 'admin'].includes(requester.role)) {
    return next(new ErrorResponse('Not authorized to remove members', 403));
  }

  const target = workspace.members.find(m => String(m.user) === String(req.params.memberId));
  if (!target) return next(new ErrorResponse('Member not found in workspace', 404));

  if (target.role === 'owner') {
    return next(new ErrorResponse('Cannot remove the workspace owner', 400));
  }

  workspace.members = workspace.members.filter(m => String(m.user) !== String(req.params.memberId));
  await workspace.save();

  res.json({ success: true, message: 'Member removed' });
});

function formatWorkspace(ws, userId) {
  const member = ws.members.find(m => String(m.user) === String(userId));
  return {
    id: ws._id,
    name: ws.name,
    description: ws.description,
    role: member?.role || 'owner',
    memberCount: ws.members.length,
    meetingCount: 0,
    created_at: ws.created_at,
  };
}
