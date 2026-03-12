# Supabase 数据库配置脚本
# 在 Supabase SQL Editor 中执行

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 用户表
create table if not exists users (
  id uuid references auth.users primary key,
  openid text unique not null,
  unionid text,
  nickname text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 宠物资料表
create table if not exists pet_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  name text not null,
  type text not null check (type in ('dog', 'cat', 'other')),
  breed text not null,
  gender text not null check (gender in ('male', 'female', 'unknown')),
  age decimal not null,
  size text not null check (size in ('small', 'medium', 'large')),
  photos text[] default '{}',
  bio text,
  location text,
  latitude decimal,
  longitude decimal,
  personality_tags text[] default '{}',
  interests text[] default '{}',
  is_visible boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 滑动记录表
create table if not exists swipes (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references users(id) not null,
  to_user_id uuid references users(id) not null,
  action text not null check (action in ('like', 'pass', 'super_like')),
  created_at timestamp with time zone default now(),
  unique(from_user_id, to_user_id)
);

-- 匹配记录表
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references users(id) not null,
  user2_id uuid references users(id) not null,
  pet1_id uuid references pet_profiles(id) not null,
  pet2_id uuid references pet_profiles(id) not null,
  created_at timestamp with time zone default now(),
  is_active boolean default true,
  unique(user1_id, user2_id)
);

-- 消息表
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) not null,
  sender_id uuid references users(id) not null,
  content text not null,
  type text default 'text' check (type in ('text', 'image', 'voice')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 创建索引
create index idx_pet_profiles_user_id on pet_profiles(user_id);
create index idx_swipes_from_user_id on swipes(from_user_id);
create index idx_swipes_to_user_id on swipes(to_user_id);
create index idx_matches_user1_id on matches(user1_id);
create index idx_matches_user2_id on matches(user2_id);
create index idx_messages_match_id on messages(match_id);
create index idx_messages_sender_id on messages(sender_id);

-- 启用 Realtime
alter publication supabase_realtime add table messages;

-- 获取推荐列表的函数
create or replace function get_recommendations(p_user_id uuid, p_limit int default 10)
returns table (
  id uuid,
  user_id uuid,
  name text,
  type text,
  breed text,
  gender text,
  age decimal,
  size text,
  photos text[],
  bio text,
  location text,
  personality_tags text[],
  interests text[],
  created_at timestamp with time zone
) as $$
begin
  return query
  select 
    p.id,
    p.user_id,
    p.name,
    p.type,
    p.breed,
    p.gender,
    p.age,
    p.size,
    p.photos,
    p.bio,
    p.location,
    p.personality_tags,
    p.interests,
    p.created_at
  from pet_profiles p
  where p.user_id != p_user_id
    and p.is_visible = true
    and not exists (
      select 1 from swipes s
      where s.from_user_id = p_user_id
        and s.to_user_id = p.user_id
    )
  order by random()
  limit p_limit;
end;
$$ language plpgsql security definer;

-- 处理滑动操作的函数
create or replace function handle_swipe(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_action text
)
returns boolean as $$
declare
  v_is_match boolean := false;
  v_from_pet_id uuid;
  v_to_pet_id uuid;
begin
  -- 记录滑动
  insert into swipes (from_user_id, to_user_id, action)
  values (p_from_user_id, p_to_user_id, p_action)
  on conflict (from_user_id, to_user_id)
  do update set action = p_action, created_at = now();

  -- 检查是否互相喜欢
  if p_action in ('like', 'super_like') then
    select exists (
      select 1 from swipes
      where from_user_id = p_to_user_id
        and to_user_id = p_from_user_id
        and action in ('like', 'super_like')
    ) into v_is_match;

    -- 创建匹配
    if v_is_match then
      select id into v_from_pet_id from pet_profiles where user_id = p_from_user_id limit 1;
      select id into v_to_pet_id from pet_profiles where user_id = p_to_user_id limit 1;
      
      insert into matches (user1_id, user2_id, pet1_id, pet2_id)
      values (
        least(p_from_user_id, p_to_user_id),
        greatest(p_from_user_id, p_to_user_id),
        v_from_pet_id,
        v_to_pet_id
      )
      on conflict (user1_id, user2_id) do nothing;
    end if;
  end if;

  return v_is_match;
end;
$$ language plpgsql security definer;

-- 获取聊天会话列表的函数
create or replace function get_chat_sessions(p_user_id uuid)
returns table (
  id uuid,
  match_id uuid,
  pet jsonb,
  last_message jsonb,
  unread_count bigint,
  updated_at timestamp with time zone
) as $$
begin
  return query
  select 
    m.id,
    m.id as match_id,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'photos', p.photos
    ) as pet,
    (
      select jsonb_build_object(
        'id', msg.id,
        'content', msg.content,
        'type', msg.type,
        'created_at', msg.created_at
      )
      from messages msg
      where msg.match_id = m.id
      order by msg.created_at desc
      limit 1
    ) as last_message,
    (
      select count(*)
      from messages msg
      where msg.match_id = m.id
        and msg.sender_id != p_user_id
        and msg.is_read = false
    ) as unread_count,
    m.created_at as updated_at
  from matches m
  join pet_profiles p on 
    (m.user1_id = p_user_id and p.id = m.pet2_id) or
    (m.user2_id = p_user_id and p.id = m.pet1_id)
  where m.is_active = true
    and (m.user1_id = p_user_id or m.user2_id = p_user_id)
  order by m.created_at desc;
end;
$$ language plpgsql security definer;
