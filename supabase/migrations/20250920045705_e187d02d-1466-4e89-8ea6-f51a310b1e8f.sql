-- Create settings table for user preferences
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notification_preference TEXT DEFAULT 'email' CHECK (notification_preference IN ('email', 'sms', 'push')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'en',
  privacy_controls JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for generated reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  report_type TEXT NOT NULL CHECK (report_type IN ('attendance', 'grades', 'tasks', 'custom')),
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_url TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS class_id UUID,
ADD COLUMN IF NOT EXISTS check_in_method TEXT CHECK (check_in_method IN ('qr', 'wifi', 'bluetooth', 'face', 'manual'));

ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS exam_type TEXT CHECK (exam_type IN ('midterm', 'final', 'assignment', 'project'));

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'academic' CHECK (category IN ('academic', 'career', 'personal'));

ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'class' CHECK (type IN ('class', 'exam', 'activity', 'meeting')),
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_pic TEXT,
ADD COLUMN IF NOT EXISTS class_id UUID,
ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE;

-- Enable RLS on new tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings table
CREATE POLICY "Users can view their own settings" 
ON public.settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reports table
CREATE POLICY "Users can view their own reports or reports they generated" 
ON public.reports 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR auth.uid() = generated_by 
  OR auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Report creators can update their reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = generated_by);

-- Create triggers for updated_at columns
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX idx_grades_user_subject ON public.grades(student_id, subject);
CREATE INDEX idx_tasks_user_status ON public.tasks(assigned_to, status);
CREATE INDEX idx_schedules_user_day ON public.schedules(user_id, day_of_week);
CREATE INDEX idx_reports_user_type ON public.reports(user_id, report_type);
CREATE INDEX idx_settings_user ON public.settings(user_id);

-- Add sample data for development
INSERT INTO public.profiles (id, email, full_name, role, student_id) 
VALUES 
  (gen_random_uuid(), 'admin@school.edu', 'Admin User', 'admin', NULL),
  (gen_random_uuid(), 'teacher@school.edu', 'John Teacher', 'teacher', NULL),
  (gen_random_uuid(), 'student@school.edu', 'Jane Student', 'student', 'STU001')
ON CONFLICT DO NOTHING;