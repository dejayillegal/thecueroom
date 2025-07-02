import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import express from 'express';
import { setupAuth } from './auth';
import { storage } from './storage';
import cors from 'cors';

// Initialize Express app
const app = express();

// CORS configuration for production
app.use(cors({
  origin: ['https://thecueroom.xyz', 'https://www.thecueroom.xyz'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up authentication
setupAuth(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: 'production'
  });
});

// User management endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      stageName: user.stageName,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Posts endpoints
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await storage.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const post = await storage.createPost({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Gigs endpoints
app.get('/api/gigs', async (req, res) => {
  try {
    const gigs = await storage.getAllGigs();
    res.json(gigs);
  } catch (error) {
    console.error('Error fetching gigs:', error);
    res.status(500).json({ message: 'Failed to fetch gigs' });
  }
});

// News endpoints
app.get('/api/news', async (req, res) => {
  try {
    const news = await storage.getAllNews();
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

// Playlists endpoints
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await storage.getAllPlaylists();
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Failed to fetch playlists' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};