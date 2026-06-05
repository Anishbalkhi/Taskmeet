import Task from '../models/Task.js';
import Workspace from '../models/Workspace.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const createTask = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return next(new ErrorResponse('Workspace not found', 404));

  const isMember = workspace.members.some(m => String(m.user) === String(req.user._id));
  if (!isMember) return next(new ErrorResponse('Not a member of this workspace', 403));

  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  if (!title || !title.trim()) return next(new ErrorResponse('Task title is required', 400));

  const task = await Task.create({
    title: title.trim(),
    description: description || '',
    status: status || 'Todo',
    priority: priority || 'Medium',
    dueDate: dueDate || null,
    workspace: req.params.id,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
  });

  if (assignedTo && String(assignedTo) !== String(req.user._id)) {
    try {
      await Notification.create({
        recipient: assignedTo,
        type: 'task_assigned',
        task: task._id,
        workspace: req.params.id,
        invitedBy: req.user._id,
        message: `${req.user.name || req.user.email} assigned you a task: "${task.title}" in ${workspace.name}.`,
      });
    } catch (err) {
      console.warn('Could not create task notification:', err.message);
    }
  }

  res.status(201).json(formatTask(task));
});

export const getWorkspaceTasks = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return next(new ErrorResponse('Workspace not found', 404));

  const isMember = workspace.members.some(m => String(m.user) === String(req.user._id));
  if (!isMember) return next(new ErrorResponse('Not a member of this workspace', 403));

  const tasks = await Task.find({ workspace: req.params.id })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ created_at: -1 });

  res.json({ success: true, data: tasks.map(formatTask) });
});

export const getUserTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
  })
    .populate('workspace', 'name')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ created_at: -1 });

  res.json({ success: true, data: tasks.map(formatTask) });
});

export const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['Todo', 'InProgress', 'Completed', 'Blocked'];
  if (!allowed.includes(status)) {
    return next(new ErrorResponse(`Status must be one of: ${allowed.join(', ')}`, 400));
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email').populate('createdBy', 'name email');

  if (!task) return next(new ErrorResponse('Task not found', 404));

  res.json({ success: true, ...formatTask(task) });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const { title, description, priority, dueDate, assignedTo, status } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  const workspace = await Workspace.findById(task.workspace);
  const member = workspace?.members.find(m => String(m.user) === String(req.user._id));
  const canEdit =
    String(task.createdBy) === String(req.user._id) ||
    (member && ['admin', 'manager'].includes(member.role));

  if (!canEdit) return next(new ErrorResponse('Not authorized to edit this task', 403));

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  if (status !== undefined) task.status = status;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.json({ success: true, ...formatTask(populated) });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  const workspace = await Workspace.findById(task.workspace);
  const member = workspace?.members.find(m => String(m.user) === String(req.user._id));
  const canDelete =
    String(task.createdBy) === String(req.user._id) ||
    (member && ['admin', 'manager'].includes(member.role));

  if (!canDelete) return next(new ErrorResponse('Not authorized to delete this task', 403));

  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

export const assignTask = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { assignedTo: userId || null },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email');

  if (!task) return next(new ErrorResponse('Task not found', 404));
  res.json({ success: true, ...formatTask(task) });
});

function formatTask(task) {
  const workspace = task.workspace
    ? (task.workspace._id
        ? { id: task.workspace._id.toString(), name: task.workspace.name }
        : task.workspace.toString())
    : null;

  const assignedTo = task.assignedTo
    ? (task.assignedTo._id
        ? { id: task.assignedTo._id.toString(), name: task.assignedTo.name, email: task.assignedTo.email }
        : task.assignedTo.toString())
    : null;

  const createdBy = task.createdBy
    ? (task.createdBy._id
        ? { id: task.createdBy._id.toString(), name: task.createdBy.name, email: task.createdBy.email }
        : task.createdBy.toString())
    : null;

  return {
    id: task._id?.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    workspace,
    assignedTo,
    createdBy,
    created_at: task.created_at,
  };
}
