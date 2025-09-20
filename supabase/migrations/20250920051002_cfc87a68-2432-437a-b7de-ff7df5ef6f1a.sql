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

-- Add missing columns to existing tables (only if they don't exist)
DO $$ 
BEGIN
  -- Add columns to attendance table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='class_id') THEN
    ALTER TABLE public.attendance ADD COLUMN class_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='check_in_method') THEN
    ALTER TABLE public.attendance ADD COLUMN check_in_method TEXT;
  END IF;

  -- Add columns to grades table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='grades' AND column_name='exam_type') THEN
    ALTER TABLE public.grades ADD COLUMN exam_type TEXT;
  END IF;

  -- Add columns to tasks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='category') THEN
    ALTER TABLE public.tasks ADD COLUMN category TEXT DEFAULT 'academic';
  END IF;

  -- Add columns to schedules table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='type') THEN
    ALTER TABLE public.schedules ADD COLUMN type TEXT DEFAULT 'class';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='location') THEN
    ALTER TABLE public.schedules ADD COLUMN location TEXT;
  END IF;

  -- Add columns to profiles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_pic') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_pic TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='class_id') THEN
    ALTER TABLE public.profiles ADD COLUMN class_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='student_id') THEN
    ALTER TABLE public.profiles ADD COLUMN student_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='enrollment_date') THEN
    ALTER TABLE public.profiles ADD COLUMN enrollment_date DATE DEFAULT CURRENT_DATE;
  END IF;
END$$;

-- Enable RLS on new tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.settings;

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

-- Drop existing policies if they exist and recreate them for reports
DROP POLICY IF EXISTS "Users can view their own reports or reports they generated" ON public.reports;
DROP POLICY IF EXISTS "Teachers and admins can create reports" ON public.reports;
DROP POLICY IF EXISTS "Report creators can update their reports" ON public.reports;

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
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_type ON public.reports(user_id, report_type);
CREATE INDEX IF NOT EXISTS idx_settings_user ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_method ON public.attendance(check_in_method);