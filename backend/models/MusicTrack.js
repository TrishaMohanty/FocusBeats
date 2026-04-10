import mongoose from 'mongoose';

const musicTrackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allow system tracks
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['lofi', 'ambient', 'classical', 'electronic', 'nature', 'cyberpunk', 'piano'],
    required: true,
  },
  station: {
    type: String,
    default: 'Aura Collective',
  },
  focus_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  activity_type: {
    type: String,
    required: true,
  },
  embed_url: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

export default mongoose.model('MusicTrack', musicTrackSchema);
