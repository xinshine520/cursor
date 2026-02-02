# 微信小程序发布优化指南

## 📦 微信小程序包大小限制

### 官方限制
- **主包大小**：≤ 2MB
- **分包大小**：单个分包 ≤ 2MB
- **总包大小**：主包 + 所有分包 ≤ 20MB
- **单次上传**：≤ 20MB

### 包大小检查
```bash
# 构建后检查包大小
cd e:\DevSample\Cursor\hy-video-app\frontend
pnpm run build:mp-weixin

# 查看构建输出大小
du -sh dist/build/mp-weixin
```

## 🎯 优化策略总览

### 优先级排序
1. ✅ **代码分包**（必须）- 突破 2MB 限制
2. ✅ **图片优化**（必须）- 最大的优化空间
3. ✅ **代码压缩**（推荐）- Tree-shaking, 混淆
4. ✅ **依赖优化**（推荐）- 按需加载
5. ✅ **CDN 外链**（可选）- 静态资源外置

## 1️⃣ 代码分包配置

### 方案一：页面分包（推荐）
修改 `src/pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/material",
      "name": "material",
      "pages": [
        {
          "path": "index",
          "style": { "navigationBarTitleText": "素材" }
        }
      ]
    },
    {
      "root": "pages-sub/assets",
      "name": "assets",
      "pages": [
        {
          "path": "index",
          "style": { "navigationBarTitleText": "资产" }
        }
      ]
    },
    {
      "root": "pages-sub/user",
      "name": "user",
      "pages": [
        {
          "path": "me/index",
          "style": { "navigationBarTitleText": "我的" }
        },
        {
          "path": "login/index",
          "style": { "navigationBarTitleText": "登录" }
        },
        {
          "path": "register/index",
          "style": { "navigationBarTitleText": "注册" }
        },
        {
          "path": "settings/index",
          "style": { "navigationBarTitleText": "设置" }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["material", "assets"]
    }
  }
}
```

### 目录结构调整
```
src/
├── pages/                    # 主包页面
│   └── index/
│       └── index.vue
├── pages-sub/                # 分包目录
│   ├── material/            # 素材分包
│   │   └── index.vue
│   ├── assets/              # 资产分包
│   │   └── index.vue
│   └── user/                # 用户分包
│       ├── me/
│       ├── login/
│       ├── register/
│       └── settings/
├── components/              # 公共组件（主包）
├── api/                     # API（主包）
└── stores/                  # Store（主包）
```

### 预加载优化
```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["material", "assets"]
    }
  }
}
```

## 2️⃣ 图片优化（最重要）

### 当前问题
```
src/static/logo.png: 5467 lines (可能几百KB)
```

### 优化方案

#### A. 移除大图标，使用 Emoji 或 Icon Font
**当前状态**：已使用 Emoji 作为缩略图 ✅

```vue
<!-- 素材卡片 - 使用 Emoji -->
<view class="thumbnail">
  <text class="emoji">{{ item.thumbnail }}</text>
</view>
```

#### B. 压缩和优化图标
```bash
# 安装图片压缩工具
npm install -D imagemin imagemin-pngquant imagemin-mozjpeg imagemin-svgo

# 创建压缩脚本
```

**compress-images.js**：
```javascript
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminSvgo = require('imagemin-svgo')

;(async () => {
  await imagemin(['src/static/*.{jpg,png,svg}'], {
    destination: 'src/static-optimized',
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] }),
      imageminMozjpeg({ quality: 70 }),
      imageminSvgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false }
        ]
      })
    ]
  })
  console.log('Images optimized!')
})()
```

#### C. 使用 Icon Font 代替图片
**推荐使用 uni-ui 内置图标**：

```bash
# 已安装
pnpm add @dcloudio/uni-ui
```

```vue
<!-- 使用 uni-icons -->
<template>
  <uni-icons type="home" size="20" />
</template>
```

#### D. 图片 CDN 外链
```vue
<!-- 不使用本地图片 -->
<image src="https://cdn.example.com/logo.png" />

<!-- 使用占位符 -->
<image 
  src="data:image/svg+xml,<svg>...</svg>"
  lazy-load
/>
```

