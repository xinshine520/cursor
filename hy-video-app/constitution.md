# 项目开发说明文档

## 1. 项目概述

本项旨在开发一款集 AI 创作、素材管理与个人资产运营于一体的高性能 App。项目名称暂定为 **“华玥AI (HyAI)”**。

## 2. 技术栈规范 (Technology Stack)

为了确保系统的稳定性与先进性，全线采用最新稳定版技术：

| 维度 | 技术选型 | 版本要求 |
| --- | --- | --- |
| **前端 (Mobile)** | uni-app | 基于 **Vue 3 (Vite)** 稳定版 |
| **后端 (Backend)** | Spring Boot | **3.4.x** (或最新 GA 版)，JDK 21 |
| **数据库 (DB)** | PostgreSQL | **16.x/17.x** 稳定版 |
| **缓存 (Cache)** | Redis | **7.x** 稳定版 |
| **UI 组件库** | uni-ui / TMUI | 需支持 Vue 3 |
| **生成具体页面** | 请优先考虑 uni-app 的跨端兼容性（H5 + 小程序 + App）。

---

## 3. 核心功能模块 (Core Modules)

### 3.1 底部导航栏 (Tabbar)

1. **首页 (Home)**：聚合推荐、核心入口、动态展示。
2. **素材 (Material)**：创作底料库。
3. **资产 (Assets)**：创作成果展示。
4. **我的 (Me)**：个人中心与 AI 工具集。

### 3.2 页面详细需求

#### **A. 素材页 (Material)**

采用标签页 (Tabs) 设计，分类如下：

* **官方**：系统预设的高质量模板与素材。
* **个人**：用户上传或收藏的私有素材。
* **生成**：通过 AI 能力生成的初步素材成品。

#### **B. 资产页 (Assets)**

侧重于内容的沉淀与管理：

* **智能创作**：正在进行中或待优化的 AI 项目。
* **品牌视频**：高价值的商业化视频资产。
* **作品**：已完成并导出的个人成品展示。

#### **C. 我的 (Me) - AI 工具箱与管理**

本页面分为两个核心区域：

**1. AI 工具矩阵 (Grid 布局)**

> *设计要求：使用高饱和度、具有科技感的图标 (推荐使用 Lucide 或 IconPark)*

* **内容分析**：帐号对标、抖音爆款。
* **创意策划**：IP 精灵、选题生成、文案生成、标题生成、朋友圈文案、小红书文案。
* **文案处理**：文案提取、文案改写。
* **音视频创作**：视频创作、形象训练、声音训练。

**2. 账户管理 (List 布局)**

* 基本信息、我的资产、我的数字人、我的声音、授权视频、卡密兑换、帐号设置。

---

## 4. 开发指南 (Cursor / LLM Instructions)

### 4.1 目录结构规范

```text
├── frontend (uni-app)
│   ├── src
│   │   ├── pages          # 页面组件
│   │   ├── components     # 公共组件
│   │   ├── static         # 图标与静态资源
│   │   └── api            # 接口请求封装
├── backend (spring-boot)
│   ├── src/main/java/com/project
│   │   ├── controller     # REST 接口
│   │   ├── service        # 业务逻辑
│   │   ├── entity         # POJO/Entity (PostgreSQL)
│   │   └── repository     # Spring Data JPA / Mybatis Plus

```

### 4.2 开发原则 (Rules)

* **UI/UX 指令**：所有页面需符合极简主义美学。图标统一使用线性或面性风格，色彩需具备 AI 科技感（推荐 #4F46E5 或 #06B6D4 系）。
* **前端逻辑**：使用 `<script setup>` 语法，状态管理使用 **Pinia**。
* **后端逻辑**：遵循 RESTful API 规范，所有返回体需封装统一的 `Result<T>` 对象。
* **数据库**：PostgreSQL 字段命名使用小写下划线 (snake_case)，必须包含 `created_at` 和 `updated_at`。
* **Redis 使用**：主要用于存储用户 Token (JWT)、临时生成的 AI 任务状态及高频访问的配置信息。

---

## 5. 初始任务清单 (Todo List)

* [ ] **Step 1**: 初始化 uni-app 项目 (Vue 3 + Vite)。
* [ ] **Step 2**: 配置 Tabbar (首页、素材、资产、我的)。
* [ ] **Step 3**: 构建 `我的` 页面布局，完成 AI 工具矩阵的 UI 渲染。
* [ ] **Step 4**: 初始化 Spring Boot 后端架构及 PostgreSQL 数据库连接。
* [ ] **Step 5**: 实现基于 Redis 的用户认证体系。

---