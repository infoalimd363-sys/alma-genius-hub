import { supabase } from "@/integrations/supabase/client";

export const notificationsService = {
  // Get all notifications for a user
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get unread notifications count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Create notification
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'attendance' | 'grade' | 'task' | 'announcement'
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Send bulk notifications
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: 'attendance' | 'grade' | 'task' | 'announcement'
  ) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data;
  }
};