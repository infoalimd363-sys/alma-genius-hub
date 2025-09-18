-- Create custom types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'absent',
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  semester TEXT,
  academic_year TEXT,
  max_marks INTEGER,
  obtained_marks INTEGER,
  teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT,
  room TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for creating profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
  ON public.profiles FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admin can insert profiles" 
  ON public.profiles FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
    OR auth.uid() = id
  );

-- RLS Policies for attendance
CREATE POLICY "Students can view their own attendance" 
  ON public.attendance FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can insert attendance" 
  ON public.attendance FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update attendance" 
  ON public.attendance FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for grades
CREATE POLICY "Students can view their own grades" 
  ON public.grades FOR SELECT 
  USING (
    auth.uid() = student_id 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can manage grades" 
  ON public.grades FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view their assigned tasks" 
  ON public.tasks FOR SELECT 
  USING (
    auth.uid() = assigned_to 
    OR auth.uid() = assigned_by
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Teachers and admins can create tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Task creators can update their tasks" 
  ON public.tasks FOR UPDATE 
  USING (
    auth.uid() = assigned_by 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Students can update their task status" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

-- RLS Policies for schedules
CREATE POLICY "Users can view their own schedules" 
  ON public.schedules FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Users can manage their own schedules" 
  ON public.schedules FOR ALL 
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_schedules_user ON public.schedules(user_id);