import { supabase } from "@/integrations/supabase/client";

export const tasksService = {
  // Get tasks for a user
  async getUserTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create a new task
  async createTask(task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    assigned_to: string;
    assigned_by?: string;
  }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update task
  async updateTask(taskId: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark task as completed
  async completeTask(taskId: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('assigned_to', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete task
  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Get task statistics
  async getTaskStats(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed')
      .eq('assigned_to', userId);

    if (error) throw error;

    return {
      total: data.length,
      completed: data.filter(t => t.completed === true).length,
      pending: data.filter(t => t.completed === false).length
    };
  }
};