import { supabase } from "@/integrations/supabase/client";

export const tasksService = {
  // Get tasks for a user
  async getUserTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  // Create a new task
  async createTask(task: {
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    assigned_to: string;
    assigned_by?: string;
  }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        status: 'pending'
      })
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
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('assigned_to', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark task as in progress
  async startTask(taskId: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'in_progress'
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
      .select('status')
      .eq('assigned_to', userId);

    if (error) throw error;

    return {
      total: data.length,
      completed: data.filter(t => t.status === 'completed').length,
      pending: data.filter(t => t.status === 'pending').length,
      inProgress: data.filter(t => t.status === 'in_progress').length
    };
  }
};