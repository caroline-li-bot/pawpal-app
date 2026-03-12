# Supabase 配置指南

本文档详细说明如何配置 PawPal 的 Supabase 后端。

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: pawpal-app
   - **Database Password**: 设置一个强密码
   - **Region**: 选择离你最近的区域（推荐 Singapore 或 Tokyo）
4. 等待项目创建完成（约 1-2 分钟）

## 2. 获取项目配置

项目创建完成后，在 Project Settings > API 中获取：

- **Project URL**: `https://<project-ref>.supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1NiIs...` (客户端使用)
- **service_role secret**: `eyJhbGciOiJIUzI1NiIs...` (服务端使用，保密！)

## 3. 执行数据库迁移

1. 进入 SQL Editor
2. 新建查询
3. 复制并执行 `supabase/schema.sql` 中的全部内容

## 4. 配置 Storage Bucket

1. 进入 Storage 页面
2. 点击 "New bucket"
3. 创建 `pet-photos` bucket
4. 配置权限：
   - 允许 authenticated 用户上传
   - 允许 public 访问（用于图片展示）

## 5. 部署 Edge Function

### 安装 Supabase CLI

```bash
npm install -g supabase
```

### 登录并链接项目

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 部署 Edge Function

```bash
cd supabase/functions/wechat-login
supabase functions deploy wechat-login
```

### 配置环境变量

在 Supabase Dashboard > Edge Functions 中设置：

```
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 6. 配置 Realtime

数据库迁移脚本已自动启用 Realtime：

```sql
alter publication supabase_realtime add table messages;
```

如需手动配置：
1. 进入 Database > Replication
2. 确保 `messages` 表已添加到 `supabase_realtime` publication

## 7. 生成 TypeScript 类型

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/types/supabase.ts
```

## 8. 配置 Row Level Security (RLS)

为所有表启用 RLS 策略：

```sql
-- users 表
alter table users enable row level security;
create policy "Users can view own data" on users
  for select using (auth.uid() = id);
create policy "Users can update own data" on users
  for update using (auth.uid() = id);

-- pet_profiles 表
alter table pet_profiles enable row level security;
create policy "Public profiles are viewable" on pet_profiles
  for select using (is_visible = true);
create policy "Users can insert own profile" on pet_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on pet_profiles
  for update using (auth.uid() = user_id);

-- swipes 表
alter table swipes enable row level security;
create policy "Users can view own swipes" on swipes
  for select using (auth.uid() = from_user_id);
create policy "Users can insert own swipes" on swipes
  for insert with check (auth.uid() = from_user_id);

-- matches 表
alter table matches enable row level security;
create policy "Users can view own matches" on matches
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- messages 表
alter table messages enable row level security;
create policy "Users can view messages from their matches" on messages
  for select using (
    exists (
      select 1 from matches m
      where m.id = messages.match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );
create policy "Users can insert messages to their matches" on messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from matches m
      where m.id = messages.match_id
      and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );
```

## 9. 配置 Authentication

1. 进入 Authentication > Providers
2. 确保 Email provider 已启用
3. 可选：配置其他登录方式（微信登录通过 Edge Function 实现）

## 10. 更新项目环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# 微信小程序配置
VITE_WECHAT_APPID=your_wechat_appid
```

## 验证配置

运行以下命令测试配置：

```bash
# 测试数据库连接
supabase db test

# 测试 Edge Function
supabase functions serve wechat-login
```

## 故障排除

### Edge Function 部署失败
- 检查 Deno 语法是否正确
- 确认环境变量已设置

### 数据库连接问题
- 检查网络连接
- 确认 IP 白名单设置

### Realtime 不工作
- 检查 messages 表是否在 publication 中
- 确认客户端订阅代码正确
