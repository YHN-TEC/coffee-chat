# CupLink

CupLink 是一个可运行、可演示的社区平台 Demo，帮助用户发现适合交流的人、发起线下或线上 Coffee Chat 邀约，并在社区里发布和互动帖子。

项目使用：

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Zod
- React Hook Form
- bcryptjs

## 已完成功能

- 邮箱密码注册、登录、退出登录
- HttpOnly Cookie 会话
- 新用户资料完善与老用户资料编辑
- 发现页用户卡片、搜索与组合筛选
- 用户详情页、收藏用户、发起 Coffee Chat 邀约
- 邀约页查看收到的 / 发出的邀约，支持接受和拒绝
- 社区帖子列表、发帖、帖子详情
- 帖子点赞、收藏、评论
- 我的收藏、我的帖子
- PostgreSQL 持久化，刷新页面后数据保留

## 演示账号

- 林知夏
  - 邮箱：`lin@coffeechat.demo`
  - 密码：`demo123456`
- 陈牧远
  - 邮箱：`chen@coffeechat.demo`
  - 密码：`demo123456`

你也可以直接注册一个新账号，注册后会自动进入 `/onboarding` 完成资料。

## 快速开始

先确保本机有 Node.js 22+ 和 npm。

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 初始化数据库并写入演示数据

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. 启动开发环境

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 常用脚本

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
npm run db:seed
```

## 演示流程建议

1. 用演示账号登录，或注册一个新账号
2. 新账号进入资料完善页并保存
3. 在发现页搜索和组合筛选用户
4. 打开用户详情页并收藏
5. 发起一条 Coffee Chat 邀约
6. 切换到另一个演示账号，在邀约页接受或拒绝
7. 发布一篇社区帖子
8. 在社区点赞、收藏并评论帖子
9. 在“我的帖子”和“我的收藏”中查看结果
10. 刷新页面，确认数据仍然存在

## 数据说明

种子数据包含：

- 8 个完整背景的中文用户
- 12 篇社区帖子
- 多组用户收藏关系
- 待处理、已接受、已拒绝的邀约样例
- 帖子点赞、收藏与评论数据

## 目录结构

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/
    (protected)/
    login/
    register/
  components/
  lib/
```

## 说明

- 数据库使用云端 PostgreSQL，通过 `DATABASE_URL` 连接
- 图片使用预设 URL，不依赖外部对象存储
- 这是面向演示的 Demo，优先保证流程完整与可运行
