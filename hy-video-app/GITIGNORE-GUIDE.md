# .gitignore 配置说明

## 文件结构

```
.
├── .gitignore                    # 根目录配置（全局）
├── hy-video-app/
│   ├── .gitignore               # 项目配置（新增）
│   ├── frontend/
│   │   └── .gitignore           # 前端配置（已存在）
│   └── backend/
│       └── .gitignore           # 后端配置（已存在）
```

## 配置层级

### 1. 根目录 `.gitignore`（全局）
适用于整个工作区，包含所有项目通用的忽略规则。

**主要忽略：**
- ✅ IDE 配置：`.cursor/`, `.vscode/`, `.idea/`
- ✅ 操作系统文件：`.DS_Store`, `Thumbs.db`
- ✅ Node.js：`node_modules/`, `*.log`, `dist/`
- ✅ Python：`__pycache__/`, `.venv/`, `*.pyc`
- ✅ Java：`target/`, `*.class`, `*.jar`
- ✅ 环境变量：`.env`, `.env.local`
- ✅ 数据库：`*.db`, `*.sqlite`
- ✅ 日志文件：`logs/`, `*.log`
- ✅ 测试覆盖：`coverage/`, `.coverage`
- ✅ 临时文件：`*.tmp`, `.cache/`

### 2. 项目 `.gitignore`（hy-video-app）
适用于华玥AI项目的特定配置。

**主要忽略：**
- ✅ uni-app 特定：`unpackage/`, `.hbuilderx/`
- ✅ Spring Boot：`target/`, `application-*.yml`（除基础配置外）
- ✅ IDE 项目文件：`.project`, `.classpath`, `.settings/`
- ✅ 构建输出：`dist/`, `build/`
- ✅ 临时文档：生成的修复文档和完成报告（可选）

### 3. 前端 `.gitignore`（frontend）
uni-app 前端项目的特定配置。

**主要忽略：**
- ✅ Node.js 依赖：`node_modules/`
- ✅ 构建输出：`dist/`, `dist-ssr/`
- ✅ 日志文件：`*.log`
- ✅ IDE 配置：`.idea/`, `.vscode/`
- ✅ 本地配置：`*.local`

### 4. 后端 `.gitignore`（backend）
Spring Boot 后端项目的特定配置。

**主要忽略：**
- ✅ Maven 构建：`target/`
- ✅ IDE 配置：`.idea/`, `*.iml`
- ✅ 编译文件：`*.class`
- ✅ 日志文件：`*.log`

## 忽略规则说明

### Node.js / Frontend
```gitignore
# 依赖
node_modules/           # NPM/PNPM 依赖包
.pnpm-store/           # PNPM 存储目录

# 构建输出
dist/                  # 生产构建输出
dist-ssr/             # SSR 构建输出
build/                # 构建目录
.vite/                # Vite 缓存

# uni-app 特定
unpackage/            # uni-app 打包输出
.hbuilderx/           # HBuilderX 配置
```

### Java / Spring Boot
```gitignore
# Maven
target/               # Maven 构建输出
*.class              # 编译的类文件
*.jar                # JAR 包（除了 wrapper）
*.war                # WAR 包

# IDE
.idea/               # IntelliJ IDEA
*.iml                # IDEA 模块文件
.project             # Eclipse 项目
.classpath           # Eclipse 类路径
```

### 环境配置
```gitignore
# 环境变量
.env                 # 通用环境变量
.env.local           # 本地环境变量
.env.*.local         # 特定环境的本地配置

# 应用配置
application-*.yml    # 除基础配置外的 Spring 配置
!application.yml     # 保留基础配置
!application-dev.yml # 保留开发配置
```

### 数据库
```gitignore
*.db                 # SQLite 数据库
*.sqlite             # SQLite 数据库
*.sqlite3            # SQLite 数据库
*.db-journal         # SQLite 日志
```

### IDE 和编辑器
```gitignore
.cursor/             # Cursor 配置
.vscode/             # VS Code 配置
.idea/               # IntelliJ IDEA
*.suo                # Visual Studio
*.sw?                # Vim swap 文件
```

