import { supabase } from "@/integrations/supabase/client";

export const gradesService = {
  // Get grades for a student
  async getStudentGrades(studentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add a new grade (for teachers)
  async addGrade(grade: {
    student_id: string;
    subject: string;
    obtained_marks: number;
    max_marks: number;
    grade: string;
    teacher_id?: string;
    semester?: string;
    academic_year?: string;
  }) {
    const { data, error } = await supabase
      .from('grades')
      .insert(grade)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a grade (for teachers)
  async updateGrade(gradeId: string, updates: any) {
    const { data, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', gradeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a grade (for teachers)
  async deleteGrade(gradeId: string) {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);

    if (error) throw error;
  },

  // Get grades by subject
  async getGradesBySubject(studentId: string, subject: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get grade statistics for a student
  async getGradeStats(studentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('obtained_marks, max_marks, subject, grade')
      .eq('student_id', studentId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        averagePercentage: 0,
        totalMarks: 0,
        maxPossibleMarks: 0,
        subjects: {},
        totalGrades: 0
      };
    }

    const totalScore = data.reduce((sum, grade) => sum + (grade.obtained_marks || 0), 0);
    const totalMaxScore = data.reduce((sum, grade) => sum + (grade.max_marks || 0), 0);
    const average = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

    // Calculate subject-wise averages
    const subjects: any = {};
    data.forEach(grade => {
      if (!subjects[grade.subject]) {
        subjects[grade.subject] = { obtained: 0, total: 0, count: 0 };
      }
      subjects[grade.subject].obtained += grade.obtained_marks || 0;
      subjects[grade.subject].total += grade.max_marks || 0;
      subjects[grade.subject].count++;
    });

    return {
      averagePercentage: average,
      totalMarks: totalScore,
      maxPossibleMarks: totalMaxScore,
      subjects,
      totalGrades: data.length
    };
  },

  // Get class grades (for teachers)
  async getClassGrades(subject: string, teacherId?: string) {
    let query = supabase
      .from('grades')
      .select('*')
      .eq('subject', subject);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Calculate letter grade from percentage
  calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }
};