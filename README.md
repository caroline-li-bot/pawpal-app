# PawPal / 爪爪

<p align="center">
  <img src="https://img.shields.io/badge/uni--app-3.0+-blue.svg" alt="uni-app">
  <img src="https://img.shields.io/badge/Vue-3.0+-green.svg" alt="Vue3">
  <img src="https://img.shields.io/badge/TypeScript-4.9+-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-2.0+-green.svg" alt="Supabase">
</p>

<p align="center"
>🐾 宠物社交Dating应用 - 让爱宠找到好朋友</p>

## ✨ 功能特性

- 🔐 **微信登录** - 一键授权，快速登录
- 🐕 **宠物资料** - 创建详细的宠物档案，展示爱宠魅力
- 💕 **卡片滑动** - Tinder风格交互，左滑跳过、右滑喜欢
- 🎉 **双向匹配** - 互相喜欢即可匹配成功，开启聊天
- 💬 **实时聊天** - 基于 Supabase Realtime 的即时通讯
- 📍 **位置发现** - 发现附近的宠物伙伴

## 🛠️ 技术栈

- **前端框架**: uni-app + Vue 3 + TypeScript
- **状态管理**: Pinia
- **后端服务**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **UI组件**: uni-ui
- **部署**: Vercel (H5预览版)

## 📁 项目结构

```
pawpal-app/
├── src/
│   ├── api/              # API 接口
│   │   └── supabase.ts   # Supabase 客户端和 API
│   ├── components/       # 公共组件
│   ├── config/           # 配置文件
│   ├── pages/            # 页面
│   │   ├── login/        # 登录页
│   │   ├── home/         # 主页（卡片滑动）
│   │   ├── pet-profile/  # 宠物资料创建/编辑
│   │   ├── match/        # 匹配成功页
│   │   ├── chat/         # 聊天列表/详情
│   │   └── profile/      # 个人中心
│   ├── stores/           # Pinia Store
│   ├── types/            # TypeScript 类型定义
│   └── utils/            # 工具函数
├── static/               # 静态资源
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/caroline-li-bot/pawpal-app.git
cd pawpal-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WECHAT_APPID=your_wechat_appid
```

### 4. 运行项目

```bash
# H5 开发环境
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

### 5. 构建项目

```bash
# H5 生产环境
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 🗄️ Supabase 数据库配置

### 表结构

#### users 表
```sql
create table users (
  id uuid references auth.users primary key,
  openid text unique not null,
  unionid text,
  nickname text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### pet_profiles 表
```sql
create table pet_profiles (
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
```

#### swipes 表
```sql
create table swipes (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references users(id) not null,
  to_user_id uuid references users(id) not null,
  action text not null check (action in ('like', 'pass', 'super_like')),
  created_at timestamp with time zone default now(),
  unique(from_user_id, to_user_id)
);
```

#### matches 表
```sql
create table matches (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references users(id) not null,
  user2_id uuid references users(id) not null,
  pet1_id uuid references pet_profiles(id) not null,
  pet2_id uuid references pet_profiles(id) not null,
  created_at timestamp with time zone default now(),
  is_active boolean default true,
  unique(user1_id, user2_id)
);
```

#### messages 表
```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references matches(id) not null,
  sender_id uuid references users(id) not null,
  content text not null,
  type text default 'text' check (type in ('text', 'image', 'voice')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);
```

### Storage 存储桶

创建 `pet-photos` 存储桶用于存储宠物照片。

### Edge Functions

创建 `wechat-login` Edge Function 处理微信登录。

## 📱 小程序配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号
3. 获取 AppID
4. 配置服务器域名（request、socket、upload/download）
5. 使用微信开发者工具导入项目

## 🌐 Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

## 📄 开源协议

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<p align="center">Made with ❤️ for pets and their humans</p>
