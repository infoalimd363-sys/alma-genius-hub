import { supabase } from "@/integrations/supabase/client";

export const reportsService = {
  // Generate attendance report
  async generateAttendanceReport(userId?: string, startDate?: string, endDate?: string) {
    // Fetch attendance data
    let query = supabase
      .from('attendance')
      .select(`
        *,
        profiles!inner(full_name, email, student_id)
      `)
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: attendanceData, error: attendanceError } = await query;
    if (attendanceError) throw attendanceError;

    // Save report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        report_type: 'attendance',
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        data: { attendanceData, startDate, endDate }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Generate grades report
  async generateGradesReport(studentId?: string, subject?: string, semester?: string) {
    // Fetch grades data
    let query = supabase
      .from('grades')
      .select(`
        *,
        profiles!inner(full_name, email, student_id)
      `)
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (subject) {
      query = query.eq('subject', subject);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }

    const { data: gradesData, error: gradesError } = await query;
    if (gradesError) throw gradesError;

    // Calculate statistics
    const stats = {
      totalGrades: gradesData?.length || 0,
      averagePercentage: 0,
      subjectWiseStats: {} as any
    };

    if (gradesData && gradesData.length > 0) {
      const totalPercentage = gradesData.reduce((sum, grade) => {
        const percentage = (grade.obtained_marks / grade.max_marks) * 100;
        return sum + percentage;
      }, 0);
      
      stats.averagePercentage = totalPercentage / gradesData.length;

      // Subject-wise statistics
      const subjectGroups = gradesData.reduce((acc, grade) => {
        if (!acc[grade.subject]) {
          acc[grade.subject] = [];
        }
        acc[grade.subject].push(grade);
        return acc;
      }, {} as any);

      for (const [subject, grades] of Object.entries(subjectGroups)) {
        const subjectGrades = grades as any[];
        const avgPercentage = subjectGrades.reduce((sum, g) => 
          sum + (g.obtained_marks / g.max_marks) * 100, 0) / subjectGrades.length;
        
        stats.subjectWiseStats[subject] = {
          totalGrades: subjectGrades.length,
          averagePercentage: avgPercentage.toFixed(2)
        };
      }
    }

    // Save report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: studentId,
        report_type: 'grades',
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        data: { gradesData, stats, filters: { subject, semester } }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Generate tasks report
  async generateTasksReport(userId?: string, status?: 'pending' | 'in_progress' | 'completed', category?: 'academic' | 'career' | 'personal') {
    // Fetch tasks data
    let query = supabase
      .from('tasks')
      .select(`
        *,
        profiles!inner(full_name, email)
      `)
      .order('due_date', { ascending: true });

    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: tasksData, error: tasksError } = await query;
    if (tasksError) throw tasksError;

    // Calculate task statistics
    const stats = {
      total: tasksData?.length || 0,
      completed: tasksData?.filter(t => t.status === 'completed').length || 0,
      pending: tasksData?.filter(t => t.status === 'pending').length || 0,
      inProgress: tasksData?.filter(t => t.status === 'in_progress').length || 0,
      overdue: tasksData?.filter(t => 
        t.status !== 'completed' && 
        t.due_date && 
        new Date(t.due_date) < new Date()
      ).length || 0
    };

    // Save report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        report_type: 'tasks',
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        data: { tasksData, stats, filters: { status, category } }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all reports
  async getReports(userId?: string, reportType?: string) {
    let query = supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (reportType) {
      query = query.eq('report_type', reportType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get report by ID
  async getReportById(reportId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete report
  async deleteReport(reportId: string) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
  },

  // Export report as CSV
  exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};