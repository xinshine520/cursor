# 修复 CORS 跨域问题

## 问题

前端访问后端 API 时报错：
```
Access to XMLHttpRequest at 'http://localhost:8080/auth/login' from origin 
'http://localhost:5173' has been blocked by CORS policy: Response to preflight 
request doesn't pass access control check: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

## 原因

1. **CORS 跨域**: 前端(http://localhost:5173)和后端(http://localhost:8080)端口不同，触发浏览器的同源策略
2. **API 路径错误**: 前端请求 `/auth/login`，但后端实际路径是 `/api/v1/auth/login`

## 解决方案

### 1. 后端添加 CORS 配置

创建了 `CorsConfig.java`：

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许前端域名
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://127.0.0.1:5173");
        
        // 允许所有请求头和方法
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // 允许携带 Cookie
        config.setAllowCredentials(true);
        
        return new CorsFilter(source);
    }
}
```

### 2. 前端修复 API 路径

修改 `frontend/src/api/request.ts`：

```typescript
// 修改前
const BASE_URL = 'http://localhost:8080'

// 修改后
const BASE_URL = 'http://localhost:8080/api/v1'
```

## 重启应用

### 重启后端（必须）

```powershell
# 停止当前运行的后端（Ctrl+C）
cd e:\DevSample\Cursor\hy-video-app\backend
mvn spring-boot:run
```

### 前端自动生效

前端会自动热重载，刷新浏览器即可。

## 验证

1. 打开浏览器控制台（F12）
2. 访问前端: http://localhost:5173
3. 点击"我的" -> "登录/注册"
4. 输入测试账号登录
5. 应该看到：
   - ✅ 没有 CORS 错误
   - ✅ 请求成功
   - ✅ 登录成功提示

## 测试账号

- **管理员**: admin / 111111
- **普通用户**: user001 / 123456

## 相关文件

- `backend/src/main/java/com/hyai/config/CorsConfig.java` - CORS 配置
- `frontend/src/api/request.ts` - API 请求配置
- `backend/src/main/resources/application.yml` - 后端路径配置 (`context-path: /api/v1`)

## CORS 工作原理

1. 浏览器发起 **预检请求**（OPTIONS）
2. 后端返回允许的域名、方法、请求头
3. 浏览器检查通过后，发起真实请求
4. 后端处理请求并返回响应
