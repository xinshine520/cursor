# 前端使用 Mock 数据模式

## 概述

前端已切换为 **Mock 数据模式**，不再调用后端 API，所有数据都由前端模拟生成。

## 功能说明

### ✅ 已启用 Mock 功能

- ✅ 登录/注册
- ✅ 退出登录
- ✅ 获取用户信息
- ✅ 更新用户信息
- ✅ 修改密码

### 📋 Mock 用户数据

#### 管理员账号
- **用户名**: `admin`
- **密码**: `111111`
- **昵称**: 系统管理员
- **手机**: 13800138000
- **邮箱**: admin@hyai.com

#### 普通用户 1
- **用户名**: `user001`
- **密码**: `123456`
- **昵称**: 张三
- **手机**: 13800138001
- **邮箱**: zhangsan@example.com

#### 普通用户 2
- **用户名**: `user002`
- **密码**: `123456`
- **昵称**: 李四
- **手机**: 13800138002
- **邮箱**: lisi@example.com

## 测试步骤

### 1. 启动前端（无需后端）

```powershell
cd e:\DevSample\Cursor\hy-video-app\frontend
pnpm run dev:h5
```

### 2. 测试登录

1. 访问: http://localhost:5173
2. 点击"我的" → "登录/注册"
3. 输入账号:
   - 用户名: `admin`
   - 密码: `111111`
4. 点击"登录"
5. 应该看到:
   - ✅ 登录成功提示
   - ✅ 自动跳转到首页
   - ✅ "我的"页面显示用户信息

### 3. 测试其他功能

- **查看用户信息**: 进入"我的"页面
- **账号设置**: 点击"账号设置"，可以修改昵称、邮箱等
- **修改密码**: 在设置页点击"修改密码"
- **退出登录**: 点击"退出登录"按钮

## 实现细节

### 文件结构

```
frontend/src/api/
├── mock.ts          # Mock 数据服务（新增）
├── auth.ts          # 登录/注册 API（已修改为使用 Mock）
├── user.ts          # 用户信息 API（已修改为使用 Mock）
└── request.ts       # 请求工具（暂时未使用）
```

### Mock 服务特性

1. **模拟网络延迟**: 300ms - 800ms
2. **数据验证**: 用户名/密码验证
3. **错误处理**: 模拟各种错误场景
4. **Token 生成**: 自动生成 Mock Token
5. **数据持久化**: 使用 uni.getStorageSync/setStorageSync

### Mock API 响应格式

```typescript
{
  code: 200,        // 状态码: 200 成功, 400 失败, 401 未授权
  message: 'success', // 消息
  data: { ... }     // 数据
}
```

## 切换回真实 API（可选）

如需切换回调用后端 API，修改以下文件：

### 1. `auth.ts`

```typescript
// 改为
import { post } from './request'

export function login(data: LoginRequest) {
  return post<LoginResponse>('/auth/login', data)
}
```

### 2. `user.ts`

```typescript
// 改为
import { get, put } from './request'

export function getUserInfo() {
  return get<UserInfo>('/users/info')
}
```

## 优点

✅ **独立开发**: 前端不依赖后端，可以独立开发和测试
✅ **快速迭代**: 不需要启动后端，前端开发更快
✅ **稳定测试**: Mock 数据稳定，不受后端影响
✅ **离线开发**: 无需网络连接
✅ **演示友好**: 可以用于产品演示

## 注意事项

⚠️ **Mock 模式仅用于开发和测试**
⚠️ **生产环境必须切换回真实 API**
⚠️ **Mock 数据不会真正保存到数据库**
⚠️ **刷新页面后注册的新用户会丢失**

## 当前状态

🟢 **前端已完全使用 Mock 数据**
🔴 **后端 API 未被调用**

## 测试清单

- [ ] 管理员登录 (admin / 111111)
- [ ] 普通用户登录 (user001 / 123456)
- [ ] 错误密码登录（应该提示错误）
- [ ] 查看用户信息
- [ ] 修改用户信息
- [ ] 修改密码
- [ ] 退出登录
- [ ] 重新登录
