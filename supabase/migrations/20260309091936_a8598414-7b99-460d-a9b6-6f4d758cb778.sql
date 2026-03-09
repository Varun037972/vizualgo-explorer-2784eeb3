
-- Placement aptitude test results
CREATE TABLE public.placement_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_taken INTEGER,
  used_ai BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saved resume data
CREATE TABLE public.saved_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.placement_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own placement results" ON public.placement_test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own placement results" ON public.placement_test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own resume" ON public.saved_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resume" ON public.saved_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resume" ON public.saved_resumes FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_resumes_updated_at
  BEFORE UPDATE ON public.saved_resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
