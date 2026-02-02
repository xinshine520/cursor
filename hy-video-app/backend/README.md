# 华玥AI 后端项目

## 项目说明

基于 Spring Boot 3.4.x + PostgreSQL + Redis 的后端服务。

## 技术栈

- Spring Boot 3.4.x
- Spring Data JPA
- PostgreSQL 16.x
- Redis 7.x
- Spring Security
- JWT
- Lombok
- SpringDoc (Swagger)

## 环境要求

- JDK 21
- Maven 3.9+
- PostgreSQL 16.x+
- Redis 7.x+

## 配置

1. 创建数据库：
```sql
CREATE DATABASE hyai_db;
```

2. 修改 `application.yml` 中的数据库和 Redis 配置

3. 运行项目：
```bash
mvn spring-boot:run
```

## API 文档

启动项目后访问：
- Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
- API Docs: http://localhost:8080/api/v1/api-docs
