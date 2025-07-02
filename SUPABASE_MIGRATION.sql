-- TheCueRoom Database Migration for Supabase
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table (required for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY NOT NULL,
    sess JSONB NOT NULL,
    expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    username VARCHAR UNIQUE,
    password VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "stageName" VARCHAR,
    "profileImageUrl" VARCHAR,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "isSuspended" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "securityQuestion" VARCHAR,
    "securityAnswer" VARCHAR,
    "spotifyUrl" VARCHAR,
    "soundcloudUrl" VARCHAR,
    "youtubeUrl" VARCHAR,
    "instagramUrl" VARCHAR,
    "beatportUrl" VARCHAR,
    "bandcampUrl" VARCHAR,
    "mixcloudUrl" VARCHAR,
    "residentAdvisorUrl" VARCHAR,
    "preferredGenres" TEXT[],
    "bio" TEXT,
    "location" VARCHAR,
    "yearsActive" INTEGER
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    "userId" VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create gigs table
CREATE TABLE IF NOT EXISTS gigs (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    venue VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    "ticketUrl" VARCHAR,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    "spotifyUrl" VARCHAR,
    genre VARCHAR,
    duration INTEGER,
    "trackCount" INTEGER,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT,
    source VARCHAR NOT NULL,
    url VARCHAR NOT NULL UNIQUE,
    "imageUrl" VARCHAR,
    "publishedAt" TIMESTAMPTZ,
    "isSpotlight" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    "userId" VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR NOT NULL,
    priority VARCHAR DEFAULT 'medium',
    status VARCHAR DEFAULT 'open',
    "assignedTo" VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    "temporaryPassword" VARCHAR,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts("userId");
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date);
CREATE INDEX IF NOT EXISTS idx_gigs_active ON gigs("isActive");
CREATE INDEX IF NOT EXISTS idx_news_spotlight ON news("isSpotlight");
CREATE INDEX IF NOT EXISTS idx_news_published ON news("publishedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets("userId");
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users("isVerified");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (id, email, username, password, "firstName", "lastName", "stageName", "isAdmin", "isVerified", "emailVerified") VALUES
('admin_001', 'admin@thecueroom.xyz', 'admin', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'TheCueRoom Admin', true, true, true),
('user_001', 'user@thecueroom.xyz', 'testuser', '$2b$10$YourHashedPasswordHere', 'Test', 'User', 'Test DJ', false, true, true);

INSERT INTO playlists (title, description, "spotifyUrl", genre, duration, "trackCount") VALUES
('Underground Techno Mix Vol. 1', 'A journey through the deepest underground techno tracks', 'https://open.spotify.com/playlist/example1', 'Techno', 3600, 24),
('House Classics Collection', 'Timeless house tracks that defined the genre', 'https://open.spotify.com/playlist/example2', 'House', 4200, 28),
('Minimal Monday Sessions', 'Stripped down minimal techno for focused listening', 'https://open.spotify.com/playlist/example3', 'Minimal', 2700, 18);

INSERT INTO news (title, content, source, url, "publishedAt", "isSpotlight") VALUES
('New Underground Venue Opens in Mumbai', 'A new underground venue focusing on techno and house music has opened in Mumbai...', 'Electronic Music India', 'https://example.com/news1', NOW() - INTERVAL '2 days', true),
('Goa Electronic Music Festival Announces Lineup', 'The annual electronic music festival in Goa has announced its star-studded lineup...', 'Festival Guide', 'https://example.com/news2', NOW() - INTERVAL '1 day', false),
('Rising Indian Techno Artists to Watch', 'Spotlight on emerging techno artists from the Indian underground scene...', 'Techno Times', 'https://example.com/news3', NOW(), true);

INSERT INTO gigs (title, description, venue, location, date) VALUES
('Underground Techno Night', 'Raw techno session with local and international DJs', 'The Basement', 'Bangalore, Karnataka', NOW() + INTERVAL '7 days'),
('House Music Sunrise Session', 'Deep house vibes until sunrise', 'Rooftop Lounge', 'Mumbai, Maharashtra', NOW() + INTERVAL '14 days'),
('Minimal Monday', 'Weekly minimal techno gathering', 'Studio Space', 'Delhi, NCR', NOW() + INTERVAL '21 days');

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Everyone can view verified users" ON users FOR SELECT USING ("isVerified" = true);

CREATE POLICY "Everyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view their own tickets" ON support_tickets FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can create support tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid()::text = "userId");