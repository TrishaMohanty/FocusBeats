import mongoose from 'mongoose';

const plannerEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  scheduled_date: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: null,
  }
}, {
  timestamps: true,
});

export default mongoose.model('PlannerEntry', plannerEntrySchema);