### TabBar 图标优化
**当前**：SVG 图标（较小，已优化）✅

```json
{
  "tabBar": {
    "list": [
      {
        "iconPath": "static/home.svg",
        "selectedIconPath": "static/home-active.svg"
      }
    ]
  }
}
```

**进一步优化**：压缩 SVG
```bash
# 使用 SVGO 压缩
npx svgo src/static/*.svg
```

## 3️⃣ 代码压缩和优化

### Vite 构建优化
修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖单独打包
          'vendor': ['vue', 'pinia'],
          'utils': ['./src/api/mockData.ts']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除特定函数
      }
    },
    
    // 代码分割阈值
    chunkSizeWarningLimit: 500,
    
    // 禁用 source map（生产环境）
    sourcemap: false
  },
  
  // CSS 压缩
  css: {
    postcss: {
      plugins: [
        require('cssnano')({
          preset: 'default',
        })
      ]
    }
  }
})
```

### Tree Shaking 优化
```typescript
// 按需导入
// ❌ 不推荐
import * as utils from './utils'

// ✅ 推荐
import { formatFileSize, formatDuration } from './utils'
```

## 4️⃣ 依赖优化

### 分析包大小
```bash
# 安装分析工具
pnpm add -D rollup-plugin-visualizer

# 构建并生成报告
pnpm run build:mp-weixin
```

**vite.config.ts**：
```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    uni(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### 按需加载依赖
```typescript
// ❌ 不推荐：全量导入
import { createPinia } from 'pinia'

// ✅ 推荐：只导入需要的
// Pinia 已经很轻量，保持现状即可
```

### 移除不必要的依赖
检查 `package.json`：

```json
{
  "dependencies": {
    "vue": "^3.4.21",           // 必需
    "pinia": "^2.1.7"           // 必需
  },
  "devDependencies": {
    // 开发依赖不会打包，可以保留
  }
}
```

## 5️⃣ Mock 数据优化

### 当前问题
`mockData.ts` 文件很大（1634 lines），包含 122 条 Mock 数据。

### 优化方案

#### A. 懒加载 Mock 数据
**拆分 Mock 数据**：

```typescript
// src/api/mock/materials.ts
export const officialMaterials = [/* ... */]

// src/api/mock/assets.ts
export const creationAssets = [/* ... */]

// 按需加载
async function loadOfficialMaterials() {
  const { officialMaterials } = await import('./mock/materials')
  return officialMaterials
}
```

#### B. 生产环境移除 Mock 数据
**环境判断**：

```typescript
// src/api/auth.ts
import { mockLogin } from './mock'

export async function login(data: LoginRequest) {
  // 生产环境使用真实 API
  if (import.meta.env.PROD) {
    return post<LoginResponse>('/auth/login', data)
  }
  
  // 开发环境使用 Mock
  const response = await mockLogin(data)
  return mockResponse(response)
}
```

#### C. 减少 Mock 数据数量
```typescript
// 只保留少量测试数据（开发环境）
export const officialMaterials: Material[] = 
  import.meta.env.PROD 
    ? [] 
    : [/* 5条测试数据 */]
```

## 6️⃣ 分包加载策略

### manifest.json 配置
```json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    },
    "setting": {
      "urlCheck": false,
      "minified": true,
      "postcss": true
    },
    "usingComponents": true
  }
}
```

### 独立分包（不依赖主包）
```json
{
  "subPackages": [
    {
      "root": "pages-sub/marketing",
      "name": "marketing",
      "independent": true,  // 独立分包
      "pages": [
        { "path": "activity" }
      ]
    }
  ]
}
```

## 7️⃣ 代码优化技巧

### A. 移除 console.log
```typescript
// vite.config.ts
terserOptions: {
  compress: {
    drop_console: true
  }
}
```

### B. 压缩注释和空格
自动处理（Vite 内置）

### C. 使用短变量名
```typescript
// Terser 会自动混淆变量名
// 无需手动优化
```

### D. 组件懒加载
```vue
<script setup>
// ❌ 不推荐
import HeavyComponent from './HeavyComponent.vue'

// ✅ 推荐
const HeavyComponent = defineAsyncComponent(() => 
  import('./HeavyComponent.vue')
)
</script>
```

## 8️⃣ 资源外链（CDN）

### 静态资源使用 CDN
```vue
<!-- 不要把大文件放在 static 目录 -->
<image src="https://cdn.example.com/image.png" />

<!-- 或使用小程序云存储 -->
<image src="cloud://xxx.png" />
```

### 字体文件外链
```css
/* 不要在 static 中放字体文件 */
@font-face {
  font-family: 'MyFont';
  src: url('https://cdn.example.com/font.woff2');
}
```

## 📋 优化检查清单

### 必做项（突破 2MB 限制）
- [ ] 配置分包（pages.json）
- [ ] 移除或压缩大图片
- [ ] 使用 Emoji/Icon Font 替代图标
- [ ] 删除不必要的 Mock 数据
- [ ] 开启代码压缩

### 推荐项（进一步优化）
- [ ] 配置 Tree Shaking
- [ ] 移除 console.log
- [ ] 按需加载组件
- [ ] 分析包大小
- [ ] 配置预加载

### 可选项（极致优化）
- [ ] 资源 CDN 外链
- [ ] 独立分包
- [ ] 懒加载 Mock 数据
- [ ] 云存储替代本地资源

## 🛠️ 实施步骤

### Step 1: 备份当前代码
```bash
git add .
git commit -m "backup before optimization"
```

### Step 2: 配置分包
1. 修改 `pages.json`
2. 创建 `pages-sub/` 目录
3. 移动页面文件
4. 更新路由引用

### Step 3: 图片优化
1. 压缩现有图片
2. 移除不必要的图片
3. 使用 Icon Font

### Step 4: 构建配置
1. 更新 `vite.config.ts`
2. 添加压缩选项
3. 配置代码分割

### Step 5: 测试构建
```bash
pnpm run build:mp-weixin
```

### Step 6: 检查包大小
```bash
du -sh dist/build/mp-weixin
```

## 📊 预期效果

### 优化前（估算）
```
主包: 2.5MB (超限 ❌)
├── 代码: 500KB
├── 图片: 1.8MB
└── Mock数据: 200KB
```

### 优化后（目标）
```
主包: 800KB ✅
├── pages/index: 400KB
├── components: 200KB
└── api/stores: 200KB

分包1 (material): 400KB ✅
分包2 (assets): 400KB ✅
分包3 (user): 300KB ✅

总计: 1.9MB < 2MB ✅
```

## 🔍 调试和检查

### 微信开发者工具
1. 打开项目详情
2. 查看"代码包大小"
3. 查看"分包加载情况"

### 命令行检查
```bash
# 主包大小
du -sh dist/build/mp-weixin

# 分包大小
du -sh dist/build/mp-weixin/pages-sub/*
```

## 🚨 常见问题

### Q1: 分包后 TabBar 不显示？
A: TabBar 页面必须在主包中。

### Q2: 分包页面跳转失败？
A: 使用完整路径：`/pages-sub/material/index`

### Q3: 图片显示不出来？
A: 检查路径，分包中的图片路径要相对于分包根目录。

### Q4: Mock 数据太大怎么办？
A: 生产环境移除 Mock 数据，使用真实 API。

## 📚 参考资源

- [微信小程序分包加载](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)
- [uni-app 分包配置](https://uniapp.dcloud.net.cn/collocation/pages.html#subpackages)
- [Vite 构建优化](https://vitejs.dev/guide/build.html)

## ✅ 总结

通过以上优化，可以将包大小控制在 2MB 以内：

1. **分包**：突破单包 2MB 限制
2. **图片优化**：最大的优化空间（使用 Emoji/Icon Font）
3. **代码压缩**：减少 30-50% 体积
4. **Mock 数据**：生产环境移除
5. **依赖优化**：按需加载

**优先级**：分包 > 图片优化 > 代码压缩 > 其他优化

现在可以开始优化了！🚀
