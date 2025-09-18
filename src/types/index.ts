export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkInMethod?: 'qr' | 'manual' | 'proximity' | 'facial';
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  maxScore: number;
  type: 'quiz' | 'exam' | 'assignment' | 'project';
  date: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'career' | 'personal' | 'extracurricular';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  completed: boolean;
  assignedTo: string[];
}

export interface Schedule {
  id: string;
  userId: string;
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  subject?: string;
  room?: string;
  type: 'class' | 'break' | 'free' | 'task';
  taskId?: string;
}