## 不应该忽略的文件

### 前端
- ✅ `package.json` - 项目依赖定义
- ✅ `package-lock.json` / `pnpm-lock.yaml` - 依赖锁定（可选）
- ✅ `vite.config.ts` - Vite 配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ `pages.json` - uni-app 页面配置
- ✅ `manifest.json` - uni-app 应用配置
- ✅ `src/` - 源代码目录

### 后端
- ✅ `pom.xml` - Maven 项目配置
- ✅ `application.yml` - 基础应用配置
- ✅ `application-dev.yml` - 开发环境配置示例
- ✅ `src/` - 源代码目录
- ✅ `.mvn/wrapper/maven-wrapper.jar` - Maven wrapper

### 文档
- ✅ `README.md` - 项目说明
- ✅ `constitution.md` - 项目宪章
- ✅ `specs/` - 规格说明
- ✅ `instructions.md` - 开发指南

## 特殊情况

### 临时修复文档（可选忽略）
如果不想提交临时生成的修复文档，可以在项目 `.gitignore` 中取消注释：
```gitignore
# FIX-*.md
# *-COMPLETE.md
```

这些文档包括：
- `FIX-COMPILATION-ERRORS.md`
- `FIX-CORS.md`
- `FIX-PORT-8080.md`
- `PHASE1-COMPLETE.md`
- `PHASE2-COMPLETE.md`
- 等等

**建议**：这些文档记录了开发过程，建议保留提交。

### 依赖锁定文件
```gitignore
# 如果团队使用不同的包管理器，可以忽略锁定文件
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
```

**建议**：保留锁定文件以确保依赖版本一致。

## 验证 .gitignore

### 检查哪些文件被忽略
```bash
git status --ignored
```

### 检查特定文件是否被忽略
```bash
git check-ignore -v node_modules
git check-ignore -v target/
```

### 强制添加被忽略的文件（如果需要）
```bash
git add -f path/to/file
```

## 清理已追踪的文件

如果某些文件已经被 Git 追踪，但现在想忽略它们：

```bash
# 从 Git 中删除，但保留本地文件
git rm --cached filename

# 删除整个目录
git rm -r --cached directory/

# 然后提交
git commit -m "Update .gitignore and remove tracked files"
```

## 常见问题

### Q: 为什么 node_modules 还在被追踪？
A: 如果之前已经提交了 `node_modules/`，需要先移除：
```bash
git rm -r --cached node_modules/
git commit -m "Remove node_modules from Git"
```

### Q: .env 文件已经被提交了怎么办？
A: 立即移除并创建示例文件：
```bash
git rm --cached .env
cp .env .env.example
# 编辑 .env.example，移除敏感信息
git add .env.example
git commit -m "Remove .env, add .env.example"
```

### Q: 想忽略某个文件，但团队其他人需要它？
A: 使用 `.git/info/exclude` 进行本地忽略：
```bash
echo "my-local-file.txt" >> .git/info/exclude
```

## 最佳实践

1. ✅ **尽早配置** - 项目开始时就配置好 `.gitignore`
2. ✅ **分层管理** - 根据项目层级配置不同的忽略规则
3. ✅ **注释清晰** - 为忽略规则添加说明注释
4. ✅ **定期审查** - 定期检查是否有新的文件需要忽略
5. ✅ **团队一致** - 确保团队成员使用相同的配置
6. ✅ **敏感信息** - 永远不要提交敏感信息（密码、密钥等）
7. ✅ **保留示例** - 为配置文件创建 `.example` 示例

## 总结

当前配置已经包含了：
- ✅ 所有标准的 Node.js 忽略规则
- ✅ 所有标准的 Java/Maven 忽略规则
- ✅ 所有标准的 IDE 配置忽略
- ✅ uni-app 特定的忽略规则
- ✅ Spring Boot 特定的忽略规则
- ✅ 数据库和环境配置忽略
- ✅ 日志和临时文件忽略

现在项目的 Git 仓库会更加干净，只包含必要的源代码和配置文件！🎉
