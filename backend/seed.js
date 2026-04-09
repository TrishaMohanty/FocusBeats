import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MusicTrack from './models/MusicTrack.js';

dotenv.config();

const tracks = [
  {
    title: "Syntax Error",
    category: "lofi",
    focus_level: "high",
    activity_type: "coding",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Deep Logic",
    category: "ambient",
    focus_level: "high",
    activity_type: "coding",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Midnight Compile",
    category: "lofi",
    focus_level: "medium",
    activity_type: "coding",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Quiet Pages",
    category: "ambient",
    focus_level: "low",
    activity_type: "reading",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    title: "The Librarian",
    category: "classical",
    focus_level: "medium",
    activity_type: "reading",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    title: "Focus Rain",
    category: "ambient",
    focus_level: "high",
    activity_type: "revision",
    embed_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing tracks
    await MusicTrack.deleteMany({});
    
    // Insert new tracks
    await MusicTrack.insertMany(tracks);
    
    console.log('Database seeded successfully with Focus Tracks!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
