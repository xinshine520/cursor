# 华玥AI (HyAI) - Cursor 开发指南

## 1. 项目概述

本项目旨在开发一款集 **AI 创作、素材管理与个人资产运营** 于一体的高性能 App。项目名称为 **"华玥AI (HyAI)"**。

### 1.1 项目定位

- **目标用户**：内容创作者、短视频运营者、自媒体从业者
- **核心价值**：通过 AI 能力赋能内容创作全流程
- **平台支持**：H5 + 小程序 + App（跨端兼容）

---

## 2. 技术栈规范

### 2.1 版本要求

| 维度 | 技术选型 | 版本要求 | 说明 |
| --- | --- | --- | --- |
| **前端框架** | uni-app | 基于 **Vue 3 (Vite)** | 最新稳定版 |
| **后端框架** | Spring Boot | **3.4.x** | JDK 21 |
| **数据库** | PostgreSQL | **16.x / 17.x** | 最新稳定版 |
| **缓存** | Redis | **7.x** | 最新稳定版 |
| **UI 组件库** | uni-ui / TMUI | 需支持 Vue 3 | 推荐 uni-ui |
| **图标库** | Font Awesome / IconPark | 6.x / 最新版 | 具有科技感 |

### 2.2 配色方案

采用蓝色主题，体现 AI 科技感：

| 颜色名称 | 色值 | 用途 |
| --- | --- | --- |
| 主蓝色 | `#2563EB` | 主要按钮、强调元素 |
| 浅蓝色 | `#3B82F6` | 渐变色、次要元素 |
| 深蓝色 | `#1E40AF` | 深色元素、hover 状态 |
| 次要蓝色 | `#0EA5E9` | 辅助色、渐变 |
| 强调蓝色 | `#06B6D4` | 高亮、特殊标记 |
| 浅色背景 | `#DBEAFE` / `#EFF6FF` | 背景色、卡片背景 |

---

## 3. 功能清单

### 3.1 底部导航栏 (Tabbar) - 4个

| 序号 | 名称 | 图标 | 说明 |
| --- | --- | --- | --- |
| 1 | 首页 | `fa-home` | 聚合推荐、核心入口、动态展示 |
| 2 | 素材 | `fa-folder` | 创作底料库 |
| 3 | 资产 | `fa-briefcase` | 创作成果展示 |
| 4 | 我的 | `fa-user` | 个人中心与 AI 工具集 |

### 3.2 素材页 (Material) - 3个标签

| 标签名 | 图标 | 说明 |
| --- | --- | --- |
| 官方 | `fa-crown` | 系统预设的高质量模板与素材 |
| 个人 | `fa-user` | 用户上传或收藏的私有素材 |
| 生成 | `fa-robot` | 通过 AI 能力生成的初步素材成品 |

### 3.3 资产页 (Assets) - 3个分类

| 分类名 | 图标 | 说明 |
| --- | --- | --- |
| 智能创作 | `fa-brain` | 正在进行中或待优化的 AI 项目（带进度条） |
| 品牌视频 | `fa-briefcase` | 高价值的商业化视频资产 |
| 作品 | `fa-film` | 已完成并导出的个人成品展示 |

### 3.4 我的页面 (Me)

#### A. AI 工具箱 - 13个工具（Grid 布局）

| 分类 | 工具名称 | 图标 |
| --- | --- | --- |
| **内容分析** | 帐号对标 | `fa-chart-bar` |
| | 抖音爆款 | `fa-fire` |
| **创意策划** | IP 精灵 | `fa-fairy` / `fa-magic` |
| | 选题生成 | `fa-lightbulb` |
| | 文案生成 | `fa-pen` |
| | 标题生成 | `fa-heading` |
| | 朋友圈文案 | `fa-comment` |
| | 小红书文案 | `fa-mobile-alt` |
| **文案处理** | 文案提取 | `fa-file-alt` |
| | 文案改写 | `fa-redo` |
| **音视频创作** | 视频创作 | `fa-video` |
| | 形象训练 | `fa-user-circle` |
| | 声音训练 | `fa-microphone` |

