# OpenSpec 工作流程指南

本文档说明如何在华玥智能项目中使用 OpenSpec 规范驱动开发，以及如何与 AI 助手协作。

## 📋 核心概念

### 三个关键目录

```
openspec/
├── project.md          # 项目上下文（技术栈、代码规范、架构模式）
├── specs/              # 已实现的功能规范（当前系统的真实状态）
│   └── [capability]/   # 每个能力一个目录
│       └── spec.md     # 需求和行为场景
└── changes/            # 变更提案（待实现的功能）
    ├── [change-id]/    # 每个变更一个目录
    │   ├── proposal.md # 为什么、做什么、影响
    │   ├── tasks.md    # 实现任务清单
    │   └── specs/      # 变更的规范增量
    └── archive/        # 已完成并归档的变更
```

**关键理解**：
- **`specs/`** = 已构建的功能（当前系统的真实状态）
- **`changes/`** = 提案中的功能（待实现）
- **`archive/`** = 已完成的功能（历史记录）

## 🔄 三阶段工作流程

### 阶段 1：创建变更提案（Planning）

**何时创建提案**：
- ✅ 添加新功能（如：新闻页面、用户登录）
- ✅ 重大架构变更
- ✅ 破坏性变更（API 变更、数据结构变更）
- ✅ 性能优化（改变行为）

**跳过提案的情况**：
- ❌ Bug 修复（恢复预期行为）
- ❌ 拼写错误、格式调整、注释
- ❌ 非破坏性的依赖更新
- ❌ 配置调整

**工作流程**：

1. **探索现有状态**
   ```bash
   # 查看现有能力
   openspec list --specs
   
   # 查看进行中的变更
   openspec list
   
   # 查看项目上下文
   cat openspec/project.md
   ```

2. **创建变更目录**
   - 选择唯一的 `change-id`（kebab-case，动词开头）
   - 例如：`add-news-page`, `update-pricing-api`, `refactor-navigation`

3. **编写提案文档**
   - `proposal.md`: 说明为什么、做什么、影响范围
   - `tasks.md`: 实现任务清单（待办事项）
   - `specs/[capability]/spec.md`: 规范增量（ADDED/MODIFIED/REMOVED）

4. **验证提案**
   ```bash
   openspec validate add-news-page --strict
   ```

5. **等待批准** - ⚠️ **重要**：在提案被批准之前，不要开始实现！

### 阶段 2：实现变更（Implementation）

**工作流程**：

1. **阅读提案文档**
   - 阅读 `proposal.md` 理解变更原因和目标
   - 阅读 `design.md`（如果存在）了解技术决策
   - 阅读 `tasks.md` 获取实现清单

2. **按顺序实现任务**
   - 按照 `tasks.md` 中的顺序完成每个任务
   - 每完成一个任务，更新复选框：`- [x]`
   - 不要跳过步骤

3. **确认完成**
   - 确保 `tasks.md` 中所有任务都标记为完成
   - 运行测试和构建验证
   - 确保代码符合项目规范（见 `project.md`）

### 阶段 3：归档变更（Archiving）

**完成后的步骤**：

1. **部署到生产环境**

2. **归档变更**
   ```bash
   # 将变更移动到归档目录
   openspec archive add-news-page --yes
   ```

3. **更新规范**
   - 如果添加了新能力，将 `changes/[id]/specs/` 中的内容移动到 `specs/[capability]/`
   - 运行验证确保一切正常

## 🤝 如何与我协作

### 场景 1：添加新功能

**你说**：
```
我想添加 [功能描述]。请创建一个 OpenSpec 变更提案。
```

**我会**：
1. 检查现有能力和变更，避免重复
2. 创建变更提案目录结构
3. 编写 `proposal.md`、`tasks.md` 和规范增量
4. 验证提案格式

**你接下来**：
- 审查提案内容
- 批准或提出修改意见
- 批准后，我可以开始实现

### 场景 2：实现已批准的变更

