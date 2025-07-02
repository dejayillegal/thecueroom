-- TheCueRoom Database Schema for Supabase (Free PostgreSQL)
-- Compatible with all free hosting platforms

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  stage_name VARCHAR,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  bio TEXT,
  profile_image_url VARCHAR,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_until TIMESTAMP,
  platforms JSONB DEFAULT '{}',
  genres JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR,
  tags JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post likes table
CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gigs table
CREATE TABLE gigs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  venue VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  event_date TIMESTAMP NOT NULL,
  ticket_price VARCHAR,
  ticket_link VARCHAR,
  image_url VARCHAR,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- News table
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT,
  source VARCHAR,
  url VARCHAR,
  image_url VARCHAR,
  published_at TIMESTAMP,
  is_spotlight BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  spotify_url VARCHAR,
  cover_image_url VARCHAR,
  tracks JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR DEFAULT 'open',
  admin_response TEXT,
  temp_password VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Sessions table for PostgreSQL session storage
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Performance indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_gigs_event_date ON gigs(event_date);
CREATE INDEX idx_gigs_location ON gigs(location);
CREATE INDEX idx_news_spotlight ON news(is_spotlight, created_at DESC);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Insert sample admin user (password: admin123)
INSERT INTO users (id, email, username, stage_name, password_hash, first_name, is_admin, is_verified, email_verified) 
VALUES (
  'admin_user_001',
  'admin@thecueroom.xyz',
  'admin',
  'TheCueRoom Admin',
  '$2b$10$rWJe9X1A4QQZjR5X8xR5xO5N5N5N5N5N5N5N5N5N5N5N5N5N5N5N5N',
  'Admin',
  true,
  true,
  true
);

-- Insert sample data for testing
INSERT INTO news (title, content, source, url, is_spotlight) VALUES
('Underground Techno Festival Announced', 'Major underground festival coming to Mumbai', 'Electronic Music India', 'https://example.com', true),
('New Venue Opens in Bangalore', 'State-of-the-art sound system for electronic music', 'Bangalore Beat', 'https://example.com', false);

INSERT INTO playlists (title, description, spotify_url) VALUES
('Underground Techno Mix Vol. 1', 'Best underground tracks from India', 'https://spotify.com/playlist/1'),
('House Vibes India', 'Deep house selections from Indian artists', 'https://spotify.com/playlist/2');