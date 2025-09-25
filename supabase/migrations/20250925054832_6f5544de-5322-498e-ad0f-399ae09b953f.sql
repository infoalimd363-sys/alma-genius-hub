-- First, create the new enum type
CREATE TYPE attendance_status_new AS ENUM ('present', 'absent', 'late', 'excused', 'half_day');

-- Remove the default constraint first
ALTER TABLE public.attendance ALTER COLUMN status DROP DEFAULT;

-- Update the column to use the new enum
ALTER TABLE public.attendance 
ALTER COLUMN status TYPE attendance_status_new 
USING status::text::attendance_status_new;

-- Add the default back
ALTER TABLE public.attendance ALTER COLUMN status SET DEFAULT 'absent'::attendance_status_new;

-- Drop the old enum type and rename the new one
DROP TYPE attendance_status;
ALTER TYPE attendance_status_new RENAME TO attendance_status;

-- Add Aadhaar number to profiles
ALTER TABLE public.profiles 
ADD COLUMN aadhaar_number text UNIQUE;

-- Add index for Aadhaar lookup
CREATE INDEX idx_profiles_aadhaar ON public.profiles(aadhaar_number);

-- Add attendance logs table for audit trail
CREATE TABLE public.attendance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_status attendance_status,
  new_status attendance_status,
  change_reason text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN notification_preferences jsonb DEFAULT '{"attendance": true, "grades": true, "tasks": true}'::jsonb;

-- Add daily routines table
CREATE TABLE public.daily_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title text NOT NULL,
  description text,
  time_slot text NOT NULL,
  day_of_week integer NOT NULL,
  type text NOT NULL DEFAULT 'class',
  is_active boolean DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add gamification table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points integer DEFAULT 0
);

-- Add notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for attendance_logs
CREATE POLICY "Admins and teachers can view attendance logs"
ON public.attendance_logs
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Admins and teachers can insert attendance logs"
ON public.attendance_logs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('teacher', 'admin')
  )
);

-- RLS policies for daily_routines
CREATE POLICY "Users can view their own routines"
ON public.daily_routines
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
));

CREATE POLICY "Users can manage their own routines"
ON public.daily_routines
FOR ALL
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'));

-- RLS policies for achievements
CREATE POLICY "Users can view their own achievements"
ON public.achievements
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
));

CREATE POLICY "System can insert achievements"
ON public.achievements
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'admin'
));

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
));

-- Add trigger for attendance logs
CREATE OR REPLACE FUNCTION public.log_attendance_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.attendance_logs (
      attendance_id, 
      changed_by, 
      old_status, 
      new_status
    ) VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER attendance_change_trigger
AFTER UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.log_attendance_change();

-- Update existing trigger for updated_at columns
CREATE TRIGGER update_daily_routines_updated_at
BEFORE UPDATE ON public.daily_routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();