**你说**：
```
请实现 add-news-page 变更提案。
```

**我会**：
1. 阅读提案和任务清单
2. 按照 `tasks.md` 的顺序实现
3. 每完成一个任务更新清单
4. 确保代码符合项目规范

### 场景 3：修改现有功能

**你说**：
```
我想修改 [功能名称]，让它支持 [新需求]。
```

**我会**：
1. 检查相关规范（`specs/[capability]/spec.md`）
2. 创建变更提案，使用 `MODIFIED Requirements`
3. 完整复制现有需求，然后修改
4. 创建实现任务清单

### 场景 4：Bug 修复

**你说**：
```
修复 [问题描述]。
```

**我会**：
- 直接修复（不需要提案）
- 恢复预期的规范行为

## 📝 规范文件格式

### 需求（Requirement）格式

```markdown
### Requirement: 功能名称
系统必须（SHALL/MUST）提供...

#### Scenario: 成功场景
- **WHEN** 用户执行某个操作
- **THEN** 系统返回预期结果
- **AND** 其他条件

#### Scenario: 错误场景
- **WHEN** 用户提供无效输入
- **THEN** 系统显示错误消息
```

**重要规则**：
- ✅ 使用 `#### Scenario:`（4 个 #）
- ✅ 每个需求至少一个场景
- ✅ 使用 `SHALL`/`MUST` 表示必须
- ❌ 不要用 `- **Scenario:**`（错误格式）

### 变更操作类型

```markdown
## ADDED Requirements        # 新增功能
## MODIFIED Requirements     # 修改现有功能（必须完整复制原需求）
## REMOVED Requirements      # 移除功能
## RENAMED Requirements      # 重命名功能
```

## 🎯 当前项目示例

### 已创建的变更：`add-news-page`

**位置**：`openspec/changes/add-news-page/`

**包含文件**：
- `proposal.md` - 为什么添加新闻页面、做什么、影响范围
- `tasks.md` - 6 个阶段的实现任务清单
- `specs/news/spec.md` - 新闻功能的详细规范（5 个需求，多个场景）

**下一步**：
1. 你审查提案内容
2. 批准后，我可以开始实现
3. 实现完成后，归档变更

## 🔍 常用命令参考

```bash
# 查看所有变更
openspec list

# 查看所有规范
openspec list --specs

# 查看变更详情
openspec show add-news-page

# 验证变更格式
openspec validate add-news-page --strict

# 归档已完成的变更
openspec archive add-news-page --yes
```

## 💡 最佳实践

1. **先规划，后实现**
   - 创建提案 → 审查 → 批准 → 实现
   - 不要跳过提案阶段（除非是 bug 修复）

2. **保持规范同步**
   - 实现完成后，更新 `specs/` 目录
   - 归档变更时，确保规范已更新

3. **清晰的变更 ID**
   - 使用动词开头：`add-`, `update-`, `remove-`, `refactor-`
   - 保持简短和描述性：`add-news-page` ✅，`change-1` ❌

4. **完整的场景描述**
   - 每个需求至少一个场景
   - 场景要具体，包含 WHEN/THEN/AND

5. **遵循项目规范**
   - 参考 `project.md` 了解代码风格
   - 使用项目约定的技术栈和模式

## ❓ 常见问题

**Q: 什么时候需要 `design.md`？**
A: 仅在以下情况需要：
- 跨多个模块的变更
- 新的架构模式
- 新的外部依赖
- 安全/性能/迁移复杂性
- 技术决策需要文档化

**Q: 如何知道变更是否已批准？**
A: 我会在开始实现前询问你的批准。你也可以明确说："请实现 add-news-page" 表示批准。

**Q: 可以同时有多个变更吗？**
A: 可以，但要检查冲突。使用 `openspec list` 查看所有进行中的变更。

**Q: 变更完成后怎么办？**
A: 部署后，运行 `openspec archive <change-id> --yes` 归档变更。

---

**记住**：规范是真相，变更是提案。保持它们同步！

