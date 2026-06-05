import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Todo', 'InProgress', 'Completed', 'Blocked'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: { type: Date, default: null },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tasks'
});

taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema);
