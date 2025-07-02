# TheCueRoom Developer Guide

> **Comprehensive development documentation for TheCueRoom platform**

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Environment](#development-environment)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Authentication System](#authentication-system)
- [Testing Guidelines](#testing-guidelines)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)

## Architecture Overview

### System Design

TheCueRoom follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │  PostgreSQL DB  │
│                 │    │                 │    │                 │
│ ▸ Components    │◄──►│ ▸ API Routes    │◄──►│ ▸ Users         │
│ ▸ Pages         │    │ ▸ Middleware    │    │ ▸ Posts         │
│ ▸ Hooks         │    │ ▸ Services      │    │ ▸ Comments      │
│ ▸ Utils         │    │ ▸ Auth          │    │ ▸ Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Principles

1. **Type Safety**: TypeScript throughout the entire stack
2. **Shared Types**: Common types defined in `shared/schema.ts`
3. **Component Reusability**: Modular UI components with shadcn/ui
4. **Performance**: Optimized queries and caching strategies
5. **Security**: Authentication, validation, and sanitization

## Development Environment

### Required Tools

```bash
# Core Requirements
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14.0

# Development Tools
Git
VS Code (recommended)
Replit (for hosting)
```

### VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-typescript.typescript",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

### Environment Setup

1. **Clone Repository**
```bash
git clone https://github.com/TheCueRoom/platform.git
cd platform
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development**
```bash
npm run dev
```

## Frontend Development

### Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui base components
│   │   ├── layout/         # Layout components
│   │   ├── feed/           # Feed-related components
│   │   └── forms/          # Form components
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── styles/             # Global styles
```

### Component Development

#### Component Template

```typescript
// client/src/components/example/ExampleComponent.tsx
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ExampleComponentProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const ExampleComponent: FC<ExampleComponentProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
};
```

#### Styling Guidelines

1. **Use Tailwind CSS** for all styling
2. **Use cn() utility** for conditional classes
3. **Follow mobile-first** responsive design
4. **Use CSS variables** for theme colors

```typescript
// Good
<div className={cn(
  "flex items-center p-4",
  isActive && "bg-primary text-primary-foreground",
  className
)}>

// Bad
<div style={{display: 'flex', padding: '16px'}}>
```

### State Management

#### React Query for Server State

```typescript
// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function usePosts() {
  return useQuery({
    queryKey: ['/api/posts'],
    staleTime: 30000, // 30 seconds
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostData) => 
      apiRequest('/api/posts', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });
}
```

#### Local State with useState

```typescript
// For component-level state
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('posts');
```

### Form Handling

#### React Hook Form + Zod

```typescript
// components/forms/CreatePostForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertPostSchema } from '@shared/schema';

type CreatePostData = z.infer<typeof insertPostSchema>;

export function CreatePostForm() {
  const form = useForm<CreatePostData>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  const onSubmit = (data: CreatePostData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Backend Development

### Project Structure

```
server/
├── config/              # Configuration files
├── services/            # Business logic services
├── utils/               # Utility functions
├── auth.ts              # Authentication middleware
├── routes.ts            # API route definitions
├── index.ts             # Server entry point
└── vite.ts              # Vite integration
```

### API Route Development

#### Route Template

```typescript
// server/routes.ts
import { Router } from 'express';
import { isAuthenticated } from './auth';
import { storage } from './storage';
import { insertPostSchema } from '@shared/schema';

const router = Router();

// GET endpoint
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await storage.getPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Protected POST endpoint
router.post('/api/posts', isAuthenticated, async (req, res) => {
  try {
    const validation = insertPostSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid data', 
        errors: validation.error.errors 
      });
    }

    const post = await storage.createPost({
      ...validation.data,
      userId: req.user.id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});
```

### Service Layer

```typescript
// server/services/PostService.ts
import { storage } from '../storage';
import { InsertPost, Post } from '@shared/schema';

export class PostService {
  static async createPost(data: InsertPost): Promise<Post> {
    // Business logic validation
    if (data.content.length < 10) {
      throw new Error('Post content too short');
    }

    // Content moderation
    const isAppropriate = await this.moderateContent(data.content);
    if (!isAppropriate) {
      throw new Error('Content violates community guidelines');
    }

    return await storage.createPost(data);
  }

  private static async moderateContent(content: string): Promise<boolean> {
    // Implementation depends on moderation service
    return true;
  }
}
```

### Error Handling

```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: err.message,
      field: err.field,
    });
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}
```

## Database Management

### Schema Definition

```typescript
// shared/schema.ts
import { pgTable, varchar, timestamp, text, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const posts = pgTable('posts', {
  id: varchar('id').primaryKey().default('gen_random_uuid()'),
  userId: varchar('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: text('tags').array(),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectPostSchema = createSelectSchema(posts);

// TypeScript types
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
```

### Migrations

```bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:push

# View database
npm run db:studio
```

### Database Queries

```typescript
// server/storage.ts
import { db } from './db';
import { posts, users } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export class DatabaseStorage {
  async getPosts(userId?: string) {
    const query = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          name: users.stageName,
          avatar: users.avatar,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    if (userId) {
      query.where(eq(posts.userId, userId));
    }

    return await query;
  }
}
```

## Authentication System

### Replit Auth Integration

```typescript
// server/auth.ts
import { Strategy } from 'openid-client/passport';
import passport from 'passport';

// Setup authentication
export async function setupAuth(app: Express) {
  const config = await getOidcConfig();
  
  const strategy = new Strategy({
    config,
    scope: 'openid email profile offline_access',
    callbackURL: '/api/callback',
  }, verify);

  passport.use(strategy);
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Admin middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### Frontend Authentication

```typescript
// hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };
}
```

## Testing Guidelines

### Unit Tests

```typescript
// __tests__/components/ExampleComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from '@/components/ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExampleComponent title="Test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

### API Tests

```typescript
// __tests__/api/posts.test.ts
import request from 'supertest';
import { app } from '../server';

describe('POST /api/posts', () => {
  it('creates a new post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        content: 'This is a test post content.',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Post');
  });

  it('validates required fields', async () => {
    await request(app)
      .post('/api/posts')
      .send({})
      .expect(400);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ExampleComponent
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
```typescript
// Lazy load components
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>
```

2. **Memoization**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = memo(({ data }) => {
  return <div>{data.title}</div>;
});
```

3. **Query Optimization**
```typescript
// Prefetch data
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['/api/posts'],
  });
}, []);

// Use stale-while-revalidate
useQuery({
  queryKey: ['/api/posts'],
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Backend Optimization

1. **Database Indexing**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

2. **Caching**
```typescript
// In-memory caching
const cache = new Map();

export async function getCachedPosts() {
  const cacheKey = 'recent_posts';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const posts = await storage.getPosts();
  cache.set(cacheKey, posts);
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return posts;
}
```

3. **Request Optimization**
```typescript
// Batch database queries
const [posts, users, comments] = await Promise.all([
  storage.getPosts(),
  storage.getUsers(),
  storage.getComments(),
]);
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=your-strong-secret
REPL_ID=your-repl-id
```

### Deployment Platforms

#### Replit Deployments
```bash
# Deploy to Replit
replit deploy
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Connect to Railway
railway link

# Deploy
railway up
```

### Health Checks

```typescript
// server/routes.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

## Best Practices

### Code Style

1. **Use TypeScript** for all new code
2. **Follow naming conventions**: camelCase for variables, PascalCase for components
3. **Write descriptive comments** for complex logic
4. **Use ESLint and Prettier** for consistent formatting

### Security

1. **Validate all input** with Zod schemas
2. **Sanitize user content** before storing
3. **Use parameterized queries** to prevent SQL injection
4. **Implement rate limiting** for API endpoints

### Performance

1. **Minimize bundle size** with tree shaking
2. **Optimize images** and use WebP format
3. **Implement lazy loading** for images and components
4. **Use CDN** for static assets

### Accessibility

1. **Use semantic HTML** elements
2. **Provide alt text** for images
3. **Ensure keyboard navigation** works
4. **Test with screen readers**

---

**Happy coding! 🎵**