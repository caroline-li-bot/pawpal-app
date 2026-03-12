# PawPal 部署指南

本文档提供 PawPal 应用的完整部署流程。

## 📋 部署清单

- [ ] Supabase 后端配置
- [ ] Vercel H5 部署
- [ ] 微信小程序配置
- [ ] 环境变量配置
- [ ] 功能测试

---

## 1. Supabase 后端配置

### 1.1 创建项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目：
   - **Name**: `pawpal-app`
   - **Region**: Singapore (或离你最近的区域)
   - **Database Password**: 设置强密码并保存

### 1.2 获取项目凭证

进入 Project Settings > API，记录以下信息：

```
Project URL: https://<project-ref>.supabase.co
anon public: <your-anon-key>
service_role secret: <your-service-role-key> (保密！)
```

### 1.3 执行数据库迁移

1. 进入 SQL Editor
2. 新建查询
3. 复制并执行 `supabase/schema.sql` 中的全部 SQL

### 1.4 配置 Storage

1. 进入 Storage 页面
2. 创建 `pet-photos` bucket
3. 设置权限：
   - Upload: `authenticated`
   - Download: `public`

### 1.5 部署 Edge Function

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref <your-project-ref>

# 部署 Edge Function
supabase functions deploy wechat-login

# 设置环境变量
supabase secrets set WECHAT_APPID=your_wechat_appid
supabase secrets set WECHAT_SECRET=your_wechat_secret
```

### 1.6 配置 RLS 策略

在 SQL Editor 中执行以下 SQL：

```sql
-- 启用 RLS
alter table users enable row level security;
alter table pet_profiles enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;

-- users 表策略
create policy "Users can view own data" on users
  for select using (auth.uid() = id);
create policy "Users can update own data" on users
  for update using (auth.uid() = id);

-- pet_profiles 表策略
create policy "Public profiles are viewable" on pet_profiles
  for select using (is_visible = true);
create policy "Users can manage own profile" on pet_profiles
  for all using (auth.uid() = user_id);

-- swipes 表策略
create policy "Users can view own swipes" on swipes
  for select using (auth.uid() = from_user_id);
create policy "Users can insert own swipes" on swipes
  for insert with check (auth.uid() = from_user_id);

-- matches 表策略
create policy "Users can view own matches" on matches
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- messages 表策略
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

### 1.7 生成 TypeScript 类型

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/types/supabase.ts
```

---

## 2. Vercel H5 部署

### 2.1 准备项目

确保项目已推送到 GitHub：

```bash
git add .
git commit -m "准备部署"
git push origin main
```

### 2.2 导入项目到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 `caroline-li-bot/pawpal-app` 仓库

### 2.3 配置构建设置

Vercel 会自动识别 `vercel.json`，确认以下设置：

- **Framework Preset**: Other
- **Build Command**: `npm run build:h5`
- **Output Directory**: `dist/build/h5`

### 2.4 配置环境变量

在 Vercel Dashboard > Project Settings > Environment Variables 中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<your-anon-key>` |
| `VITE_WECHAT_APPID` | `your_wechat_appid` |

### 2.5 部署

点击 "Deploy"，等待构建完成。

**部署 URL**: `https://pawpal-app.vercel.app` (示例)

---

## 3. 微信小程序配置

### 3.1 注册小程序

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号
3. 获取 AppID 和 AppSecret

### 3.2 配置服务器域名

在小程序后台 > 开发 > 开发设置 > 服务器域名：

- **request 合法域名**: `https://<project-ref>.supabase.co`
- **socket 合法域名**: `wss://<project-ref>.supabase.co`
- **uploadFile 合法域名**: `https://<project-ref>.supabase.co`
- **downloadFile 合法域名**: `https://<project-ref>.supabase.co`

### 3.3 构建小程序

```bash
npm run build:mp-weixin
```

使用微信开发者工具导入 `dist/build/mp-weixin` 目录。

---

## 4. 环境变量配置

### 4.1 本地开发环境

创建 `.env` 文件：

```env
# Supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 微信小程序
VITE_WECHAT_APPID=your_wechat_appid
```

### 4.2 生产环境

已在 Vercel 和 Supabase 中配置。

---

## 5. 功能测试

### 5.1 登录测试

1. 打开 H5 或小程序
2. 点击微信登录
3. 确认能正常获取用户信息

### 5.2 宠物资料测试

1. 创建宠物资料
2. 上传照片
3. 确认资料保存成功

### 5.3 匹配功能测试

1. 浏览推荐卡片
2. 左滑/右滑操作
3. 确认匹配成功提示

### 5.4 聊天功能测试

1. 进入匹配列表
2. 发送消息
3. 确认实时消息接收

---

## 📁 项目文件说明

```
pawpal-app/
├── docs/
│   ├── SUPABASE_SETUP.md    # Supabase 详细配置
│   └── VERCEL_DEPLOY.md     # Vercel 详细部署
├── supabase/
│   ├── schema.sql           # 数据库迁移脚本
│   └── functions/
│       └── wechat-login/    # 微信登录 Edge Function
├── src/
│   ├── api/
│   │   └── supabase.ts      # Supabase API 封装
│   ├── types/
│   │   └── index.ts         # TypeScript 类型
│   └── ...
├── vercel.json              # Vercel 配置
├── package.json
└── README.md
```

---

## 🔧 故障排除

### 数据库连接失败
- 检查 Supabase URL 和 Key 是否正确
- 确认网络连接正常
- 检查 RLS 策略配置

### Edge Function 调用失败
- 检查 Edge Function 是否已部署
- 确认环境变量已设置
- 查看 Supabase Functions 日志

### 图片上传失败
- 检查 Storage bucket 权限
- 确认 bucket 名称正确
- 检查文件大小限制

### Realtime 不工作
- 确认 messages 表已添加到 publication
- 检查客户端订阅代码
- 查看浏览器控制台错误

---

## 📞 获取帮助

- Supabase 文档: https://supabase.com/docs
- Vercel 文档: https://vercel.com/docs
- uni-app 文档: https://uniapp.dcloud.net.cn/
- 微信开发文档: https://developers.weixin.qq.com/miniprogram/dev/