#### B. 账户管理 - 7个选项（List 布局）

| 选项名 | 图标 | 说明 |
| --- | --- | --- |
| 基本信息 | `fa-user` | 用户基本信息管理 |
| 我的资产 | `fa-briefcase` | 用户资产总览 |
| 我的数字人 | `fa-robot` | 数字人形象管理 |
| 我的声音 | `fa-microphone-alt` | 声音克隆管理 |
| 授权视频 | `fa-lock` | 视频授权管理 |
| 卡密兑换 | `fa-ticket-alt` | 充值卡兑换 |
| 帐号设置 | `fa-cog` | 账户设置 |

---

## 4. 目录结构规范

### 4.1 前端项目结构 (uni-app)

```text
frontend/
├── src/
│   ├── pages/                    # 页面组件
│   │   ├── index/                # 首页
│   │   │   └── index.vue
│   │   ├── material/             # 素材页
│   │   │   └── index.vue
│   │   ├── assets/               # 资产页
│   │   │   └── index.vue
│   │   └── me/                   # 我的页面
│   │       └── index.vue
│   ├── components/               # 公共组件
│   │   ├── TabBar.vue            # 底部导航栏
│   │   ├── ToolGrid.vue          # 工具网格组件
│   │   ├── MaterialCard.vue      # 素材卡片组件
│   │   └── AssetItem.vue         # 资产列表项组件
│   ├── static/                   # 静态资源
│   │   ├── images/               # 图片资源
│   │   └── icons/                # 图标资源
│   ├── api/                      # 接口请求封装
│   │   ├── request.js            # 请求基础配置
│   │   ├── user.js               # 用户相关接口
│   │   ├── material.js           # 素材相关接口
│   │   └── asset.js              # 资产相关接口
│   ├── stores/                   # Pinia 状态管理
│   │   ├── user.js               # 用户状态
│   │   └── app.js                # 应用状态
│   ├── utils/                    # 工具函数
│   │   └── common.js
│   ├── App.vue                   # 应用入口
│   ├── main.js                   # 主入口文件
│   ├── pages.json                # 页面配置
│   ├── manifest.json             # 应用配置
│   └── uni.scss                  # 全局样式变量
├── package.json
└── vite.config.js
```

### 4.2 后端项目结构 (Spring Boot)

```text
backend/
├── src/main/java/com/hyai/
│   ├── HyAiApplication.java      # 启动类
│   ├── controller/               # REST 控制器
│   │   ├── UserController.java
│   │   ├── MaterialController.java
│   │   └── AssetController.java
│   ├── service/                  # 业务逻辑层
│   │   ├── UserService.java
│   │   ├── MaterialService.java
│   │   └── AssetService.java
│   ├── repository/               # 数据访问层
│   │   ├── UserRepository.java
│   │   ├── MaterialRepository.java
│   │   └── AssetRepository.java
│   ├── entity/                   # 实体类
│   │   ├── User.java
│   │   ├── Material.java
│   │   └── Asset.java
│   ├── dto/                      # 数据传输对象
│   │   └── ...
│   ├── config/                   # 配置类
│   │   ├── RedisConfig.java
│   │   └── SecurityConfig.java
│   └── common/                   # 公共类
│       ├── Result.java           # 统一返回体
│       └── Constants.java        # 常量定义
├── src/main/resources/
│   ├── application.yml           # 主配置文件
│   └── application-dev.yml       # 开发环境配置
├── pom.xml
└── README.md
```

---

## 5. 开发规范

### 5.1 前端开发规范

#### A. Vue 组件规范

```vue
<template>
  <!-- 模板代码 -->
</template>

<script setup>
// 使用 Composition API + script setup 语法
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// 状态定义
const loading = ref(false)

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
/* 样式代码，使用 scoped 避免污染 */
</style>
```

#### B. 命名规范

- **组件名**：PascalCase（如 `ToolGrid.vue`）
- **变量名**：camelCase（如 `userInfo`）
- **常量名**：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- **CSS 类名**：kebab-case（如 `.tool-item`）

