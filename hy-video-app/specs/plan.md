# 华玥AI (HyAI) - 项目开发计划

## 1. 项目概览

### 1.1 项目信息

| 项目名称 | 华玥AI (HyAI) |
| --- | --- |
| 项目类型 | AI 创作平台 App |
| 目标用户 | 内容创作者、短视频运营者、自媒体从业者 |
| 平台支持 | H5 + 小程序 + App（跨端兼容） |
| 文档版本 | v1.0 |
| 创建日期 | 2026-02-02 |

### 1.2 项目目标

- **核心目标**：开发一款集 AI 创作、素材管理与个人资产运营于一体的高性能 App
- **业务目标**：通过 AI 能力赋能内容创作全流程，提升用户创作效率
- **技术目标**：构建稳定、可扩展的前后端架构，支持多端运行

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 版本 |
| --- | --- | --- |
| 前端框架 | uni-app + Vue 3 (Vite) | 最新稳定版 |
| 后端框架 | Spring Boot | 3.4.x |
| 运行环境 | JDK | 21 |
| 数据库 | PostgreSQL | 16.x / 17.x |
| 缓存 | Redis | 7.x |
| UI 组件库 | uni-ui | 最新版 |
| 图标库 | Font Awesome | 6.x |

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
├─────────────────┬─────────────────┬─────────────────────────┤
│      H5         │     小程序       │         App             │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         └─────────────────┼─────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     uni-app (Vue 3)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   首页   │  │   素材   │  │   资产   │  │   我的   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot 后端                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Controller  │  │   Service    │  │  Repository  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────┬───────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis       │  │   AI Services   │
│    (数据库)     │  │    (缓存)       │  │   (AI 接口)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 3. 功能模块

### 3.1 模块概览

| 模块 | 功能数量 | 优先级 | 说明 |
| --- | --- | --- | --- |
| 首页 | 3 | P0 | 推荐内容、核心入口、动态展示 |
| 素材页 | 3 | P0 | 官方、个人、生成 |
| 资产页 | 3 | P0 | 智能创作、品牌视频、作品 |
| 我的页面 | 20 | P0 | AI 工具箱(13) + 账户管理(7) |
| 用户认证 | 4 | P0 | 登录、注册、Token、退出 |

### 3.2 功能详情

#### A. 首页功能
- [ ] 推荐内容展示
- [ ] 核心功能入口
- [ ] 最新动态列表

#### B. 素材页功能
- [ ] 官方素材列表
- [ ] 个人素材管理
- [ ] AI 生成素材

#### C. 资产页功能
- [ ] 智能创作项目管理
- [ ] 品牌视频资产
- [ ] 作品展示

#### D. 我的页面功能

**AI 工具箱（13个）**
- [ ] 帐号对标
- [ ] 抖音爆款
- [ ] IP 精灵
- [ ] 文案提取
- [ ] 选题生成
- [ ] 文案生成
- [ ] 标题生成
- [ ] 文案改写
- [ ] 朋友圈文案
- [ ] 小红书文案
- [ ] 视频创作
- [ ] 形象训练
- [ ] 声音训练

**账户管理（7个）**
- [ ] 基本信息
- [ ] 我的资产
- [ ] 我的数字人
- [ ] 我的声音
- [ ] 授权视频
- [ ] 卡密兑换
- [ ] 帐号设置

---

## 4. 开发阶段

### 4.1 阶段划分

```
Phase 1        Phase 2        Phase 3        Phase 4
项目初始化 ──→ 页面开发 ──→ 后端开发 ──→ 联调测试
```

### 4.2 Phase 1: 项目初始化

**目标**：完成前后端项目搭建和基础配置

| 任务编号 | 任务名称 | 负责人 | 状态 |
| --- | --- | --- | --- |
| T1.1 | 创建 uni-app 项目 (Vue 3 + Vite) | 前端 | 🔲 待开始 |
| T1.2 | 配置 pages.json，设置 Tabbar | 前端 | 🔲 待开始 |
| T1.3 | 配置全局样式和主题色 | 前端 | 🔲 待开始 |
| T1.4 | 创建 Spring Boot 项目 | 后端 | 🔲 待开始 |
| T1.5 | 配置 PostgreSQL 数据库连接 | 后端 | 🔲 待开始 |
| T1.6 | 配置 Redis 缓存 | 后端 | 🔲 待开始 |

