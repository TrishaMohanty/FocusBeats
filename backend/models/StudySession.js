import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration_minutes: {
    type: Number,
    required: true,
  },
  session_type: {
    type: String,
    enum: ['work', 'short_break', 'long_break'],
    required: true,
  },
  activity_type: {
    type: String,
    enum: [
      'reading', 'coding', 'revision', 'night_study', 'problem_solving', 
      'writing', 'research', 'design', 'review', 'learning', 
      'planning', 'creative_work', 'debugging', 'documentation', 
      'testing', 'refactoring', 'meeting', 'administration', 
      'maintenance', 'brainstorming', 'analysis', 'social'
    ],
    default: 'coding'
  },
  focus_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  task_name: {
    type: String,
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  completed_at: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: null,
  }
}, {
  timestamps: true,
});

export default mongoose.model('StudySession', studySessionSchema);
