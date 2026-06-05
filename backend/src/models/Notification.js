import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['task_assigned', 'workspace_invite'],
    required: true
  },
  read: { type: Boolean, default: false },
  // task_assigned meta
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  // workspace_invite meta
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  inviteRole: { type: String, default: 'member' },
  inviteStatus: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  // generic message
  message: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'notifications'
});

export default mongoose.model('Notification', notificationSchema);
