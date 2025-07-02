import { apiRequest, queryClient } from "@/lib/queryClient";

interface RealTimeUpdate {
  type: 'comment' | 'reaction' | 'notification';
  postId?: number;
  data: any;
}

class RealTimeService {
  private pollInterval: NodeJS.Timeout | null = null;
  private activePosts: Set<number> = new Set();
  private lastUpdateTimes: Map<string, number> = new Map();

  // Subscribe to real-time updates for a specific post
  subscribeToPost(postId: number) {
    this.activePosts.add(postId);
    
    // Start polling if this is the first post
    if (this.activePosts.size === 1) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.activePosts.delete(postId);
      if (this.activePosts.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Start real-time polling
  private startPolling() {
    this.pollInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, 1500); // Poll every 1.5 seconds for real-time feel
  }

  // Stop polling
  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Check for updates on active posts
  private async checkForUpdates() {
    if (this.activePosts.size === 0) return;

    try {
      // Check comments for all active posts
      await Promise.all([
        this.updateComments(),
        this.updateReactions(),
      ]);
    } catch (error) {
      console.error('Failed to fetch real-time updates:', error);
    }
  }

  // Update comments for active posts
  private async updateComments() {
    for (const postId of this.activePosts) {
      try {
        const response = await apiRequest('GET', `/api/posts/${postId}/comments`);
        const comments = await response.json();
        
        // Check if comments have changed
        const cacheKey = `/api/posts/${postId}/comments`;
        const currentData = queryClient.getQueryData([cacheKey]);
        
        if (JSON.stringify(currentData) !== JSON.stringify(comments)) {
          // Update the query cache
          queryClient.setQueryData([cacheKey], comments);
          
          // Also invalidate posts query to update comment counts
          queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        }
      } catch (error) {
        console.error(`Failed to update comments for post ${postId}:`, error);
      }
    }
  }

  // Update reactions for active posts
  private async updateReactions() {
    for (const postId of this.activePosts) {
      try {
        const response = await apiRequest('GET', `/api/posts/${postId}/reactions`);
        const reactions = await response.json();
        
        // Check if reactions have changed
        const cacheKey = `/api/posts/${postId}/reactions`;
        const currentData = queryClient.getQueryData([cacheKey]);
        
        if (JSON.stringify(currentData) !== JSON.stringify(reactions)) {
          // Update the query cache
          queryClient.setQueryData([cacheKey], reactions);
        }
      } catch (error) {
        console.error(`Failed to update reactions for post ${postId}:`, error);
      }
    }
  }

  // Optimistically update comment count
  optimisticCommentUpdate(postId: number, newComment: any) {
    const commentsKey = `/api/posts/${postId}/comments`;
    const currentComments = queryClient.getQueryData([commentsKey]) as any[] || [];
    
    // Add the new comment optimistically
    const updatedComments = [...currentComments, newComment];
    queryClient.setQueryData([commentsKey], updatedComments);
    
    // Update posts query to reflect new comment count
    const postsKey = '/api/posts';
    const currentPosts = queryClient.getQueryData([postsKey]) as any[] || [];
    const updatedPosts = currentPosts.map(post => 
      post.id === postId 
        ? { ...post, _commentCount: (post._commentCount || 0) + 1 }
        : post
    );
    queryClient.setQueryData([postsKey], updatedPosts);
  }

  // Optimistically update reaction
  optimisticReactionUpdate(postId: number, reactionType: string, currentUserReaction: string | null) {
    const reactionsKey = `/api/posts/${postId}/reactions`;
    const currentData = queryClient.getQueryData([reactionsKey]) as any;
    
    if (currentData && currentData.reactions) {
      const updatedReactions = { ...currentData.reactions };
      
      // Remove previous reaction if any
      if (currentUserReaction) {
        updatedReactions[currentUserReaction] = Math.max(0, updatedReactions[currentUserReaction] - 1);
      }
      
      // Add new reaction
      updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
      
      queryClient.setQueryData([reactionsKey], {
        ...currentData,
        reactions: updatedReactions
      });
    }
  }

  // Force refresh all active posts
  refreshActivePosts() {
    this.activePosts.forEach(postId => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/reactions`] });
    });
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  }
}

export const realTimeService = new RealTimeService();