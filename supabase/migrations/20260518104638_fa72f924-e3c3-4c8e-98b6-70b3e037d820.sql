
create table public.salary_slips (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  employee_name text not null default '',
  employee_id text not null default '',
  emp jsonb not null default '{}'::jsonb,
  earnings jsonb not null default '{}'::jsonb,
  deductions jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.salary_slips enable row level security;

create policy "auth users can read all slips"
  on public.salary_slips for select to authenticated using (true);

create policy "auth users can insert slips"
  on public.salary_slips for insert to authenticated with check (auth.uid() is not null);

create policy "auth users can update slips"
  on public.salary_slips for update to authenticated using (true) with check (true);

create policy "auth users can delete slips"
  on public.salary_slips for delete to authenticated using (true);

create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger salary_slips_updated_at before update on public.salary_slips
  for each row execute function public.tg_set_updated_at();

create index salary_slips_created_at_idx on public.salary_slips (created_at desc);
