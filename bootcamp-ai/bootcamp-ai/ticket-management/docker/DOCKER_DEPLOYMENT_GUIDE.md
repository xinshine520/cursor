# Ticket Management Docker 部署指南

## 目录

1. [概述](#概述)
2. [系统要求](#系统要求)
3. [快速开始](#快速开始)
4. [详细配置](#详细配置)
5. [部署步骤](#部署步骤)
6. [服务管理](#服务管理)
7. [监控与日志](#监控与日志)
8. [备份与恢复](#备份与恢复)
9. [故障排除](#故障排除)
10. [安全配置](#安全配置)
11. [性能优化](#性能优化)
12. [常见问题](#常见问题)

## 概述

本文档提供了使用 Docker 部署 Ticket Management 应用的完整指南。该部署方案包括：

- **前端**: React + TypeScript 应用，通过 Nginx 提供静态文件服务
- **后端**: FastAPI + Python 应用
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **反向代理**: Nginx

所有服务通过 Docker Compose 进行编排，支持一键部署和管理。

## 系统要求

### 硬件要求

- **CPU**: 2 核心以上
- **内存**: 4GB 以上
- **存储**: 20GB 可用空间
- **网络**: 稳定的互联网连接

### 软件要求

- **操作系统**: 
  - Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)
  - macOS 10.15+
  - Windows 10/11 (支持 WSL2)
  
- **必需软件**:
  - Docker 20.10+
  - Docker Compose 2.0+

### 安装 Docker

#### Linux (Ubuntu)

```bash
# 更新包索引
sudo apt-get update

# 安装必要的包
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
```

#### macOS

1. 下载 [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/install/)
2. 安装并启动 Docker Desktop
3. 确保 Docker 已在终端中可用

#### Windows

1. 下载 [Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/install/)
2. 安装并启动 Docker Desktop
3. 确保已启用 WSL2 支持

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ticket-management
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp docker/.env.example docker/.env

# 编辑环境变量文件
nano docker/.env
```

### 3. 启动服务

```bash
# Linux/macOS
cd docker
chmod +x scripts/deploy.sh
./scripts/deploy.sh start

# Windows
cd docker
scripts\deploy.bat start
```

### 4. 验证部署

- 前端: http://localhost
- 后端 API: http://localhost/api/v1
- API 文档: http://localhost/api/v1/docs

## 详细配置

### 环境变量配置

编辑 `docker/.env` 文件，配置以下关键参数：

```bash
# 数据库配置
POSTGRES_DB=ticket_management
POSTGRES_USER=ticket_user
POSTGRES_PASSWORD=your_secure_password_here

# 应用配置
ENVIRONMENT=production
DEBUG=false

# 安全配置
SECRET_KEY=your_very_secure_secret_key_here_at_least_32_characters
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# CORS 配置
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/TLS 配置（可选）

如需启用 HTTPS，请执行以下步骤：

1. 获取 SSL 证书（可以使用 Let's Encrypt 免费证书）
2. 将证书文件放置在 `docker/nginx/ssl/` 目录下
3. 编辑 `docker/nginx/nginx.conf`，取消 HTTPS 服务器配置的注释
4. 更新 `docker/.env` 中的 SSL 证书路径

## 部署步骤

### 1. 准备工作

```bash
# 创建项目目录
mkdir -p /opt/ticket-management
cd /opt/ticket-management

# 克隆代码
git clone <repository-url> .

# 进入 Docker 目录
cd docker
```

### 2. 配置环境

```bash
# 复制并编辑环境变量
cp .env.example .env
nano .env
```

### 3. 启动服务

```bash
# 使用部署脚本
./scripts/deploy.sh start

# 或直接使用 Docker Compose
docker-compose -f docker-compose.prod.yml -p ticket-management up -d
```

### 4. 初始化数据库

```bash
# 等待数据库启动
sleep 30

# 运行数据库迁移
docker-compose -f docker-compose.prod.yml -p ticket-management exec backend alembic upgrade head
```

### 5. 验证部署

```bash
# 检查服务状态
./scripts/deploy.sh status

# 查看服务日志
./scripts/deploy.sh logs
```

## 服务管理

### 启动服务

```bash
# 启动所有服务
./scripts/deploy.sh start

# 启动特定服务
docker-compose -f docker-compose.prod.yml -p ticket-management up -d postgres
```

### 停止服务

```bash
# 停止所有服务
./scripts/deploy.sh stop

# 停止特定服务
docker-compose -f docker-compose.prod.yml -p ticket-management stop backend
```

### 重启服务

```bash
# 重启所有服务
./scripts/deploy.sh restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml -p ticket-management restart backend
```

### 查看日志

```bash
# 查看所有服务日志
./scripts/deploy.sh logs

# 查看特定服务日志
./scripts/deploy.sh logs backend

# 实时查看日志
docker-compose -f docker-compose.prod.yml -p ticket-management logs -f backend
```

### 更新服务

```bash
# 更新服务（拉取最新代码并重新构建）
./scripts/deploy.sh update
```

## 监控与日志

### 日志管理

日志文件存储在以下位置：

- **Nginx 日志**: `logs/nginx/`
  - `access.log`: 访问日志
  - `error.log`: 错误日志

- **后端日志**: `logs/backend/`
  - `app.log`: 应用日志
  - `error.log`: 错误日志

### 健康检查

所有服务都配置了健康检查：

```bash
# 检查服务健康状态
./scripts/deploy.sh status

# 手动检查后端健康状态
curl http://localhost/api/v1/health

# 手动检查前端健康状态
curl http://localhost
```

### 监控指标

可以使用以下工具进行监控：

1. **Docker 命令**:
   ```bash
   # 查看容器资源使用情况
   docker stats
   
   # 查看容器详细信息
   docker inspect ticket-backend
   ```

2. **第三方监控工具**:
   - Prometheus + Grafana
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Datadog

## 备份与恢复

### 数据库备份

```bash
# 自动备份（使用脚本）
./scripts/deploy.sh backup

# 手动备份
docker-compose -f docker-compose.prod.yml -p ticket-management exec postgres pg_dump -U ticket_user ticket_management > backup.sql
```

### 数据库恢复

```bash
# 使用脚本恢复
./scripts/deploy.sh restore backup.sql

# 手动恢复
docker-compose -f docker-compose.prod.yml -p ticket-management exec -T postgres psql -U ticket_user -d ticket_management < backup.sql
```

### 自动备份配置

可以设置 cron 任务进行自动备份：

```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨 2 点备份任务
0 2 * * * /opt/ticket-management/docker/scripts/deploy.sh backup
```

## 故障排除

### 常见问题及解决方案

#### 1. 服务无法启动

**问题**: 服务启动失败

**解决方案**:
```bash
# 查看服务日志
./scripts/deploy.sh logs [service_name]

# 检查端口占用
netstat -tulpn | grep :8000

# 检查磁盘空间
df -h

# 重启 Docker 服务
sudo systemctl restart docker
```

#### 2. 数据库连接失败

**问题**: 后端无法连接到数据库

**解决方案**:
```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml -p ticket-management ps postgres

# 检查数据库日志
./scripts/deploy.sh logs postgres

# 手动连接数据库
docker-compose -f docker-compose.prod.yml -p ticket-management exec postgres psql -U ticket_user -d ticket_management

# 检查网络连接
docker network ls
docker network inspect ticket-management_ticket-network
```

#### 3. 前端无法访问后端 API

**问题**: 前端显示网络错误

**解决方案**:
```bash
# 检查 Nginx 配置
docker exec ticket-nginx nginx -t

# 重新加载 Nginx 配置
docker exec ticket-nginx nginx -s reload

# 检查 Nginx 日志
./scripts/deploy.sh logs nginx

# 检查后端健康状态
curl http://localhost/api/v1/health
```

#### 4. 性能问题

**问题**: 响应缓慢或超时

**解决方案**:
```bash
# 检查资源使用情况
docker stats

# 检查数据库性能
docker-compose -f docker-compose.prod.yml -p ticket-management exec postgres psql -U ticket_user -d ticket_management -c "SELECT * FROM pg_stat_activity;"

# 优化数据库
docker-compose -f docker-compose.prod.yml -p ticket-management exec postgres psql -U ticket_user -d ticket_management -c "VACUUM ANALYZE;"
```

### 调试技巧

1. **进入容器调试**:
   ```bash
   # 进入后端容器
   docker exec -it ticket-backend bash
   
   # 进入数据库容器
   docker exec -it ticket-postgres psql -U ticket_user -d ticket_management
   ```

2. **查看容器内部网络**:
   ```bash
   # 查看网络配置
   docker exec ticket-backend ip addr
   
   # 测试网络连接
   docker exec ticket-backend ping postgres
   ```

3. **实时查看日志**:
   ```bash
   # 查看多个服务日志
   docker-compose -f docker-compose.prod.yml -p ticket-management logs -f backend postgres
   ```

## 安全配置

### 基本安全措施

1. **更改默认密码**:
   - 数据库密码
   - JWT 密钥
   - 应用密钥

2. **配置防火墙**:
   ```bash
   # 只开放必要端口
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **定期更新**:
   ```bash
   # 更新系统包
   sudo apt update && sudo apt upgrade
   
   # 更新 Docker 镜像
   docker-compose -f docker-compose.prod.yml -p ticket-management pull
   ```

### 高级安全配置

1. **启用 HTTPS**:
   - 配置 SSL 证书
   - 强制 HTTPS 重定向
   - 配置 HSTS

2. **限制访问**:
   - 配置 IP 白名单
   - 限制 API 访问频率
   - 配置 WAF

3. **安全审计**:
   - 启用审计日志
   - 配置日志监控
   - 定期安全扫描

## 性能优化

### 数据库优化

1. **调整 PostgreSQL 配置**:
   ```bash
   # 编辑 postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   random_page_cost = 1.1
   effective_io_concurrency = 200
   ```

2. **创建索引**:
   ```sql
   -- 为常用查询字段创建索引
   CREATE INDEX CONCURRENTLY idx_tickets_status ON tickets(status);
   CREATE INDEX CONCURRENTLY idx_tickets_created_at ON tickets(created_at);
   ```

### 应用优化

1. **启用 Redis 缓存**:
   - 缓存频繁查询的数据
   - 缓存会话信息
   - 缓存计算结果

2. **优化 Nginx 配置**:
   ```nginx
   # 启用 gzip 压缩
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript;
   
   # 调整 worker 进程数
   worker_processes auto;
   
   # 调整连接数
   events {
       worker_connections 2048;
   }
   ```

### 监控与调优

1. **设置监控指标**:
   - CPU 使用率
   - 内存使用率
   - 磁盘 I/O
   - 网络流量
   - 响应时间

2. **性能测试**:
   ```bash
   # 使用 Apache Bench 进行压力测试
   ab -n 1000 -c 10 http://localhost/
   
   # 使用 wrk 进行更复杂的测试
   wrk -t12 -c400 -d30s http://localhost/
   ```

## 常见问题

### Q: 如何修改端口配置？

A: 编辑 `docker-compose.prod.yml` 文件中的端口映射：

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # 将主机的 8080 端口映射到容器的 80 端口
```

### Q: 如何扩展服务实例？

A: 在 `docker-compose.prod.yml` 中添加 `deploy` 配置：

```yaml
services:
  backend:
    deploy:
      replicas: 3  # 运行 3 个后端实例
```

### Q: 如何配置自定义域名？

A: 1. 编辑 `docker/nginx/nginx.conf`，修改 `server_name`：
   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```
   
   2. 配置 DNS 解析指向服务器 IP
   3. 更新 `ALLOWED_ORIGINS` 环境变量

### Q: 如何查看容器内部文件？

A: 使用 `docker exec` 命令：

```bash
# 查看容器内文件列表
docker exec ticket-backend ls -la /app

# 复制容器内文件到主机
docker cp ticket-backend:/app/config.yaml ./config.yaml
```

### Q: 如何持久化数据？

A: 数据已通过 Docker 卷自动持久化：

- PostgreSQL 数据: `postgres_data` 卷
- Redis 数据: `redis_data` 卷

如需备份到主机，可以：

```bash
# 创建备份目录
mkdir -p /opt/backups

# 备份数据库
docker exec ticket-postgres pg_dump -U ticket_user ticket_management > /opt/backups/db_backup.sql
```

### Q: 如何升级到新版本？

A: 使用部署脚本自动更新：

```bash
# 更新到最新版本
./scripts/deploy.sh update

# 或手动更新
git pull origin main
docker-compose -f docker-compose.prod.yml -p ticket-management build --no-cache
docker-compose -f docker-compose.prod.yml -p ticket-management up -d
```

---

## 联系支持

如果在部署过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查服务日志获取详细错误信息
3. 提交 Issue 到项目仓库

**注意**: 在生产环境中部署前，请务必在测试环境中验证所有配置和功能。
