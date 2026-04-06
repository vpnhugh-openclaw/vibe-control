
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own profiles" ON public.profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ GMAIL ACCOUNTS ============
CREATE TABLE public.gmail_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  email_address TEXT NOT NULL,
  login_method TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  preferred_use_case TEXT,
  last_used_date DATE,
  best_for_platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gmail_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own gmail_accounts" ON public.gmail_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gmail_accounts_updated_at BEFORE UPDATE ON public.gmail_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PLATFORMS ============
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  short_description TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  best_use_cases TEXT[],
  pricing_notes TEXT,
  free_tier_notes TEXT,
  promo_notes TEXT,
  link TEXT,
  i_use_it BOOLEAN DEFAULT false,
  personal_rating SMALLINT,
  recommended_project_types TEXT[],
  is_currently_active BOOLEAN DEFAULT true,
  logo_slug TEXT,
  source_type TEXT DEFAULT 'manual',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own platforms" ON public.platforms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PLATFORM MEMBERSHIPS ============
CREATE TABLE public.platform_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_account_id UUID REFERENCES public.gmail_accounts(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
  is_registered BOOLEAN DEFAULT false,
  daily_reset_time TIME,
  monthly_credits NUMERIC,
  last_known_balance NUMERIC,
  notes TEXT,
  free_tier_usefulness SMALLINT,
  is_worth_keeping BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own platform_memberships" ON public.platform_memberships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_platform_memberships_updated_at BEFORE UPDATE ON public.platform_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_description TEXT,
  long_notes TEXT,
  status TEXT CHECK (status IN ('idea','planning','building','testing','launched','paused','stalled','abandoned')) DEFAULT 'idea',
  project_type TEXT CHECK (project_type IN ('web_app','mobile_app','automation','website_revamp','scraping_tool','api_integration','pharmacy_business','research_workflow','other')),
  gmail_account_id UUID REFERENCES public.gmail_accounts(id),
  project_url TEXT,
  repo_url TEXT,
  deployment_url TEXT,
  category TEXT,
  priority SMALLINT DEFAULT 3,
  last_active_date DATE,
  last_meaningful_progress_date DATE,
  next_action TEXT,
  blocker_summary TEXT,
  effort_score NUMERIC(3,1),
  confidence_score NUMERIC(3,1),
  motivation_score NUMERIC(3,1),
  monetisation_score NUMERIC(3,1),
  platform_fit_score NUMERIC(3,1),
  rescue_score NUMERIC(5,2),
  is_stalled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.compute_rescue_score()
RETURNS TRIGGER AS $$
DECLARE
  recency NUMERIC;
  days_since NUMERIC;
BEGIN
  IF NEW.last_active_date IS NOT NULL THEN
    NEW.is_stalled := NEW.last_active_date < (CURRENT_DATE - interval '7 days');
    days_since := EXTRACT(DAY FROM (now() - NEW.last_active_date::timestamp));
    recency := GREATEST(0, 10 - (days_since / 3.0));
  ELSE
    NEW.is_stalled := true;
    recency := 0;
  END IF;
  NEW.rescue_score := ROUND((
    recency * 0.25 +
    COALESCE(NEW.confidence_score, 0) * 0.20 +
    COALESCE(NEW.motivation_score, 0) * 0.15 +
    COALESCE(NEW.monetisation_score, 0) * 0.15 +
    (10 - COALESCE(NEW.effort_score, 5)) * 0.15 +
    COALESCE(NEW.platform_fit_score, 0) * 0.10
  ) * 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER compute_projects_rescue_score
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.compute_rescue_score();

-- ============ PROJECT PLATFORMS ============
CREATE TABLE public.project_platforms (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, platform_id)
);
ALTER TABLE public.project_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own project_platforms" ON public.project_platforms FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_platforms.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_platforms.project_id AND projects.user_id = auth.uid()));

-- ============ PROJECT UPDATES ============
CREATE TABLE public.project_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('note','status_change','assessment','prompt_used','manual')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own project_updates" ON public.project_updates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project_updates" ON public.project_updates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ STALL ASSESSMENTS ============
CREATE TABLE public.stall_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope_clarity SMALLINT, technical_blockers SMALLINT, prompt_quality SMALLINT,
  motivation_energy SMALLINT, monetisation_clarity SMALLINT, credits_limitation SMALLINT,
  platform_fit SMALLINT, last_progress TEXT, current_blocker TEXT, already_tried TEXT,
  feels_unclear TEXT, credits_issue TEXT, needs_narrowing BOOLEAN DEFAULT false,
  ai_output JSONB, rescue_score_output NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stall_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own stall_assessments" ON public.stall_assessments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PROMPTS ============
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, prompt_text TEXT,
  category TEXT CHECK (category IN ('build','rescue','migration','ui_cleanup','debug','reboot','research','other')),
  effectiveness_rating SMALLINT, notes TEXT,
  date_added DATE DEFAULT CURRENT_DATE, last_used_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own prompts" ON public.prompts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON public.prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.prompt_platforms (
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, platform_id)
);
ALTER TABLE public.prompt_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own prompt_platforms" ON public.prompt_platforms FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_platforms.prompt_id AND prompts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_platforms.prompt_id AND prompts.user_id = auth.uid()));

