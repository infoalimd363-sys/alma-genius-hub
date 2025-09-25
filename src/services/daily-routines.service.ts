import { supabase } from "@/integrations/supabase/client";

export const dailyRoutinesService = {
  async getUserRoutines(userId: string) {
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week')
      .order('time_slot');

    if (error) throw error;
    return data;
  },

  async getTodayRoutines(userId: string) {
    const dayOfWeek = new Date().getDay();
    const { data, error } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('time_slot');

    if (error) throw error;
    return data;
  },

  async createRoutine(routine: any) {
    const { data, error } = await supabase
      .from('daily_routines')
      .insert(routine)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRoutine(id: string, updates: any) {
    const { data, error } = await supabase
      .from('daily_routines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRoutine(id: string) {
    const { error } = await supabase
      .from('daily_routines')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }
};