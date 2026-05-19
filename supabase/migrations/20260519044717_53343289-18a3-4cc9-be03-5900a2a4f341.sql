
DROP POLICY IF EXISTS "auth users can delete slips" ON public.salary_slips;
DROP POLICY IF EXISTS "auth users can update slips" ON public.salary_slips;
DROP POLICY IF EXISTS "auth users can insert slips" ON public.salary_slips;
DROP POLICY IF EXISTS "auth users can read all slips" ON public.salary_slips;

CREATE POLICY "public can read slips" ON public.salary_slips FOR SELECT USING (true);
CREATE POLICY "public can insert slips" ON public.salary_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update slips" ON public.salary_slips FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public can delete slips" ON public.salary_slips FOR DELETE USING (true);
