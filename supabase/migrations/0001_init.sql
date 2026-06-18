-- Katha Cards — accounts, entitlement, content protection & progress sync.
-- Run once: supabase db push   (or paste into the SQL editor).
-- Identity is Supabase Auth (magic-link). Everything is row-level-secured so a
-- user can only ever touch their own rows, and premium questions are readable
-- only by an account with an active subscription.

-- ---------------------------------------------------------------------------
-- entitlement: written ONLY by the Stripe webhook (service role). Users read
-- their own row to learn if they're premium.
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  is_premium             boolean not null default false,
  status                 text,                         -- active | trialing | past_due | canceled | unpaid
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  updated_at             timestamptz not null default now()
);
alter table public.entitlements enable row level security;

drop policy if exists "read own entitlement" on public.entitlements;
create policy "read own entitlement"
  on public.entitlements for select
  using (auth.uid() = user_id);
-- No insert/update/delete policy => only the service-role webhook can write.

-- True iff this user currently has premium. Used by RLS + the app.
create or replace function public.is_premium(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = uid
      and e.is_premium = true
      and (e.current_period_end is null or e.current_period_end > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- progress: per-card best score / plays / seen ids — synced across devices.
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  user_id    uuid not null references auth.users (id) on delete cascade,
  deck       text not null,
  card_id    text not null,
  best       int  not null default 0,
  plays      int  not null default 0,
  seen       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, deck, card_id)
);
alter table public.progress enable row level security;

drop policy if exists "own progress" on public.progress;
create policy "own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- premium_questions: the medium/hard bank. RLS makes rows VISIBLE ONLY to a
-- premium account, so the protected content never ships to free browsers.
-- (Easy questions stay as public static JSON — they're the free tier.)
-- Load with: node scripts/seed-premium-questions.mjs   (see supabase/README).
-- ---------------------------------------------------------------------------
create table if not exists public.premium_questions (
  deck       text not null,
  card_id    text not null,
  idx        int  not null,
  difficulty text not null check (difficulty in ('medium', 'hard', 'easy')),
  q          jsonb not null,
  primary key (deck, card_id, idx)
);
alter table public.premium_questions enable row level security;

drop policy if exists "premium reads questions" on public.premium_questions;
create policy "premium reads questions"
  on public.premium_questions for select
  using (public.is_premium(auth.uid()));

create index if not exists premium_questions_card_idx
  on public.premium_questions (deck, card_id);

-- ---------------------------------------------------------------------------
-- webhook_events: dedupe Stripe deliveries so a replayed/retried event can't
-- re-apply (e.g. resurrect a canceled subscription). Service-role only.
-- ---------------------------------------------------------------------------
create table if not exists public.webhook_events (
  event_id    text primary key,
  received_at timestamptz not null default now()
);
alter table public.webhook_events enable row level security;
-- no policies => only the service-role webhook can read/write.
