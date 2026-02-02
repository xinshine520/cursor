# 修复 Pinia 模块找不到的问题

## 问题

前端开发服务器启动时报错：
```
Cannot find module 'pinia\dist\pinia.mjs'
```

## 原因

官方 uni-app 模板的 `package.json` 中没有包含 Pinia，但我们的代码中使用了 Pinia 进行状态管理。

## 解决方案

已在 `package.json` 的 `dependencies` 中添加 Pinia：

```json
"pinia": "^2.1.7"
```

## 执行步骤

1. 停止当前运行的开发服务器（Ctrl+C）

2. 安装依赖：
   ```powershell
   cd e:\DevSample\Cursor\hy-video-app\frontend
   pnpm install
   ```

3. 重新启动开发服务器：
   ```powershell
   pnpm run dev:h5
   ```

## 验证

启动成功后应该看到：
- ✅ 没有 Pinia 模块找不到的错误
- ✅ `VITE v5.x.x ready in xxx ms`
- ✅ 可以在浏览器中访问 http://localhost:5173

## 相关文件

使用 Pinia 的文件：
- `src/main.ts` - 注册 Pinia
- `src/stores/user.ts` - 用户状态管理
- `src/pages/me/index.vue` - 使用用户状态
- `src/pages/login/index.vue` - 登录功能
- `src/pages/register/index.vue` - 注册功能
- `src/pages/settings/index.vue` - 账号设置
