
drop policy if exists "auth users can update slips" on public.salary_slips;
drop policy if exists "auth users can delete slips" on public.salary_slips;

create policy "auth users can update slips"
  on public.salary_slips for update to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "auth users can delete slips"
  on public.salary_slips for delete to authenticated
  using (auth.uid() is not null);

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
begin new.updated_at = now(); return new; end $$;
