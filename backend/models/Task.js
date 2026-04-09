import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  due_date: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

export default mongoose.model('Task', taskSchema);
