import { db } from './db';
import {
  users,
  sessions,
  posts,
  comments,
  memes,
  playlists,
  gigs,
  supportTickets,
  userMusicProfiles,
} from '../shared/schema';
import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const buf = scryptSync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function seed() {
  console.log('🌱 Resetting and seeding TheCueRoom database...');

  // Truncate all tables
  await db.delete(comments);
  await db.delete(memes);
  await db.delete(posts);
  await db.delete(playlists);
  await db.delete(userMusicProfiles);
  await db.delete(gigs);
  await db.delete(supportTickets);
  await db.delete(sessions);
  await db.delete(users);

  // Insert basic login/admin user
  await db.insert(users).values([
    {
      id: 'admin-001',
      email: 'admin@thecueroom.xyz',
      password: hashPassword('adminpass123'),
      username: 'admin_cue',
      firstName: 'Admin',
      lastName: 'User',
      stageName: 'CueMaster',
      bio: 'Platform overlord.',
      city: 'Bangalore',
      isAdmin: true,
      isVerified: true,
      emailVerified: true
    },
    {
      id: 'user-001',
      email: 'user@thecueroom.xyz',
      password: hashPassword('userpass123'),
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      stageName: 'TestStage',
      city: 'Mumbai',
      bio: 'Seeded for login testing.',
      isVerified: true,
      isAdmin: false,
      emailVerified: true
    },
  ]);

  // Seed sample posts
  const insertedPosts = await db.insert(posts).values([
    {
      userId: 'user-001',
      title: 'First Post',
      content: 'Welcome to TheCueRoom! This is a test post.',
      tags: ['introduction', 'welcome'],
    },
    {
      userId: 'admin-001',
      title: 'Admin Drop',
      content: 'Launching the platform today. Let the techno begin.',
      tags: ['announcement'],
    },
  ]).returning();

  // Seed sample comments
  await db.insert(comments).values([
    {
      userId: 'user-001',
      postId: insertedPosts[0].id,
      content: 'Excited to be here! 🔥',
    },
    {
      userId: 'admin-001',
      postId: insertedPosts[0].id,
      content: 'Welcome aboard!',
    },
  ]);

  // Seed sample memes
  await db.insert(memes).values([
    {
      userId: 'user-001',
      prompt: 'When the beat finally drops',
      imageUrl: 'https://example.com/funny-meme.jpg',
      category: 'funny',
    },
  ]);

  // Seed a sample playlist
  await db.insert(playlists).values([
    {
      title: 'Techno Bunker',
      description: 'A hard-hitting selection of underground techno.',
      spotifyId: '37i9dQZF1EIWGXYYAEzkt8',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1EIWGXYYAEzkt8',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1EIWGXYYAEzkt8',
      genre: 'techno',
      duration: '1h 58m',
    },
  ]);

  // Seed a sample support ticket
  await db.insert(supportTickets).values([
    {
      email: 'user@thecueroom.xyz',
      firstName: 'Test',
      ticketType: 'feedback',
      subject: 'Loving the app!',
      description: 'Just wanted to say this is super cool.',
      priority: 'low',
    },
  ]);

  console.log('✅ Done: test data seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