CREATE TABLE public.prompt_projects (
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, project_id)
);
ALTER TABLE public.prompt_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own prompt_projects" ON public.prompt_projects FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_projects.prompt_id AND prompts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_projects.prompt_id AND prompts.user_id = auth.uid()));

-- ============ TAGS ============
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, colour TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own tags" ON public.tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.project_tags (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own project_tags" ON public.project_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_tags.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_tags.project_id AND projects.user_id = auth.uid()));

CREATE TABLE public.prompt_tags (
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own prompt_tags" ON public.prompt_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_tags.prompt_id AND prompts.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prompts WHERE prompts.id = prompt_tags.prompt_id AND prompts.user_id = auth.uid()));

-- ============ PROMOTIONS ============
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT, credit_type TEXT CHECK (credit_type IN ('daily','monthly','promo','one_time')),
  amount NUMERIC, unit TEXT, expiry_date DATE,
  freshness TEXT CHECK (freshness IN ('confirmed','unconfirmed','expired')),
  source_url TEXT, notes TEXT, tags TEXT[],
  source_type TEXT DEFAULT 'manual', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MODELS ============
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT, model_name TEXT, model_id TEXT,
  best_for TEXT[], is_free_tier BOOLEAN DEFAULT false, cost_per_unit NUMERIC,
  quality_notes TEXT, date_verified DATE, expiry_date DATE,
  source_type TEXT DEFAULT 'manual', last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own models" ON public.models FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON public.models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DISCOVERY ITEMS ============
CREATE TABLE public.discovery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, summary TEXT,
  category TEXT CHECK (category IN ('new_tool','promo','model_release','platform_change','tip')),
  source_url TEXT, date_seen DATE DEFAULT CURRENT_DATE,
  relevance_score SMALLINT, tags TEXT[],
  is_bookmarked BOOLEAN DEFAULT false, is_dismissed BOOLEAN DEFAULT false,
  source_type TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.discovery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own discovery_items" ON public.discovery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_discovery_items_updated_at BEFORE UPDATE ON public.discovery_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COST ENTRIES ============
CREATE TABLE public.cost_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  platform_id UUID REFERENCES public.platforms(id),
  gmail_account_id UUID REFERENCES public.gmail_accounts(id),
  project_id UUID REFERENCES public.projects(id),
  amount NUMERIC, currency TEXT DEFAULT 'AUD',
  entry_type TEXT CHECK (entry_type IN ('free_credit_used','subscription','one_off','promo_credit')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own cost_entries" ON public.cost_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cost_entries_updated_at BEFORE UPDATE ON public.cost_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ATTACHMENTS ============
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL, storage_path TEXT NOT NULL,
  file_type TEXT, file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own attachments" ON public.attachments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);
CREATE POLICY "Users upload own attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own attachments" ON storage.objects FOR DELETE USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
