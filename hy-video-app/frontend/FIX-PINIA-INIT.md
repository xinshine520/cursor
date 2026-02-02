# 修复 Pinia 初始化问题

## 问题

前端运行时报错：
```
Error: [🍍]: "getActivePinia()" was called but there was no active Pinia. 
Are you trying to use a store before calling "app.use(pinia)"?
```

## 原因

官方 uni-app 模板的 `main.ts` 中没有注册 Pinia，导致在组件中使用 `useUserStore()` 时找不到 Pinia 实例。

## 解决方案

已修复 `src/main.ts`，添加 Pinia 初始化：

```typescript
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  
  app.use(pinia);
  
  return {
    app,
  };
}
```

## 关键修改

1. ✅ 导入 `createPinia` from "pinia"
2. ✅ 在 `createApp()` 中创建 Pinia 实例
3. ✅ 使用 `app.use(pinia)` 注册到应用

## 无需操作

代码已自动修复，开发服务器会自动热重载。

## 验证

刷新浏览器后应该看到：
- ✅ 没有 Pinia 错误
- ✅ 页面正常显示
- ✅ 可以使用用户状态管理功能

## 相关文件

使用 Pinia 的页面：
- `src/pages/me/index.vue` - 显示登录状态
- `src/pages/login/index.vue` - 登录功能
- `src/pages/register/index.vue` - 注册功能
- `src/pages/settings/index.vue` - 账号设置
