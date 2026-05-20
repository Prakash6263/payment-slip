
CREATE TABLE public.offer_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL DEFAULT '',
  designation TEXT NOT NULL DEFAULT '',
  letter_date TEXT NOT NULL DEFAULT '',
  joining_date TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read offers" ON public.offer_letters FOR SELECT USING (true);
CREATE POLICY "public can insert offers" ON public.offer_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update offers" ON public.offer_letters FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete offers" ON public.offer_letters FOR DELETE USING (true);

CREATE TRIGGER offer_letters_set_updated_at
BEFORE UPDATE ON public.offer_letters
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
