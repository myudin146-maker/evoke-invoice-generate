-- =============================================
-- Evoke Invoice Generator - Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Table: user_profiles
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text,
  company_logo_url text,
  default_currency text default 'IDR',
  created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);


-- Table: invoices
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  invoice_number text not null,
  issue_date date,
  due_date date,
  client_name text,
  subtotal numeric(15,2) default 0,
  tax_rate numeric(10,4) default 0,
  discount numeric(15,2) default 0,
  total_amount numeric(15,2) default 0,
  notes text,
  data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.handle_updated_at();


-- Table: invoice_items (optional relational table)
create table if not exists public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices on delete cascade not null,
  item_name text,
  description text,
  quantity numeric(10,4) default 1,
  unit_price numeric(15,2) default 0,
  total_price numeric(15,2) default 0,
  created_at timestamptz default now()
);

alter table public.invoice_items enable row level security;

create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert own invoice items"
  on public.invoice_items for insert
  with check (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.user_id = auth.uid()
    )
  );


-- Storage: logos bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Public can read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Users can delete own logos"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
