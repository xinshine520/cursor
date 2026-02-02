# 数据库初始化说明

## 自动初始化

应用启动时会自动检查数据库：
- 如果 `users` 表为空，自动创建 10 条测试用户记录
- 如果已有数据，跳过初始化

## 测试账号

### 管理员账号
- **用户名**: `admin`
- **密码**: `111111`
- **昵称**: 系统管理员
- **邮箱**: admin@hyai.com
- **手机**: 13800138000

### 普通用户账号 (共9个)
- **用户名**: `user001` ~ `user009`
- **密码**: `123456`
- **昵称**: 张三、李四、王五、赵六、孙七、周八、吴九、郑十、陈十一
- **邮箱**: zhangsan@example.com ~ chenshiyi@example.com
- **手机**: 13800138001 ~ 13800138009

## 初始化逻辑

实现在 `com.hyai.config.DataInitializer` 类中：

```java
@Component
public class DataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // 检查数据库是否为空
        if (userRepository.count() > 0) {
            return; // 跳过初始化
        }
        
        // 创建测试用户
        // 密码使用 BCrypt 加密
        userRepository.saveAll(users);
    }
}
```

## 密码加密

所有密码使用 **BCrypt** 加密算法：
- 原始密码: `111111` / `123456`
- 存储时自动加密
- 登录时自动验证

## 启动应用

```powershell
cd e:\DevSample\Cursor\hy-video-app\backend
mvn spring-boot:run
```

启动日志会显示：
```
开始初始化用户数据...
用户数据初始化完成！共创建 10 条记录
管理员账号 - 用户名: admin, 密码: 111111
测试账号 - 用户名: user001~user009, 密码: 123456
```

## 测试登录

### 使用前端测试

1. 访问前端: http://localhost:5173
2. 点击"我的" -> "登录/注册"
3. 输入管理员账号:
   - 用户名: `admin`
   - 密码: `111111`
4. 点击"登录"

### 使用 API 测试

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "111111"
  }'
```

## 重置数据

如需重新初始化数据：

1. 删除所有用户:
   ```sql
   DELETE FROM users;
   ```

2. 重启应用，会自动重新创建测试数据

## 注意事项

⚠️ **生产环境**：
- 删除或禁用 `DataInitializer`
- 使用数据库迁移工具（如 Flyway/Liquibase）
- 不要使用简单密码
- 不要使用明文密码
