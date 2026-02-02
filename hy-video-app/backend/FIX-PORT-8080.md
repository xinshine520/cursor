# 修复端口 8080 被占用问题

## 问题

后端启动失败：
```
Web server failed to start. Port 8080 was already in use.
```

## 解决方案

### 方案 1：关闭占用 8080 端口的进程（推荐）

占用端口的进程 ID：**1625896**

```powershell
# 关闭进程
taskkill /F /PID 1625896

# 然后重新运行后端
cd e:\DevSample\Cursor\hy-video-app\backend
mvn spring-boot:run
```

### 方案 2：修改后端端口（如果方案1不想关闭进程）

修改 `backend/src/main/resources/application.yml`：

```yaml
server:
  port: 8081  # 改为 8081 或其他端口
```

**注意：** 如果修改了后端端口，前端也需要相应修改！

修改 `frontend/src/api/request.ts`：

```typescript
const BASE_URL = 'http://localhost:8081'  // 改为新端口
```

## 推荐使用方案 1

使用方案 1 可以保持端口一致，不需要修改代码。

## 执行步骤

1. 关闭占用端口的进程：
   ```powershell
   taskkill /F /PID 1625896
   ```

2. 重新启动后端：
   ```powershell
   cd e:\DevSample\Cursor\hy-video-app\backend
   mvn spring-boot:run
   ```

3. 后端启动成功后应该看到：
   ```
   Started HyAiApplication in X.XXX seconds
   ```

## 验证

启动成功后访问：
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/api-docs
