# 微信小程序快速优化指南

## 🚀 5分钟快速优化

### 1. 立即生效的优化（无需改代码）

#### ✅ 移除大图片
```bash
# 检查大文件
find src/static -type f -size +100k

# 如果 logo.png 很大，删除或压缩它
# 已经在用 Emoji 图标了，logo.png 可以移除
```

#### ✅ 更新 vite.config.ts
```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500
  }
})
```

#### ✅ 更新 manifest.json
```json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    },
    "setting": {
      "minified": true,
      "postcss": true
    }
  }
}
```

### 2. 配置分包（20分钟）

#### pages.json 配置
```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "华玥AI"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/material",
      "pages": [
        { "path": "index" }
      ]
    },
    {
      "root": "pages-sub/assets",
      "pages": [
        { "path": "index" }
      ]
    },
    {
      "root": "pages-sub/user",
      "pages": [
        { "path": "me/index" },
        { "path": "login/index" },
        { "path": "register/index" },
        { "path": "settings/index" }
      ]
    }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages-sub/material/index", "text": "素材" },
      { "pagePath": "pages-sub/assets/index", "text": "资产" },
      { "pagePath": "pages-sub/user/me/index", "text": "我的" }
    ]
  }
}
```

**注意**：TabBar 页面不能放在分包中！需要调整策略。

### 3. 移除 Mock 数据（生产环境）

#### 方案 A：环境判断
```typescript
// src/api/auth.ts
export async function login(data: LoginRequest) {
  if (import.meta.env.PROD) {
    // 生产环境：调用真实 API
    return post<LoginResponse>('/auth/login', data)
  }
  
  // 开发环境：使用 Mock
  const response = await mockLogin(data)
  return mockResponse(response)
}
```

#### 方案 B：删除 Mock 文件
```bash
# 生产构建前删除
rm src/api/mock*.ts
```

## 📊 包大小检查

### 构建并检查
```bash
# 构建微信小程序
pnpm run build:mp-weixin

# 检查主包大小
du -sh dist/build/mp-weixin

# 检查分包大小
du -sh dist/build/mp-weixin/pages-sub/*
```

### 目标大小
- 主包：< 2MB
- 每个分包：< 2MB
- 总包：< 20MB

## ⚡ 效果对比

### 优化前
```
dist/build/mp-weixin/
├── app.js (500KB)
├── pages/ (800KB)
├── static/ (1.5MB)  ← 主要问题
└── vendor/ (200KB)
总计: 3MB ❌ 超过 2MB 限制
```

### 优化后
```
dist/build/mp-weixin/
├── app.js (300KB)        ← 压缩后
├── pages/ (400KB)        ← 只保留首页
├── static/ (100KB)       ← 移除大图
├── pages-sub/
│   ├── material/ (400KB)
│   ├── assets/ (400KB)
│   └── user/ (300KB)
└── vendor/ (200KB)
主包: 1MB ✅
总计: 2.2MB ✅
```

## 🎯 最关键的3个优化

### 1. 移除 logo.png（如果很大）
```bash
# 检查文件大小
ls -lh src/static/logo.png

# 如果 > 100KB，考虑：
# - 删除（使用文字 Logo）
# - 压缩到 < 50KB
# - 使用 CDN 外链
```

### 2. 删除 Mock 数据（生产环境）
```typescript
// 122 条 Mock 数据 ≈ 200-300KB
// 生产环境直接删除或条件排除
```

### 3. 开启代码压缩
```typescript
// vite.config.ts
build: {
  minify: 'terser',  // 压缩 30-50%
  terserOptions: {
    compress: {
      drop_console: true
    }
  }
}
```

## 📋 优化清单

### Phase 1: 立即执行（5分钟）
- [ ] 检查并移除大图片
- [ ] 更新 vite.config.ts（代码压缩）
- [ ] 更新 manifest.json（小程序优化）
- [ ] 重新构建测试

### Phase 2: 分包配置（可选）
- [ ] 修改 pages.json
- [ ] 移动页面文件到 pages-sub
- [ ] 测试分包加载

### Phase 3: Mock 数据处理（可选）
- [ ] 添加环境判断
- [ ] 生产环境移除 Mock
- [ ] 使用真实 API

## 🚨 注意事项

### TabBar 页面限制
TabBar 中的页面**必须**在主包中，不能放分包！

**错误示例**：
```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages-sub/material/index" }  // ❌ 错误
    ]
  }
}
```

**正确示例**：
```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages/material/index" }  // ✅ 正确
    ]
  }
}
```

### 分包策略调整
由于 TabBar 限制，建议：
- **主包**：首页、素材、资产、我的（TabBar 页面）
- **分包1**：登录、注册、设置（用户相关）
- **分包2**：详情页、编辑页（次要页面）

## 🎁 推荐配置（开箱即用）

### vite.config.ts（完整版）
```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  build: {
    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    // 禁用 source map
    sourcemap: false,
    
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia']
        }
      }
    },
    
    // 警告阈值
    chunkSizeWarningLimit: 500,
    
    // 输出目录
    outDir: 'dist/build/mp-weixin',
    assetsDir: 'static'
  },
  
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
```

## 📞 帮助

遇到问题？
1. 查看完整指南：`WECHAT-MINIPROGRAM-OPTIMIZATION.md`
2. 检查微信开发者工具的"代码包大小"面板
3. 使用 `rollup-plugin-visualizer` 分析包内容

## ✅ 成功标准

- ✅ 主包 < 2MB
- ✅ 分包正常加载
- ✅ 图片显示正常
- ✅ 功能运行正常

完成这些优化后，包大小应该能控制在限制范围内！🎉
