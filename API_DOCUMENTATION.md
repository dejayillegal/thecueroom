# TheCueRoom API Documentation

> **Complete API reference for the TheCueRoom platform**

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Posts](#posts-endpoints)
  - [Comments](#comments-endpoints)
  - [News](#news-endpoints)
  - [Gigs](#gigs-endpoints)
  - [Memes](#memes-endpoints)
  - [Admin](#admin-endpoints)

## Base URL

All API requests should be made to:
```
http://localhost:5000/api  # Development
https://your-domain.com/api  # Production
```

## Authentication

TheCueRoom uses session-based authentication with Replit Auth.

### Authentication Flow

1. **Login**: `GET /api/login` - Redirects to Replit Auth
2. **Callback**: `GET /api/callback` - Handles OAuth callback
3. **Logout**: `GET /api/logout` - Clears session and redirects

### Authenticated Requests

Include session cookie in requests. The frontend automatically handles this.

```javascript
// Frontend example
const response = await fetch('/api/posts', {
  credentials: 'include'  // Include session cookie
});
```

### Admin Access

Admin-only endpoints require the user to have admin privileges:
- `admin@thecueroom.com`
- `jmunuswa@gmail.com`

## Response Format

All API responses follow a consistent JSON format:

### Successful Response

```json
{
  "data": {
    // Response data
  },
  "message": "Success message (optional)",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **Posts**: 10 creates per 15 minutes
- **Comments**: 20 creates per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## API Endpoints

### Authentication Endpoints

#### Get Current User
```http
GET /api/auth/user
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "stageName": "DJ Example",
  "avatar": "avatar_data",
  "isAdmin": false,
  "isVerified": true
}
```

#### Login
```http
GET /api/login
```
Redirects to Replit Auth login page.

#### Logout
```http
GET /api/logout
```
Clears session and redirects to logout page.

### Users Endpoints

#### Get User Profile
```http
GET /api/users/:id
```

**Parameters:**
- `id` - User ID

**Response:**
```json
{
  "id": "user_123",
  "stageName": "DJ Example",
  "avatar": "avatar_data",
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### Update User Profile
```http
PUT /api/users/profile
```

**Body:**
```json
{
  "stageName": "New Stage Name",
  "avatar": "new_avatar_data"
}
```

#### Change Password
```http
POST /api/users/change-password
```

**Body:**
```json
{
  "currentPassword": "current123",
  "newPassword": "new123"
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `userId` - Filter by user ID
- `tag` - Filter by tag

**Response:**
```json
{
  "posts": [
    {
      "id": "post_123",
      "title": "Post Title",
      "content": "Post content...",
      "userId": "user_123",
      "tags": ["techno", "underground"],
      "likesCount": 5,
      "commentsCount": 3,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "author": {
        "id": "user_123",
        "stageName": "DJ Example",
        "avatar": "avatar_data"
      }
    }
  ],
  "totalCount": 100,
  "currentPage": 1,
  "totalPages": 5
}
```

#### Create Post
```http
POST /api/posts
```

**Body:**
```json
{
  "title": "Post Title",
  "content": "Post content with **markdown**",
  "tags": ["techno", "underground"]
}
```

#### Get Single Post
```http
GET /api/posts/:id
```

#### Update Post
```http
PUT /api/posts/:id
```

#### Delete Post
```http
DELETE /api/posts/:id
```

#### Like/Unlike Post
```http
POST /api/posts/:id/like
```

### Comments Endpoints

#### Get Comments for Post
```http
GET /api/posts/:postId/comments
```

**Query Parameters:**
- `limit` - Number of comments (default: 5)
- `offset` - Skip comments (default: 0)

#### Create Comment
```http
POST /api/posts/:postId/comments
```

**Body:**
```json
{
  "content": "Comment content with **markdown**",
  "memeImageUrl": "optional_meme_url"
}
```

#### Update Comment
```http
PUT /api/comments/:id
```

#### Delete Comment
```http
DELETE /api/comments/:id
```

#### Like/Unlike Comment
```http
POST /api/comments/:id/like
```

### News Endpoints

#### Get News Feed
```http
GET /api/feeds/rss
```

**Query Parameters:**
- `source` - RSS source name
- `limit` - Number of items (default: 10)

**Response:**
```json
{
  "items": [
    {
      "title": "News Title",
      "link": "https://example.com/article",
      "description": "Article description...",
      "pubDate": "2025-01-01T00:00:00.000Z",
      "image": "https://example.com/image.jpg",
      "source": "DJ Mag"
    }
  ]
}
```

#### Get Available News Sources
```http
GET /api/feeds/sources
```

### Gigs Endpoints

#### Get All Gigs
```http
GET /api/gigs
```

**Query Parameters:**
- `city` - Filter by city
- `date` - Filter by date (YYYY-MM-DD)
- `upcoming` - Only upcoming gigs (true/false)

#### Create Gig
```http
POST /api/gigs
```

**Body:**
```json
{
  "title": "Gig Title",
  "description": "Gig description...",
  "venue": "Club Name",
  "city": "Bangalore",
  "date": "2025-02-01",
  "time": "22:00",
  "ticketPrice": 500,
  "ticketLink": "https://tickets.com/gig"
}
```

#### RSVP to Gig
```http
POST /api/gigs/:id/rsvp
```

**Body:**
```json
{
  "status": "going"  // going, interested, not_going
}
```

### Memes Endpoints

#### Get Meme Templates
```http
GET /api/memes/templates
```

#### Get Specific Meme
```http
GET /api/memes/:id
```

#### Create Custom Meme
```http
POST /api/memes/create
```

**Body:**
```json
{
  "templateId": "template_123",
  "texts": [
    {
      "text": "Top text",
      "x": 100,
      "y": 50
    },
    {
      "text": "Bottom text",
      "x": 100,
      "y": 200
    }
  ]
}
```

### Admin Endpoints

All admin endpoints require admin privileges.

#### Get All Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `verified` - Filter by verification status
- `suspended` - Filter by suspension status

#### Suspend User
```http
POST /api/admin/users/:id/suspend
```

**Body:**
```json
{
  "reason": "Violation of community guidelines",
  "duration": 7  // days, or null for permanent
}
```

#### Unsuspend User
```http
POST /api/admin/users/:id/unsuspend
```

#### Delete User
```http
DELETE /api/admin/users/:id
```

#### Verify User
```http
POST /api/admin/users/:id/verify
```

#### Get Content Moderation Queue
```http
GET /api/admin/moderation
```

#### Moderate Content
```http
POST /api/admin/moderation/:id
```

**Body:**
```json
{
  "action": "approve",  // approve, reject, flag
  "reason": "Optional reason"
}
```

#### Get Platform Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 150,
    "verified": 45,
    "active": 120
  },
  "posts": {
    "total": 500,
    "thisWeek": 25
  },
  "comments": {
    "total": 1200,
    "thisWeek": 150
  }
}
```

## Code Examples

### Frontend API Usage

#### Fetch Posts with React Query
```typescript
import { useQuery } from '@tanstack/react-query';

function usePosts() {
  return useQuery({
    queryKey: ['/api/posts'],
    staleTime: 30000, // 30 seconds
  });
}
```

#### Create Post with Mutation
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => 
      apiRequest('/api/posts', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });
}
```

### Backend Route Implementation

#### Express Route Example
```typescript
import { Router } from 'express';
import { isAuthenticated } from './auth';
import { storage } from './storage';

const router = Router();

router.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await storage.getPosts({
      page: Number(page),
      limit: Number(limit)
    });
    
    res.json({
      posts: posts.data,
      totalCount: posts.total,
      currentPage: Number(page),
      totalPages: Math.ceil(posts.total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to fetch posts',
        code: 'SERVER_ERROR'
      }
    });
  }
});
```

## WebSocket Events

TheCueRoom supports real-time updates via WebSocket:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5000');
```

### Events

#### New Post
```json
{
  "type": "new_post",
  "data": {
    "id": "post_123",
    "title": "New Post",
    "author": "DJ Example"
  }
}
```

#### New Comment
```json
{
  "type": "new_comment",
  "data": {
    "id": "comment_123",
    "postId": "post_123",
    "content": "New comment",
    "author": "DJ Example"
  }
}
```

#### Post Liked
```json
{
  "type": "post_liked",
  "data": {
    "postId": "post_123",
    "likesCount": 6
  }
}
```

## Testing

### Test API with curl

#### Get Posts
```bash
curl -X GET http://localhost:5000/api/posts \
  -H "Content-Type: application/json"
```

#### Create Post (requires authentication)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"This is a test"}' \
  --cookie "session=your-session-cookie"
```

### Test Authentication
```bash
# Get current user
curl -X GET http://localhost:5000/api/auth/user \
  --cookie "session=your-session-cookie"
```

## API Client Libraries

### JavaScript/TypeScript Client
```typescript
class TheCueRoomAPI {
  private baseURL = 'http://localhost:5000/api';
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Posts
  async getPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/posts?${query}`);
  }
  
  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Comments
  async getComments(postId: string) {
    return this.request(`/posts/${postId}/comments`);
  }
  
  async createComment(postId: string, data: any) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

---

**Happy coding! 🎵**

For more information, see the [Developer Guide](DEVELOPER_GUIDE.md) and [Setup Instructions](SETUP_INSTRUCTIONS.md).