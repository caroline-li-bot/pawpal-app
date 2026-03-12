# PawPal / 爪爪

<p align="center">
  <img src="https://img.shields.io/badge/uni--app-3.0+-blue.svg" alt="uni-app">
  <img src="https://img.shields.io/badge/Vue-3.0+-green.svg" alt="Vue3">
  <img src="https://badge.fury.io/js/@supabase%2Fsupabase-js.svg" alt="Supabase">
  <img src="https://img.shields.io/badge/Vercel-Deployed-success.svg" alt="Vercel">
</p>

<p align="center">🐾 宠物社交 Dating 应用 - 让爱宠找到好朋友</p>

<p align="center">
  <a href="#-在线预览">在线预览</a> •
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-部署指南">部署指南</a> •
  <a href="#-技术栈">技术栈</a>
</p>

---

## 🌐 在线预览

**H5 预览版**: [https://pawpal-app.vercel.app](https://pawpal-app.vercel.app) *(待部署)*

> ⚠️ 注意：H5 版本暂不支持微信登录，请使用小程序版本体验完整功能。

---

## ✨ 功能特性

- 🔐 **微信登录** - 一键授权，快速登录
- 🐕 **宠物资料** - 创建详细的宠物档案，展示爱宠魅力
- 💕 **卡片滑动** - Tinder 风格交互，左滑跳过、右滑喜欢
- 🎉 **双向匹配** - 互相喜欢即可匹配成功，开启聊天
- 💬 **实时聊天** - 基于 Supabase Realtime 的即时通讯
- 📍 **位置发现** - 发现附近的宠物伙伴
- 📷 **照片上传** - 支持多张照片展示宠物风采

---

## 🛠️ 技术栈

- **前端框架**: [uni-app](https://uniapp.dcloud.net.cn/) + Vue 3 + TypeScript
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **后端服务**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage + Realtime)
- **UI 组件**: uni-ui
- **部署平台**: [Vercel](https://vercel.com/) (H5) + 微信小程序

---

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
├── supabase/             # Supabase 配置
│   ├── schema.sql        # 数据库迁移脚本
│   └── functions/        # Edge Functions
├── docs/                 # 文档
│   ├── SUPABASE_SETUP.md # Supabase 配置指南
│   └── VERCEL_DEPLOY.md  # Vercel 部署指南
├── static/               # 静态资源
├── vercel.json           # Vercel 配置
├── DEPLOY.md             # 完整部署指南
└── README.md             # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git

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

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
# Supabase 配置 (必需)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 微信小程序配置 (小程序开发需要)
VITE_WECHAT_APPID=your-wechat-appid
```

> 📖 详细配置说明请参考 [DEPLOY.md](./DEPLOY.md)

### 4. 运行项目

**H5 开发环境**

```bash
npm run dev:h5
```

访问 http://localhost:3000

**微信小程序**

```bash
npm run dev:mp-weixin
```

使用微信开发者工具导入 `dist/dev/mp-weixin` 目录

---

## 📦 部署指南

### 快速部署

我们提供了完整的部署文档：

- **[DEPLOY.md](./DEPLOY.md)** - 完整部署指南
- **[docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)** - Supabase 详细配置
- **[docs/VERCEL_DEPLOY.md](./docs/VERCEL_DEPLOY.md)** - Vercel 部署指南

### 部署概览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   微信小程序    │────▶│   Supabase      │◀────│   Vercel H5     │
│   (用户端)      │     │   (后端服务)    │     │   (预览版)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  PostgreSQL     │
                        │  Storage        │
                        │  Realtime       │
                        │  Edge Functions │
                        └─────────────────┘
```

---

## 🗄️ 数据库结构

### 核心表

| 表名 | 说明 |
|------|------|
| `users` | 用户表，存储微信 openid 等信息 |
| `pet_profiles` | 宠物资料表 |
| `swipes` | 滑动记录表 |
| `matches` | 匹配记录表 |
| `messages` | 消息表 |

### 数据库函数

- `get_recommendations()` - 获取推荐宠物列表
- `handle_swipe()` - 处理滑动操作，自动检测匹配
- `get_chat_sessions()` - 获取聊天会话列表

详细表结构请参考 [supabase/schema.sql](./supabase/schema.sql)

---

## 🔧 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 组件使用 Composition API + <script setup>
- 状态管理使用 Pinia
- API 统一封装在 `src/api/` 目录

### 添加新页面

1. 在 `src/pages/` 创建页面目录
2. 在 `src/pages.json` 注册页面
3. 更新路由配置

### 添加新 API

1. 在 `src/api/supabase.ts` 添加 API 方法
2. 在 `src/types/index.ts` 添加类型定义
3. 在 Store 中调用

---

## 🐛 常见问题

### H5 无法微信登录

H5 环境不支持微信小程序登录，请使用小程序版本或实现微信网页授权。

### 图片上传失败

检查 Storage bucket 权限配置，确保 `pet-photos` bucket 允许 authenticated 用户上传。

### Realtime 消息不实时

确认 `messages` 表已添加到 `supabase_realtime` publication。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 开源协议

[MIT License](./LICENSE)

---

## 🙏 致谢

- [uni-app](https://uniapp.dcloud.net.cn/) - 跨端开发框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vercel](https://vercel.com/) - 前端部署平台

---

<p align="center">Made with ❤️ for pets and their humans</p>
