
-- Confirmation letters
CREATE TABLE public.confirmation_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  letter_date text NOT NULL DEFAULT '',
  joining_date text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.confirmation_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read confirmations" ON public.confirmation_letters FOR SELECT USING (true);
CREATE POLICY "public can insert confirmations" ON public.confirmation_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update confirmations" ON public.confirmation_letters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete confirmations" ON public.confirmation_letters FOR DELETE USING (true);
CREATE TRIGGER confirmation_letters_updated_at BEFORE UPDATE ON public.confirmation_letters FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Relieving letters
CREATE TABLE public.relieving_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  relieving_date text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.relieving_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read relieving" ON public.relieving_letters FOR SELECT USING (true);
CREATE POLICY "public can insert relieving" ON public.relieving_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update relieving" ON public.relieving_letters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete relieving" ON public.relieving_letters FOR DELETE USING (true);
CREATE TRIGGER relieving_letters_updated_at BEFORE UPDATE ON public.relieving_letters FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Experience certificates
CREATE TABLE public.experience_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  joining_date text NOT NULL DEFAULT '',
  last_working_date text NOT NULL DEFAULT '',
  tenure text NOT NULL DEFAULT '',
  certificate_date text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experience_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read experience" ON public.experience_certificates FOR SELECT USING (true);
CREATE POLICY "public can insert experience" ON public.experience_certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update experience" ON public.experience_certificates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete experience" ON public.experience_certificates FOR DELETE USING (true);
CREATE TRIGGER experience_certificates_updated_at BEFORE UPDATE ON public.experience_certificates FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