#### C. 状态管理 (Pinia)

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: ''
  }),
  actions: {
    async login(params) {
      // 登录逻辑
    }
  }
})
```

### 5.2 后端开发规范

#### A. RESTful API 规范

```java
// 统一返回体
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
}
```

#### B. 数据库字段规范

- **命名**：小写下划线 (snake_case)
- **必备字段**：`id`, `created_at`, `updated_at`
- **软删除**：使用 `deleted_at` 字段

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### C. Redis 使用规范

- **Token 存储**：`user:token:{userId}`
- **AI 任务状态**：`ai:task:{taskId}`
- **配置信息**：`config:{configKey}`

---

## 6. 开发流程

### 6.1 初始化阶段

- [ ] **Step 1**: 创建 uni-app 项目 (Vue 3 + Vite)
  ```bash
  npx degit dcloudio/uni-preset-vue#vite-ts frontend
  cd frontend && npm install
  ```

- [ ] **Step 2**: 配置 pages.json，设置 Tabbar

- [ ] **Step 3**: 创建 Spring Boot 项目
  ```bash
  # 使用 Spring Initializr 创建项目
  # 依赖：Spring Web, Spring Data JPA, PostgreSQL Driver, Spring Data Redis
  ```

### 6.2 页面开发阶段

- [ ] **Step 4**: 开发首页 (index) 页面
- [ ] **Step 5**: 开发素材页 (material) 页面
- [ ] **Step 6**: 开发资产页 (assets) 页面
- [ ] **Step 7**: 开发我的页面 (me)，包含 AI 工具箱和账户管理

### 6.3 后端开发阶段

- [ ] **Step 8**: 初始化数据库表结构
- [ ] **Step 9**: 实现用户认证接口（JWT + Redis）
- [ ] **Step 10**: 实现素材管理接口
- [ ] **Step 11**: 实现资产管理接口

### 6.4 联调测试阶段

- [ ] **Step 12**: 前后端接口联调
- [ ] **Step 13**: 功能测试
- [ ] **Step 14**: 性能优化

---

## 7. 原型参考

项目原型文件位于 `archetypes/` 目录：

| 文件名 | 说明 | 推荐 |
| --- | --- | --- |
| `index-blue.html` | 蓝色主题版本，使用 Font Awesome 图标 | ⭐ 推荐 |
| `index-douyin.html` | 抖音深色风格版本 | 备选 |

### 7.1 查看原型

1. 在浏览器中打开 `archetypes/index-blue.html`
2. 需要网络连接以加载 Font Awesome CDN
3. 建议使用浏览器开发者工具的移动端模式查看

---

## 8. Cursor AI 开发指令

### 8.1 代码生成指令

当使用 Cursor AI 辅助开发时，请遵循以下指令格式：

```
请根据以下要求生成代码：
1. 技术栈：[uni-app / Vue 3 / Spring Boot]
2. 功能：[具体功能描述]
3. 参考原型：archetypes/index-blue.html
4. 遵循 instructions.md 中的开发规范
```

### 8.2 常用指令示例

#### 生成页面组件
```
请生成「我的」页面的 Vue 组件，包含：
1. AI 工具箱（13个工具，Grid 布局）
2. 账户管理（7个选项，List 布局）
3. 使用 Font Awesome 图标
4. 遵循蓝色主题配色
```

#### 生成 API 接口
```
请生成素材管理的 Spring Boot 接口，包含：
1. 素材列表查询（分页、分类筛选）
2. 素材详情查询
3. 素材上传
4. 遵循 RESTful 规范和统一返回体
```

---

## 9. 注意事项

1. **跨端兼容**：开发时需考虑 H5、小程序、App 的兼容性
2. **性能优化**：图片懒加载、组件按需加载、接口缓存
3. **安全性**：JWT Token 验证、接口鉴权、敏感数据加密
4. **用户体验**：加载状态、错误提示、空状态展示

---

## 10. 相关文档

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Redis 官方文档](https://redis.io/documentation)
- [Font Awesome 图标库](https://fontawesome.com/icons)

---

**文档版本**：v1.0  
**更新日期**：2026-02-02  
**维护人员**：项目组
