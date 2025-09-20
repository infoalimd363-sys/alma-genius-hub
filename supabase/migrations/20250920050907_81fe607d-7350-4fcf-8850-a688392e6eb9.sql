-- Create settings table for user preferences
CREATE TABLE IF NOT EXISTS public.settings (
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
CREATE TABLE IF NOT EXISTS public.reports (
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
ADD COLUMN IF NOT EXISTS check_in_method TEXT;

ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS exam_type TEXT;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'academic';

ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'class',
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_pic TEXT,
ADD COLUMN IF NOT EXISTS class_id UUID,
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE;

-- Enable RLS on new tables (if not already enabled)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings table
CREATE POLICY IF NOT EXISTS "Users can view their own settings" 
ON public.settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own settings" 
ON public.settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reports table
CREATE POLICY IF NOT EXISTS "Users can view their own reports or reports they generated" 
ON public.reports 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR auth.uid() = generated_by 
  OR auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
  )
);

CREATE POLICY IF NOT EXISTS "Teachers and admins can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
  )
);

CREATE POLICY IF NOT EXISTS "Report creators can update their reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = generated_by);

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance (if not already exist)
CREATE INDEX IF NOT EXISTS idx_reports_user_type ON public.reports(user_id, report_type);
CREATE INDEX IF NOT EXISTS idx_settings_user ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_method ON public.attendance(check_in_method);