export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  stageName?: string | null;
  profileImageUrl: string | null;
  username: string | null;
  bio: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  verificationLinks: any;
  avatarConfig: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: number;
  userId: string;
  title: string;
  content: string;
  tags: string[] | null;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isModerated: boolean;
  createdAt: Date;
  user: User;
}

export interface Comment {
  id: number;
  userId: string;
  postId: number;
  content: string;
  isModerated: boolean;
  createdAt: Date;
  user: User;
}

export interface Meme {
  id: number;
  userId: string;
  prompt: string;
  imageUrl: string;
  category: string;
  isNSFW: boolean;
  likesCount: number;
  createdAt: Date;
  user: User;
}

export interface NewsArticle {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: Date | null;
  isSpotlight: boolean;
  createdAt: Date;
}

export interface Gig {
  id: number;
  title: string;
  description: string | null;
  venue: string;
  date: Date;
  location: string;
  artistIds: string[] | null;
  ticketUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  spotifyId: string;
  embedUrl: string;
  trackCount: number;
  followerCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AvatarConfig {
  style: 'techno' | 'house' | 'minimal' | 'acid';
  accessory: 'headphones' | 'sunglasses' | 'cap' | 'none';
  color: 'green' | 'blue' | 'purple' | 'red' | 'yellow';
  background: 'dark' | 'neon' | 'gradient';
  musicElement: 'vinyl' | 'waveform' | 'speaker' | 'mixer';
}

export interface ModerationLog {
  id: number;
  targetType: string;
  targetId: string;
  action: string;
  reason: string | null;
  moderatorId: string | null;
  isAutoModerated: boolean;
  createdAt: Date;
}
