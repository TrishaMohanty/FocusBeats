import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  focus_score: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
