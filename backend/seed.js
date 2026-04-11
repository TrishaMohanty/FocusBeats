import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MusicTrack from './models/MusicTrack.js';

dotenv.config();

const tracks = [
  {
    title: "Flower Cup",
    category: "lofi",
    station: "Lukrembo",
    focus_level: "medium",
    activity_type: "coding",
    embed_url: "/music/Lukrembo - Flower Cup (freetouse.com).mp3"
  },
  {
    title: "Midnight",
    category: "lofi",
    station: "Massobeats",
    focus_level: "high",
    activity_type: "debugging",
    embed_url: "/music/massobeats - midnight (freetouse.com).mp3"
  },
  {
    title: "Honey Jam",
    category: "lofi",
    station: "Massobeats",
    focus_level: "low",
    activity_type: "planning",
    embed_url: "/music/massobeats - honey jam (freetouse.com).mp3"
  },
  {
    title: "Little Voices",
    category: "ambient",
    station: "Amine Maxwell",
    focus_level: "low",
    activity_type: "reading",
    embed_url: "/music/Amine Maxwell - Little Voices (freetouse.com).mp3"
  },
  {
    title: "A Beautiful Garden",
    category: "ambient",
    station: "Aventure",
    focus_level: "medium",
    activity_type: "writing",
    embed_url: "/music/Aventure - A Beautiful Garden (freetouse.com).mp3"
  },
  {
    title: "Meditation",
    category: "nature",
    station: "Aylex",
    focus_level: "high",
    activity_type: "brainstorming",
    embed_url: "/music/Aylex - Meditation (freetouse.com).mp3"
  },
  {
    title: "Florida Keys",
    category: "lofi",
    station: "Hoffy Beats",
    focus_level: "medium",
    activity_type: "research",
    embed_url: "/music/Hoffy Beats - Florida Keys (freetouse.com).mp3"
  },
  {
    title: "Peach Prosecco",
    category: "lofi",
    station: "Massobeats",
    focus_level: "medium",
    activity_type: "analysis",
    embed_url: "/music/massobeats - peach prosecco (freetouse.com).mp3"
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/focusbeats');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    // Clear existing tracks
    await MusicTrack.deleteMany({});
    console.log('Cleared existing tracks...');
    
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
