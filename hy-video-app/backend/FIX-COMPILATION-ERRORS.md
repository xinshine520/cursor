# 修复编译错误指南

## 问题描述

编译时出现以下错误：
1. Lombok 注解处理器未生效，导致找不到 getter/setter 方法
2. SecurityConfig 中 jwtAuthenticationFilter 未初始化

## 已修复的内容

### 1. pom.xml
- 添加了 `maven-compiler-plugin` 配置，明确指定 Lombok 注解处理器路径
- 确保 Lombok 在编译时正确处理注解

## 解决步骤

### 方法 1：清理并重新编译（推荐）

```bash
cd backend

# 清理之前的编译文件
mvn clean

# 重新编译
mvn compile

# 如果编译成功，运行项目
mvn spring-boot:run
```

### 方法 2：如果方法 1 不行，尝试强制更新依赖

```bash
cd backend

# 清理
mvn clean

# 强制更新依赖
mvn dependency:resolve -U

# 重新编译
mvn compile

# 运行项目
mvn spring-boot:run
```

### 方法 3：如果 IDE 中仍有问题

如果使用 IntelliJ IDEA 或 Eclipse：

1. **IntelliJ IDEA**:
   - File -> Settings -> Build, Execution, Deployment -> Compiler -> Annotation Processors
   - 确保 "Enable annotation processing" 已勾选
   - File -> Invalidate Caches / Restart

2. **Eclipse**:
   - Project -> Properties -> Java Compiler -> Annotation Processing
   - 确保 "Enable annotation processing" 已勾选
   - Project -> Clean

## 验证修复

编译成功后，应该能看到：
- 没有 "找不到符号" 错误
- 没有 "未初始化" 错误
- 项目能正常启动

## 如果仍有问题

如果上述方法都不行，可能是 Lombok 版本问题。可以尝试：

1. 检查 IDE 是否安装了 Lombok 插件
2. 尝试更新 Lombok 版本到最新稳定版
3. 检查 Java 版本是否为 21（JDK 21）
