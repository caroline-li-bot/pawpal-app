# Vercel 部署指南

本文档详细说明如何将 PawPal H5 版本部署到 Vercel。

## 前置要求

- Vercel 账号（可使用 GitHub 账号登录）
- 项目已推送到 GitHub

## 部署方式

### 方式一：通过 Vercel CLI 部署

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 配置项目

```bash
cd pawpal-app
vercel
```

按提示配置：
- 选择或创建项目
- 确认部署设置

#### 4. 配置环境变量

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_WECHAT_APPID
```

或在 Vercel Dashboard > Project Settings > Environment Variables 中手动添加。

#### 5. 部署生产环境

```bash
vercel --prod
```

### 方式二：通过 GitHub 集成部署（推荐）

#### 1. 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 `caroline-li-bot/pawpal-app` 仓库

#### 2. 配置构建设置

Vercel 会自动识别 `vercel.json` 配置：

- **Framework Preset**: Other
- **Build Command**: `npm run build:h5`
- **Output Directory**: `dist/build/h5`

#### 3. 配置环境变量

在 Vercel Dashboard > Project Settings > Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| VITE_SUPABASE_URL | https://your-project.supabase.co | Production, Preview |
| VITE_SUPABASE_ANON_KEY | your-anon-key | Production, Preview |
| VITE_WECHAT_APPID | your-wechat-appid | Production, Preview |

#### 4. 部署

点击 "Deploy"，Vercel 会自动构建并部署。

## 配置自定义域名（可选）

1. 在 Vercel Dashboard > Project Settings > Domains
2. 添加你的域名
3. 按提示配置 DNS

## 自动部署

配置 GitHub 集成后，每次推送到 main 分支会自动触发部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel 会自动：
1. 拉取最新代码
2. 安装依赖
3. 构建项目
4. 部署到生产环境

## 预览部署

对于 Pull Request，Vercel 会自动创建预览部署：

```bash
git checkout -b feature/new-feature
git add .
git commit -m "添加新功能"
git push origin feature/new-feature
```

然后在 GitHub PR 页面查看预览链接。

## 构建配置说明

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/build/h5"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### package.json 脚本

```json
{
  "scripts": {
    "build:h5": "uni build"
  }
}
```

## 故障排除

### 构建失败

1. 检查 Node.js 版本（推荐 18+）
2. 确认依赖安装成功
3. 查看 Vercel 构建日志

### 环境变量不生效

1. 确认变量名以 `VITE_` 开头
2. 重新部署项目
3. 检查环境变量作用域

### 页面 404

1. 检查 `vercel.json` 路由配置
2. 确认 `dist/build/h5` 目录存在
3. 检查构建输出路径

### 微信登录在 H5 不工作

H5 环境不支持微信小程序登录，需要：
1. 使用微信网页授权（需配置微信开放平台）
2. 或使用邮箱/手机号登录作为备选

## 性能优化

### 启用缓存

在 `vercel.json` 中添加：

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 压缩资源

Vercel 自动启用 gzip/brotli 压缩。

## 监控和分析

在 Vercel Dashboard 中查看：
- 部署历史
- 构建日志
- 性能分析
- 访问统计

## 回滚部署

如需回滚到之前的版本：

1. 进入 Vercel Dashboard > Deployments
2. 找到要回滚的版本
3. 点击 "Promote to Production"