**交付物**：
- 前端项目骨架（可运行）
- 后端项目骨架（可运行）
- 数据库连接成功
- Redis 连接成功

### 4.3 Phase 2: 页面开发

**目标**：完成所有前端页面的 UI 开发

| 任务编号 | 任务名称 | 负责人 | 状态 |
| --- | --- | --- | --- |
| T2.1 | 开发首页 (index) 页面 | 前端 | 🔲 待开始 |
| T2.2 | 开发素材页 (material) 页面 | 前端 | 🔲 待开始 |
| T2.3 | 开发资产页 (assets) 页面 | 前端 | 🔲 待开始 |
| T2.4 | 开发我的页面 - AI 工具箱 | 前端 | 🔲 待开始 |
| T2.5 | 开发我的页面 - 账户管理 | 前端 | 🔲 待开始 |
| T2.6 | 开发公共组件 | 前端 | 🔲 待开始 |
| T2.7 | 页面交互和动画 | 前端 | 🔲 待开始 |

**交付物**：
- 4 个主页面完成
- 所有公共组件
- 页面交互效果

### 4.4 Phase 3: 后端开发

**目标**：完成所有后端接口开发

| 任务编号 | 任务名称 | 负责人 | 状态 |
| --- | --- | --- | --- |
| T3.1 | 设计数据库表结构 | 后端 | 🔲 待开始 |
| T3.2 | 创建数据库表 | 后端 | 🔲 待开始 |
| T3.3 | 实现用户认证接口 (JWT + Redis) | 后端 | 🔲 待开始 |
| T3.4 | 实现素材管理接口 | 后端 | 🔲 待开始 |
| T3.5 | 实现资产管理接口 | 后端 | 🔲 待开始 |
| T3.6 | 实现用户管理接口 | 后端 | 🔲 待开始 |
| T3.7 | 接口文档编写 | 后端 | 🔲 待开始 |

**交付物**：
- 数据库表结构
- 所有 API 接口
- 接口文档 (Swagger/OpenAPI)

### 4.5 Phase 4: 联调测试

**目标**：完成前后端联调和功能测试

| 任务编号 | 任务名称 | 负责人 | 状态 |
| --- | --- | --- | --- |
| T4.1 | 前后端接口联调 | 全员 | 🔲 待开始 |
| T4.2 | 功能测试 | 测试 | 🔲 待开始 |
| T4.3 | Bug 修复 | 全员 | 🔲 待开始 |
| T4.4 | 性能优化 | 全员 | 🔲 待开始 |
| T4.5 | 多端兼容测试 | 测试 | 🔲 待开始 |

**交付物**：
- 功能测试报告
- Bug 修复记录
- 性能优化报告

---

## 5. 里程碑

| 里程碑 | 阶段 | 目标 | 状态 |
| --- | --- | --- | --- |
| M1 | Phase 1 完成 | 项目初始化完成 | 🔲 待完成 |
| M2 | Phase 2 完成 | 前端页面开发完成 | 🔲 待完成 |
| M3 | Phase 3 完成 | 后端接口开发完成 | 🔲 待完成 |
| M4 | Phase 4 完成 | 联调测试完成 | 🔲 待完成 |
| M5 | 项目上线 | 正式发布 | 🔲 待完成 |

---

## 6. 数据库设计

### 6.1 核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### 素材表 (materials)
```sql
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    url VARCHAR(500),
    thumbnail VARCHAR(500),
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### 资产表 (assets)
```sql
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL,
    url VARCHAR(500),
    thumbnail VARCHAR(500),
    progress INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### 6.2 Redis Key 设计

