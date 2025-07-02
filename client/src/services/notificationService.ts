import { apiRequest } from "@/lib/queryClient";

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'reaction';
  postId: number;
  commentId?: number;
  fromUserId: string;
  fromUsername: string;
  content: string;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Notification[] = [];
  private pollInterval: NodeJS.Timeout | null = null;

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    callback(this.notifications); // Send current notifications immediately
    
    // Start polling if this is the first listener
    if (this.listeners.size === 1) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Start polling for notifications
  private startPolling() {
    this.pollInterval = setInterval(async () => {
      try {
        const response = await apiRequest('GET', '/api/notifications');
        const newNotifications = await response.json();
        
        if (JSON.stringify(newNotifications) !== JSON.stringify(this.notifications)) {
          this.notifications = newNotifications;
          this.notifyListeners();
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    }, 2000); // Poll every 2 seconds
  }

  // Stop polling
  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      this.notifications = this.notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await apiRequest('PATCH', '/api/notifications/mark-all-read');
      this.notifications = this.notifications.map(notif => ({ ...notif, read: true }));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Create a new notification (for real-time updates)
  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifyListeners();
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

export const notificationService = new NotificationService();