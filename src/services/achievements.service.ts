import { supabase } from "@/integrations/supabase/client";

export const achievementsService = {
  // Get all achievements for a user
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get total points for a user
  async getTotalPoints(userId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('points')
      .eq('user_id', userId);

    if (error) throw error;
    
    const totalPoints = data?.reduce((sum, achievement) => sum + (achievement.points || 0), 0) || 0;
    return totalPoints;
  },

  // Award achievement to user
  async awardAchievement(
    userId: string,
    badgeType: 'attendance' | 'academic' | 'task' | 'participation',
    badgeName: string,
    description: string,
    points: number = 10
  ) {
    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_name', badgeName)
      .single();

    if (existing) {
      return null; // Achievement already awarded
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        badge_type: badgeType,
        badge_name: badgeName,
        description,
        points
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check attendance streaks
  async checkAttendanceStreak(userId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    let currentStreak = 0;
    let maxStreak = 0;
    
    data?.forEach(record => {
      if (record.status === 'present' || record.status === 'late') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (record.status === 'absent') {
        currentStreak = 0;
      }
    });

    // Award badges based on streak
    if (currentStreak >= 7) {
      await this.awardAchievement(
        userId,
        'attendance',
        'Week Warrior',
        'Attended 7 consecutive days',
        50
      );
    }

    if (currentStreak >= 30) {
      await this.awardAchievement(
        userId,
        'attendance',
        'Perfect Month',
        'Attended 30 consecutive days',
        200
      );
    }

    return { currentStreak, maxStreak };
  },

  // Check academic achievements
  async checkAcademicAchievements(userId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('grade, obtained_marks, max_marks')
      .eq('student_id', userId);

    if (error) throw error;

    const averagePercentage = data?.reduce((sum, grade) => {
      if (grade.obtained_marks && grade.max_marks) {
        return sum + (grade.obtained_marks / grade.max_marks) * 100;
      }
      return sum;
    }, 0) / (data?.length || 1);

    // Award badges based on academic performance
    if (averagePercentage >= 90) {
      await this.awardAchievement(
        userId,
        'academic',
        'Academic Excellence',
        'Achieved 90%+ average grade',
        100
      );
    }

    if (averagePercentage >= 95) {
      await this.awardAchievement(
        userId,
        'academic',
        'Scholar',
        'Achieved 95%+ average grade',
        150
      );
    }

    return averagePercentage;
  }
};