| Key 模式 | 说明 | 过期时间 |
| --- | --- | --- |
| `user:token:{userId}` | 用户 Token | 7天 |
| `user:info:{userId}` | 用户信息缓存 | 1小时 |
| `ai:task:{taskId}` | AI 任务状态 | 24小时 |
| `config:{configKey}` | 系统配置 | 永久 |

---

## 7. API 设计

### 7.1 API 规范

- **基础路径**：`/api/v1`
- **认证方式**：JWT Token (Bearer)
- **返回格式**：JSON

### 7.2 统一返回体

```json
{
    "code": 200,
    "message": "success",
    "data": {}
}
```

### 7.3 核心接口列表

| 模块 | 接口 | 方法 | 路径 | 说明 |
| --- | --- | --- | --- | --- |
| 用户 | 登录 | POST | `/api/v1/auth/login` | 用户登录 |
| 用户 | 注册 | POST | `/api/v1/auth/register` | 用户注册 |
| 用户 | 用户信息 | GET | `/api/v1/user/info` | 获取用户信息 |
| 素材 | 素材列表 | GET | `/api/v1/materials` | 获取素材列表 |
| 素材 | 素材详情 | GET | `/api/v1/materials/{id}` | 获取素材详情 |
| 素材 | 上传素材 | POST | `/api/v1/materials` | 上传素材 |
| 资产 | 资产列表 | GET | `/api/v1/assets` | 获取资产列表 |
| 资产 | 资产详情 | GET | `/api/v1/assets/{id}` | 获取资产详情 |
| 资产 | 创建资产 | POST | `/api/v1/assets` | 创建资产 |

---

## 8. 风险管理

### 8.1 技术风险

| 风险 | 等级 | 影响 | 应对措施 |
| --- | --- | --- | --- |
| 跨端兼容性问题 | 中 | 部分功能无法在某端运行 | 使用 uni-app 条件编译 |
| 性能问题 | 中 | 页面卡顿、接口慢 | 代码优化、缓存策略 |
| 安全问题 | 高 | 数据泄露 | JWT 认证、接口鉴权、数据加密 |

### 8.2 项目风险

| 风险 | 等级 | 影响 | 应对措施 |
| --- | --- | --- | --- |
| 需求变更 | 中 | 开发返工 | 需求评审、变更控制 |
| 进度延期 | 中 | 项目延期 | 定期跟进、风险预警 |
| 资源不足 | 低 | 无法按时交付 | 提前规划、资源调配 |

---

## 9. 质量保证

### 9.1 代码规范

- 遵循 instructions.md 中的开发规范
- 代码提交前进行 Code Review
- 使用 ESLint / Prettier 进行代码格式化

### 9.2 测试策略

| 测试类型 | 说明 | 工具 |
| --- | --- | --- |
| 单元测试 | 核心函数测试 | Jest / JUnit |
| 接口测试 | API 接口测试 | Postman / Swagger |
| 功能测试 | 页面功能测试 | 手动测试 |
| 兼容测试 | 多端兼容测试 | 真机 + 模拟器 |

---

## 10. 文档清单

| 文档名称 | 路径 | 说明 |
| --- | --- | --- |
| 项目说明 | `constitution.md` | 项目需求说明 |
| 开发指南 | `instructions.md` | Cursor 开发指南 |
| 开发计划 | `specs/plan.md` | 本文档 |
| 原型说明 | `archetypes/README-blue.md` | 蓝色主题原型说明 |
| 原型文件 | `archetypes/index-blue.html` | 蓝色主题原型 |

---

## 11. 附录

### 11.1 开发环境要求

| 工具 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | 18.x+ | 前端运行环境 |
| npm/pnpm | 最新版 | 包管理器 |
| JDK | 21 | 后端运行环境 |
| Maven | 3.9+ | 后端构建工具 |
| PostgreSQL | 16.x+ | 数据库 |
| Redis | 7.x+ | 缓存 |
| IDE | Cursor / VSCode / IntelliJ IDEA | 开发工具 |

### 11.2 参考链接

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Redis 官方文档](https://redis.io/documentation)

---

**文档版本**：v1.0  
**创建日期**：2026-02-02  
**最后更新**：2026-02-02  
**维护人员**：项目组
