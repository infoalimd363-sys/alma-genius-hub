import { supabase } from "@/integrations/supabase/client";

export const schedulesService = {
  // Get user's schedule
  async getUserSchedule(userId: string) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get schedule for a specific day
  async getDaySchedule(userId: string, dayOfWeek: number) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Add schedule entry
  async addScheduleEntry(schedule: {
    user_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    subject?: string;
    room?: string;
    type?: 'class' | 'exam' | 'activity' | 'meeting';
    location?: string;
  }) {
    const { data, error } = await supabase
      .from('schedules')
      .insert({
        ...schedule,
        type: schedule.type || 'class',
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update schedule entry
  async updateScheduleEntry(scheduleId: string, updates: any) {
    const { data, error } = await supabase
      .from('schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete schedule entry
  async deleteScheduleEntry(scheduleId: string) {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) throw error;
  },

  // Deactivate schedule entry
  async deactivateScheduleEntry(scheduleId: string) {
    const { data, error } = await supabase
      .from('schedules')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get class-wide schedule (for all students)
  async getClassSchedule() {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .is('user_id', null)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Bulk create schedule entries
  async bulkCreateSchedule(schedules: any[]) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedules.map(s => ({
        ...s,
        is_active: true
      })))
      .select();

    if (error) throw error;
    return data;
  },

  // Get today's schedule
  async getTodaySchedule(userId: string) {
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return this.getDaySchedule(userId, today);
  },

  // Check for schedule conflicts
  async checkConflicts(userId: string, dayOfWeek: number, startTime: string, endTime: string) {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (error) throw error;

    // Check for time overlaps
    const conflicts = data?.filter(schedule => {
      const scheduleStart = new Date(`2000-01-01T${schedule.start_time}`);
      const scheduleEnd = new Date(`2000-01-01T${schedule.end_time}`);
      const newStart = new Date(`2000-01-01T${startTime}`);
      const newEnd = new Date(`2000-01-01T${endTime}`);

      return (
        (newStart >= scheduleStart && newStart < scheduleEnd) ||
        (newEnd > scheduleStart && newEnd <= scheduleEnd) ||
        (newStart <= scheduleStart && newEnd >= scheduleEnd)
      );
    });

    return conflicts || [];
  },

  // Get free slots in schedule
  async getFreeSlots(userId: string, dayOfWeek: number) {
    const schedules = await this.getDaySchedule(userId, dayOfWeek);
    const freeSlots = [];
    
    // Define working hours (8 AM to 6 PM)
    const workStart = new Date(`2000-01-01T08:00:00`);
    const workEnd = new Date(`2000-01-01T18:00:00`);
    
    if (!schedules || schedules.length === 0) {
      freeSlots.push({
        start_time: '08:00:00',
        end_time: '18:00:00',
        duration: 600 // minutes
      });
      return freeSlots;
    }

    // Sort schedules by start time
    const sorted = [...schedules].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );

    // Check for free slot before first class
    const firstStart = new Date(`2000-01-01T${sorted[0].start_time}`);
    if (firstStart > workStart) {
      freeSlots.push({
        start_time: '08:00:00',
        end_time: sorted[0].start_time,
        duration: (firstStart.getTime() - workStart.getTime()) / 60000
      });
    }

    // Check for free slots between classes
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = new Date(`2000-01-01T${sorted[i].end_time}`);
      const nextStart = new Date(`2000-01-01T${sorted[i + 1].start_time}`);
      
      if (nextStart > currentEnd) {
        freeSlots.push({
          start_time: sorted[i].end_time,
          end_time: sorted[i + 1].start_time,
          duration: (nextStart.getTime() - currentEnd.getTime()) / 60000
        });
      }
    }

    // Check for free slot after last class
    const lastEnd = new Date(`2000-01-01T${sorted[sorted.length - 1].end_time}`);
    if (lastEnd < workEnd) {
      freeSlots.push({
        start_time: sorted[sorted.length - 1].end_time,
        end_time: '18:00:00',
        duration: (workEnd.getTime() - lastEnd.getTime()) / 60000
      });
    }

    return freeSlots;
  }
};