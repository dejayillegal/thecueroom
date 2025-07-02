import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  stageName: varchar("stage_name").notNull(),
  dateOfBirth: varchar("date_of_birth"),
  city: varchar("city"),
  profileImageUrl: varchar("profile_image_url"),
  avatar: text("avatar"),
  username: varchar("username").unique().notNull(),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  isAdmin: boolean("is_admin").default(false),
  isSuspended: boolean("is_suspended").default(false),
  verificationLinks: jsonb("verification_links"),
  avatarConfig: jsonb("avatar_config"),
  securityQuestion: text("security_question"),
  securityAnswer: text("security_answer"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  forcePasswordChange: boolean("force_password_change").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.postId)
]);

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  parentId: integer("parent_id").references(() => comments.id),
  content: text("content").notNull(),
  mentions: text("mentions").array(),
  memeImageUrl: text("meme_image_url"), // Support for meme attachments
  memeImageData: text("meme_image_data"), // Base64 data for thumbnails
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post reactions (one per user per post)
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // 'heart', 'like', 'dislike', etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.postId) // Enforce one reaction per user per post
]);

// News articles from RSS feeds
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: text("url").notNull().unique(),
  imageUrl: text("image_url"),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at"),
  isSpotlight: boolean("is_spotlight").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Generated memes
