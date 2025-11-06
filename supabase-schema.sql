-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Create game_state table
create table if not exists public.game_state (
  user_id uuid references auth.users(id) primary key,
  cookies numeric default 0,
  total_cookies numeric default 0,
  cps numeric default 0,
  click_power numeric default 1,
  buildings jsonb default '[]'::jsonb,
  upgrades jsonb default '[]'::jsonb,
  achievements jsonb default '[]'::jsonb,
  prestige_level integer default 0,
  multiplier numeric default 1,
  last_active timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create leaderboard table
create table if not exists public.leaderboard (
  user_id uuid references auth.users(id) primary key,
  username text not null,
  total_cookies numeric default 0,
  prestige_level integer default 0,
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.game_state enable row level security;
alter table public.leaderboard enable row level security;

-- RLS Policies for game_state
create policy "Users can view their own game state"
  on public.game_state
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own game state"
  on public.game_state
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own game state"
  on public.game_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for leaderboard
create policy "Anyone can view leaderboard"
  on public.leaderboard
  for select
  using (true);

create policy "Users can insert their own leaderboard entry"
  on public.leaderboard
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own leaderboard entry"
  on public.leaderboard
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_game_state_user_id on public.game_state(user_id);
create index if not exists idx_leaderboard_total_cookies on public.leaderboard(total_cookies desc);
create index if not exists idx_leaderboard_user_id on public.leaderboard(user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_game_state_updated_at
  before update on public.game_state
  for each row
  execute function update_updated_at_column();

create trigger update_leaderboard_updated_at
  before update on public.leaderboard
  for each row
  execute function update_updated_at_column();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.game_state to anon, authenticated;
grant all on public.leaderboard to anon, authenticated;
