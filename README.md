# 智健解语 - 个人体检报告智能分析网站

基于AI技术的个人体检报告智能分析平台，提供专业的体检报告解读和健康建议。

## 功能特点

- 🔍 智能体检报告分析
- 📊 健康数据可视化
- 💡 个性化健康建议
- 🔐 安全的用户认证系统
- 📱 响应式设计，支持多设备

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- React Router 路由管理
- Zustand 状态管理

### 后端
- Node.js + Express
- TypeScript
- Supabase 数据库
- JWT 身份验证
- GLM-4.5 AI 模型

## 快速开始

### 环境要求
- Node.js >= 18
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
创建 `.env` 文件并配置以下环境变量：
```env
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# GLM API 配置
GLM_API_KEY=your_glm_api_key

# JWT 密钥
JWT_SECRET=your_jwt_secret
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 部署

项目已配置 Vercel 部署，推送到 GitHub 后可自动部署。

## 许可证

MIT License