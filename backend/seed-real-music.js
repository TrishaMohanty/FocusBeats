#!/usr/bin/env node

/**
 * Seed MongoDB with Real Cloudinary Music URLs
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Clears existing tracks
 * 3. Inserts real Cloudinary URLs with proper metadata
 * 4. Includes error handling and debugging
 * 
 * Usage: npm run seed-real-music
 */

import dotenv from 'dotenv';
import connectDB from './config/db.js';
import MusicTrack from './models/MusicTrack.js';
import logger from './utils/logger.js';

dotenv.config();

// Real Cloudinary URLs with metadata
const REAL_TRACKS = [
  {
    title: 'Flower Cup',
    category: 'lofi',
    station: 'Lofi Vibes',
    focus_level: 'medium',
    activity_type: 'coding',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017038/Lukrembo_-_Flower_Cup_freetouse.com_jyb0aw.mp3',
    cloudinary_id: 'focusbeats/music/Lukrembo_Flower_Cup'
  },
  {
    title: 'Little Voices',
    category: 'ambient',
    station: 'Gentle Flow',
    focus_level: 'low',
    activity_type: 'reading',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017035/Amine_Maxwell_-_Little_Voices_freetouse.com_hxugpl.mp3',
    cloudinary_id: 'focusbeats/music/Amine_Maxwell_Little_Voices'
  },
  {
    title: 'Honey Jam',
    category: 'lofi',
    station: 'Sweet Focus',
    focus_level: 'low',
    activity_type: 'planning',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017036/massobeats_-_honey_jam_freetouse.com_npmzxp.mp3',
    cloudinary_id: 'focusbeats/music/massobeats_honey_jam'
  },
  {
    title: 'Peach Prosecco',
    category: 'lofi',
    station: 'Sunset Studio',
    focus_level: 'medium',
    activity_type: 'coding',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017035/massobeats_-_peach_prosecco_freetouse.com_mfjvx5.mp3',
    cloudinary_id: 'focusbeats/music/massobeats_peach_prosecco'
  },
  {
    title: 'Meditation',
    category: 'nature',
    station: 'Zen Mode',
    focus_level: 'high',
    activity_type: 'testing',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017034/Aylex_-_Meditation_freetouse.com_ac8zyo.mp3',
    cloudinary_id: 'focusbeats/music/Aylex_Meditation'
  },
  {
    title: 'Florida Keys',
    category: 'lofi',
    station: 'Chill Beats',
    focus_level: 'medium',
    activity_type: 'planning',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017033/Hoffy_Beats_-_Florida_Keys_freetouse.com_wuelj4.mp3',
    cloudinary_id: 'focusbeats/music/Hoffy_Beats_Florida_Keys'
  },
  {
    title: 'Midnight',
    category: 'lofi',
    station: 'Deep Focus',
    focus_level: 'high',
    activity_type: 'debugging',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017032/massobeats_-_midnight_freetouse.com_zcyspj.mp3',
    cloudinary_id: 'focusbeats/music/massobeats_midnight'
  },
  {
    title: 'A Beautiful Garden',
    category: 'ambient',
    station: 'Nature Focus',
    focus_level: 'medium',
    activity_type: 'writing',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017032/Aventure_-_A_Beautiful_Garden_freetouse.com_ocl8fs.mp3',
    cloudinary_id: 'focusbeats/music/Aventure_Garden_1'
  },
  {
    title: 'A Beautiful Garden (Alt)',
    category: 'ambient',
    station: 'Nature Focus',
    focus_level: 'low',
    activity_type: 'reading',
    embed_url: 'https://res.cloudinary.com/ddbsrqucf/video/upload/v1776017027/Aventure_-_A_Beautiful_Garden_freetouse.com_1_lbspry.mp3',
    cloudinary_id: 'focusbeats/music/Aventure_Garden_2'
  }
];

async function seedRealMusic() {
  try {
    console.log('\n🎵 FocusBeats Real Music Seeding');
    console.log('================================\n');

    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear existing tracks
    console.log('🗑️  Clearing existing tracks from database...');
    const deleteResult = await MusicTrack.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing track(s)\n`);

    // Validate all URLs before insertion
    console.log('🔍 Validating Cloudinary URLs...');
    const invalidUrls = REAL_TRACKS.filter(track => {
      const isValid = track.embed_url.startsWith('https://res.cloudinary.com/');
      if (!isValid) {
        console.error(`   ❌ Invalid URL for "${track.title}": ${track.embed_url}`);
      }
      return !isValid;
    });

    if (invalidUrls.length > 0) {
      throw new Error(`${invalidUrls.length} track(s) have invalid URLs`);
    }
    console.log('✅ All URLs are valid\n');

    // Insert tracks
    console.log('📝 Inserting tracks into database...\n');
    for (const track of REAL_TRACKS) {
      try {
        const newTrack = await MusicTrack.create({
          ...track,
          user_id: null // System track
        });
        
        console.log(`  ✅ ${track.title}`);
        console.log(`     Category: ${track.category} | Focus: ${track.focus_level}`);
        console.log(`     Activity: ${track.activity_type}`);
        console.log(`     URL: ${track.embed_url.substring(0, 60)}...`);
        console.log(`     DB ID: ${newTrack._id}\n`);
      } catch (trackError) {
        console.error(`  ❌ Error inserting "${track.title}":`, trackError.message);
        logger.error(`Failed to insert track "${track.title}"`, trackError);
      }
    }

    // Verify insertion
    console.log('✏️  Verifying insertion...');
    const insertedTracks = await MusicTrack.find({});
    console.log(`✅ Successfully inserted ${insertedTracks.length} track(s)\n`);

    // Display summary
    console.log('📊 Database Summary:');
    console.log(`   Total Tracks: ${insertedTracks.length}`);
    console.log(`   System Tracks: ${insertedTracks.filter(t => !t.user_id).length}`);
    console.log(`   User Tracks: ${insertedTracks.filter(t => t.user_id).length}\n`);

    // Display categories
    const categories = [...new Set(insertedTracks.map(t => t.category))];
    console.log(`   Categories: ${categories.join(', ')}\n`);

    console.log('🎉 Real Music Seeding Complete!');
    console.log('✅ Database ready for frontend\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding Error:', error.message);
    logger.error('Real music seeding failed:', error);
    console.error('\n📋 Debug Info:');
    console.error('   - MongoDB URI configured:', !!process.env.MONGODB_URI);
    console.error('   - Cloudinary configured:', !!process.env.CLOUDINARY_CLOUD_NAME);
    console.error('   - Track count:', REAL_TRACKS.length);
    process.exit(1);
  }
}

seedRealMusic();