export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  isNSFW: boolean("is_nsfw").default(false),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gigs (admin only)
export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  venue: text("venue").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  artistIds: text("artist_ids").array(),
  ticketUrl: text("ticket_url"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spotify playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  spotifyId: text("spotify_id").notNull().unique(),
  embedUrl: text("embed_url").notNull(),
  trackCount: integer("track_count").default(0),
  followerCount: integer("follower_count").default(0),
  genre: text("genre"),
  duration: text("duration"),
  spotifyUrl: text("spotify_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Moderation logs
export const moderationLogs = pgTable("moderation_logs", {
  id: serial("id").primaryKey(),
  targetType: text("target_type").notNull(), // 'post', 'comment', 'meme', 'user'
  targetId: text("target_id").notNull(),
  action: text("action").notNull(), // 'flag', 'approve', 'remove', 'suspend'
  reason: text("reason"),
  moderatorId: varchar("moderator_id").references(() => users.id),
  isAutoModerated: boolean("is_auto_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin settings
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Music platform profiles
export const userMusicProfiles = pgTable("user_music_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  platform: varchar("platform", { length: 50 }).notNull(), // 'spotify', 'soundcloud', etc.
  username: varchar("username", { length: 255 }).notNull(),
  profileUrl: varchar("profile_url", { length: 500 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  followers: integer("followers").default(0),
  tracks: integer("tracks").default(0),
  metadata: jsonb("metadata"), // Additional platform-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tracks
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  bpm: integer("bpm"),
  musicalKey: varchar("key", { length: 10 }),
  duration: integer("duration"), // in seconds
  releaseDate: timestamp("release_date"),
  platforms: jsonb("platforms").notNull(), // Array of platform URLs
  embedCode: text("embed_code"),
  isPublic: boolean("is_public").default(true),
  likesCount: integer("likes_count").default(0),
  playsCount: integer("plays_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Curated playlists
export const curatedPlaylists = pgTable("curated_playlists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }).notNull(),
  mood: varchar("mood", { length: 100 }),
  bpmRange: jsonb("bpm_range"), // [min, max]
  trackIds: jsonb("track_ids").notNull(), // Array of track IDs
  curatorId: varchar("curator_id", { length: 255 }).notNull().references(() => users.id),
  isPublic: boolean("is_public").default(true),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform integrations for OAuth tokens
export const platformIntegrations = pgTable("platform_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Activity Logs
export const userLogs = pgTable("user_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  severity: varchar("severity", { length: 20 }).default("info"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter Subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences").default('{}'),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

// Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  ticketType: varchar("ticket_type", { length: 50 }).notNull().default("password_reset"), // password_reset, account_issue, technical_support, etc.
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("open"), // open, in_progress, resolved, closed
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  assignedTo: varchar("assigned_to", { length: 255 }).references(() => users.id),
  resolution: text("resolution"),
  tempPassword: varchar("temp_password", { length: 100 }), // Admin-only visible temporary password
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Analytics tracking
export const articleAnalytics = pgTable("article_analytics", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => newsArticles.id),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bandcamp integration settings
export const bandcampSettings = pgTable("bandcamp_settings", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").default(true),
  trendingEnabled: boolean("trending_enabled").default(true),
  spotlightEnabled: boolean("spotlight_enabled").default(true),
  refreshInterval: integer("refresh_interval").default(24),
  genres: jsonb("genres").default('["electronic", "techno", "house", "ambient"]'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  postLikes: many(postLikes),
  memes: many(memes),
  musicProfiles: many(userMusicProfiles),
  tracks: many(tracks),
  curatedPlaylists: many(curatedPlaylists),
  platformIntegrations: many(platformIntegrations),
  logs: many(userLogs),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(postLikes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

export const memesRelations = relations(memes, ({ one }) => ({
  user: one(users, {
    fields: [memes.userId],
    references: [users.id],
  }),
}));

export const userMusicProfilesRelations = relations(userMusicProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userMusicProfiles.userId],
    references: [users.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  user: one(users, {
    fields: [tracks.userId],
    references: [users.id],
  }),
}));

export const curatedPlaylistsRelations = relations(curatedPlaylists, ({ one }) => ({
  curator: one(users, {
    fields: [curatedPlaylists.curatorId],
    references: [users.id],
  }),
}));

export const platformIntegrationsRelations = relations(platformIntegrations, ({ one }) => ({
  user: one(users, {
    fields: [platformIntegrations.userId],
    references: [users.id],
  }),
}));

export const userLogsRelations = relations(userLogs, ({ one }) => ({
  user: one(users, {
    fields: [userLogs.userId],
    references: [users.id],
  }),
}));

export const articleAnalyticsRelations = relations(articleAnalytics, ({ one }) => ({
  article: one(newsArticles, {
    fields: [articleAnalytics.articleId],
    references: [newsArticles.id],
  }),
  user: one(users, {
    fields: [articleAnalytics.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  isModerated: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  isModerated: true,
  createdAt: true,
});

export const insertPostReactionSchema = createInsertSchema(postReactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemeSchema = createInsertSchema(memes).omit({
  id: true,
  likesCount: true,
  isNSFW: true,
  createdAt: true,
});

export const insertGigSchema = createInsertSchema(gigs).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  isSpotlight: true,
  createdAt: true,
});

export const insertMusicProfileSchema = createInsertSchema(userMusicProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;
export type Meme = typeof memes.$inferSelect;
export type InsertMeme = z.infer<typeof insertMemeSchema>;
export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type MusicProfile = typeof userMusicProfiles.$inferSelect;
export type InsertMusicProfile = z.infer<typeof insertMusicProfileSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  likesCount: true,
  playsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCuratedPlaylistSchema = createInsertSchema(curatedPlaylists).omit({
  id: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformIntegrationSchema = createInsertSchema(platformIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Extended Types with Relations
export type PostWithUser = Post & { user: User };
export type CommentWithUser = Comment & { user: User };
export type MemeWithUser = Meme & { user: User };
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type MusicProfileWithUser = MusicProfile & { user: User };
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;
export type TrackWithUser = Track & { user: User };
export type InsertCuratedPlaylist = z.infer<typeof insertCuratedPlaylistSchema>;
export type CuratedPlaylist = typeof curatedPlaylists.$inferSelect;
export type CuratedPlaylistWithUser = CuratedPlaylist & { curator: User };
export type InsertPlatformIntegration = z.infer<typeof insertPlatformIntegrationSchema>;
export type PlatformIntegration = typeof platformIntegrations.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// New table schemas
export const insertUserLogSchema = createInsertSchema(userLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertArticleAnalyticsSchema = createInsertSchema(articleAnalytics).omit({
  id: true,
  createdAt: true,
});

// New types
export type InsertUserLog = z.infer<typeof insertUserLogSchema>;
export type UserLog = typeof userLogs.$inferSelect;
export type UserLogWithUser = UserLog & { user: User };
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertArticleAnalytics = z.infer<typeof insertArticleAnalyticsSchema>;
export type ArticleAnalytics = typeof articleAnalytics.$inferSelect;
export type BandcampSettings = typeof bandcampSettings.$inferSelect;
