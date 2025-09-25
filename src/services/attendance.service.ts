import { supabase } from "@/integrations/supabase/client";

export const attendanceService = {
  // Mark attendance for a user
  async markAttendance(
    userId: string,
    status: 'present' | 'absent' | 'late' | 'excused' | 'half_day',
    checkInMethod?: 'qr' | 'manual' | 'proximity' | 'facial',
    classId?: string
  ) {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        status,
        check_in_time: status === 'present' || status === 'late' ? new Date().toISOString() : null,
        check_in_method: checkInMethod,
        class_id: classId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get attendance history for a user
  async getAttendanceHistory(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get today's attendance for a user
  async getTodayAttendance(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    if (error) throw error;
    return data;
  },

  // Get attendance statistics for a user
  async getAttendanceStats(userId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      present: data.filter(a => a.status === 'present').length,
      absent: data.filter(a => a.status === 'absent').length,
      late: data.filter(a => a.status === 'late').length,
      excused: data.filter(a => a.status === 'excused').length,
      halfDay: data.filter(a => a.status === 'half_day').length,
      percentage: 0,
      effectiveDays: 0
    };

    // Calculate effective days (half-day = 0.5)
    stats.effectiveDays = stats.present + stats.late + (stats.halfDay * 0.5);
    
    if (stats.total > 0) {
      stats.percentage = Math.round((stats.effectiveDays / stats.total) * 100);
    }

    return stats;
  },

  // Update attendance record
  async updateAttendance(attendanceId: string, updates: any) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk mark attendance (for teachers)
  async bulkMarkAttendance(attendanceRecords: any[]) {
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceRecords)
      .select();

    if (error) throw error;
    return data;
  }
};