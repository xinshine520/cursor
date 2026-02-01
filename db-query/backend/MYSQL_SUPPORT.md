# MySQL 支持说明

## 概述

数据库查询工具现在支持 PostgreSQL 和 MySQL 两种数据库类型。

## 功能特性

1. **连接管理**：支持 PostgreSQL 和 MySQL 连接 URL
2. **元数据提取**：自动提取表、列、主键、外键等信息
3. **SQL 查询执行**：支持 SELECT 查询，自动添加 LIMIT 限制
4. **自然语言查询**：根据数据库类型生成对应的 SQL 语法

## 连接 URL 格式

### PostgreSQL
```
postgresql://user:password@host:port/database
postgres://user:password@host:port/database
```

### MySQL
```
mysql://user:password@host:port/database
mysql+pymysql://user:password@host:port/database?charset=utf8mb4
```

## 数据库迁移

### 自动迁移

应用启动时会自动检测并添加 `database_type` 列（如果不存在）。所有现有连接会被设置为 `postgresql` 类型。

### 手动迁移

如果需要手动运行迁移，可以使用以下命令：

```bash
cd db-query/backend
uv run python scripts/migrate.py
```

### 手动 SQL 迁移（可选）

如果需要手动更新现有连接的数据库类型：

```sql
-- 对于现有 PostgreSQL 连接（默认）
UPDATE connections SET database_type = 'postgresql' WHERE database_type IS NULL OR database_type = '';

-- 对于 MySQL 连接（需要根据实际情况调整）
-- 注意：由于连接 URL 是加密的，无法直接通过 SQL 判断类型
-- 建议通过应用界面重新创建 MySQL 连接
```

## 使用示例

### 创建 MySQL 连接

```python
from db_query.models.connection import ConnectionCreate

connection = ConnectionCreate(
    name="MySQL Production",
    connection_url="mysql://user:password@localhost:3306/mydb"
)
```

### 创建 PostgreSQL 连接

```python
connection = ConnectionCreate(
    name="PostgreSQL Production",
    connection_url="postgresql://user:password@localhost:5432/mydb"
)
```

## 技术实现

### 依赖项
- `aiomysql>=0.2.0` - MySQL 异步连接库
- `pymysql>=1.1.0` - MySQL 驱动
- `sqlglot>=23.0.0` - SQL 解析和转换（支持 MySQL dialect）

### 服务层
- `MySQLMetadataService` - MySQL 元数据提取
- `QueryService` - 根据数据库类型选择执行方法
- `NLQService` - 根据数据库类型生成对应 SQL

### 数据库 Schema

`connections` 表新增字段：
- `database_type` TEXT NOT NULL DEFAULT 'postgresql'

## 注意事项

1. MySQL 连接 URL 必须包含数据库名称
2. MySQL 默认使用 `utf8mb4` 字符集
3. SQL 验证和转换会根据数据库类型使用对应的 dialect
4. 自然语言查询会根据数据库类型生成对应的 SQL 语法
