// drizzle/seed.ts

import { db } from '../server/db';
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

  // 1) Seed users
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
      emailVerified: true,
    },
    {
      id: 'admin-002',
      email: 'dejayillegal@gmail.com',
      password: hashPassword('adminpass123'),
      username: 'IllegalRaveLord',
      firstName: 'Dejay',
      lastName: 'Illegal',
      stageName: 'Illegal',
      bio: 'Master of midnight bunker techno.',
      city: 'Global Underground',
      isAdmin: true,
      isVerified: true,
      emailVerified: true,
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
      emailVerified: true,
    },
    {
      id: 'user-002',
      email: 'alice@thecueroom.xyz',
      password: hashPassword('alicepass'),
      username: 'acid_alice',
      firstName: 'Alice',
      lastName: 'Berlin',
      stageName: 'AcidAlice',
      city: 'Berlin',
      bio: 'Acid house devotee.',
      isVerified: true,
      isAdmin: false,
      emailVerified: true,
    },
    {
      id: 'user-003',
      email: 'bob@thecueroom.xyz',
      password: hashPassword('bobpass'),
      username: 'vinyl_bob',
      firstName: 'Bob',
      lastName: 'London',
      stageName: 'VinylBob',
      city: 'London',
      bio: 'Vinyl selector.',
      isVerified: true,
      isAdmin: false,
      emailVerified: true,
    },
    {
      id: 'user-004',
      email: 'carol@thecueroom.xyz',
      password: hashPassword('carolpass'),
      username: '909_queen',
      firstName: 'Carol',
      lastName: 'Chicago',
      stageName: '909Queen',
      city: 'Chicago',
      bio: 'Drum machine whisperer.',
      isVerified: true,
      isAdmin: false,
      emailVerified: true,
    },
  ]);

  // 2) Seed posts
  const base = await db.insert(posts).values([
    {
      userId: 'user-001',
      title: 'Welcome to TheCueRoom!',
      content: 'First post here—let’s get this techno train rolling! 🚂💥',
      tags: ['welcome', 'intro'],
    },
    {
      userId: 'admin-001',
      title: 'Platform Launch',
      content: 'We’re live! Expect bunker vibes, acid lines, and memes. Let’s go! 🎉',
      tags: ['announcement'],
    },
    {
      userId: 'user-002',
      title: 'Loop Pedal + Techno Experiment',
      content:
        'Layered a loop pedal onto my latest track and it sounded like a rave in a submarine. Anyone else underwater-looping? 🐋🔄',
      tags: ['techno', 'loop', 'experiment'],
    },
    {
      userId: 'user-002',
      title: 'Meme: Wrong Track',
      content: '"When you hear Titanic in a 140bpm set… 🚢💔"',
      tags: ['meme', 'funny'],
    },
  ]).returning();

  const extra = await db.insert(posts).values([
    {
      userId: 'user-003',
      title: 'Vinyl-Only Friday at Fabric',
      content:
        'No USBs allowed, all wax. Who’s ready to blow the roof off with crate diggin’? 🎶💿',
      tags: ['vinyl', 'fabric', 'event'],
    },
    {
      userId: 'user-004',
      title: '909 Battery Died Mid-Set',
      content: 'Cueing live kicks when the 909 dies… had to ghost-kick with my elbow 😂🤘',
      tags: ['gearfail', '909', 'djlife'],
    },
    {
      userId: 'user-001',
      title: 'Acid Visa Approved',
      content: 'That squelchy acid line needed its own visa—entry granted! 🛂🔊',
      tags: ['acid', 'humor'],
    },
    {
      userId: 'user-003',
      title: 'Berlin Bunker Rave',
      content:
        'Walls shaking, bass rattling—bunker raves are where the underground breathes. Who’s been? 🤘',
      tags: ['berlin', 'rave'],
    },
    {
      userId: 'user-002',
      title: 'Meme: Titanic Techno',
      content: '"Hold on, Titanic in the tracklist?" 🤦‍♂️⚓️',
      tags: ['meme', 'funny'],
    },
  ]).returning();

  // 3) Seed comments
  await db.insert(comments).values([
    { userId: 'user-001', postId: base[0].id, content: 'So hyped for this community! 🔥' },
    { userId: 'admin-001', postId: base[0].id, content: 'Let’s make some noise! 🚀' },
    { userId: 'user-003', postId: base[1].id, content: 'Congrats on the launch—let’s rave! 🎉' },

    { userId: 'user-004', postId: base[2].id, content: 'Underwater rave sounds epic! 🐠' },
    { userId: 'user-001', postId: base[3].id, content: '🤣 Titanic techno crossover!' },

    { userId: 'admin-001', postId: extra[0].id, content: 'Vinyl-only = respect. See you on the floor!' },
    { userId: 'user-002', postId: extra[1].id, content: 'Elbow kicks FTW! 😂' },
    { userId: 'user-004', postId: extra[2].id, content: 'Visa stamped—next stop, acid land! ✈️' },
    { userId: 'user-003', postId: extra[3].id, content: 'Bunker vibes forever. 🤘' },
    { userId: 'user-001', postId: extra[4].id, content: 'Classic meme moment! 🤣' },
  ]);

  // 4) One sample meme
  await db.insert(memes).values([
    {
      userId: 'user-001',
      prompt: 'When the beat finally drops',
      imageUrl: 'https://example.com/funny-meme.jpg',
      category: 'funny',
    },
  ]);

  // 5) Sample playlist
  await db.insert(playlists).values([
    {
      title: 'Techno Bunker',
      description: 'Hard-hitting underground techno vibes.',
      spotifyId: '37i9dQZF1EIWGXYYAEzkt8',
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1EIWGXYYAEzkt8',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1EIWGXYYAEzkt8',
      genre: 'techno',
      duration: '1h 58m',
    },
  ]);

  // 6) Sample support ticket
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
