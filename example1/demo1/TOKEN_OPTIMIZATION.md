# Skill 按需调用与 Token 优化说明

## 📊 当前实现机制

### 1. **按需执行（已实现）**

Skills 的执行是**完全按需的**：

```python
# agent.py 第 103 行
if message.tool_calls:  # 只有 LLM 决定调用时才执行
    for tool_call in message.tool_calls:
        skill_result = self.skill_manager.execute_skill(function_name, **function_args)
```

**关键点**：
- ✅ Skill 的实际执行（`skill.execute()`）只在 LLM 决定调用时发生
- ✅ 本地执行，**不消耗 API Token**
- ✅ 如果用户问题不需要 Skill，Skill 不会被执行

### 2. **Token 消耗情况**

**当前实现的 Token 消耗**：

| 操作 | Token 消耗 | 说明 |
|------|-----------|------|
| 发送 Function Definitions | ✅ **消耗输入 Token** | 每次请求都会发送所有函数定义 |
| Skill 执行 | ❌ **不消耗 Token** | 本地执行，不调用 API |
| 返回 Skill 结果 | ✅ **消耗输入 Token** | 结果作为 tool message 发送给 LLM |

**问题**：
- 即使不需要某个 Skill，它的函数定义也会被发送（消耗 Token）
- 例如：用户问"你好"，不需要任何 Skill，但仍会发送所有函数定义

## 🚀 优化方案

### 方案1：智能路由（已实现）

根据用户消息意图，**只发送相关的函数定义**：

```python
# agent_optimized.py
def _get_relevant_function_definitions(self, user_message: str):
    # 1. 分析用户意图
    needed_skills = IntentClassifier.classify_intent(user_message)
    
    # 2. 只返回需要的函数定义
    return [def for def in all_defs if def.name in needed_skills]
```

**效果**：
- 用户问"北京天气" → 只发送 `get_weather` 定义
- 用户问"科技新闻" → 只发送 `get_news` 定义
- 用户问"你好" → 不发送任何函数定义

**Token 节省**：
- 每个函数定义约 50-100 tokens
- 如果有 10 个 Skills，每次节省 500-1000 tokens

### 方案2：延迟加载

在对话历史中记录已使用的 Skills，只在需要时加载：

```python
def chat(self, user_message, conversation_history):
    # 从历史中提取已使用的 Skills
    used_skills = self._extract_used_skills(conversation_history)
    
    # 如果历史中用过某个 Skill，继续加载它
    tools = self._get_tools_for_context(used_skills, user_message)
```

### 方案3：分层加载

先发送轻量级分类请求，再决定加载哪些 Skills：

```python
# 第一步：轻量级分类（不加载任何 Skills）
classification = self.client.chat.completions.create(
    model="gpt-3.5-turbo",  # 使用更便宜的模型
    messages=[{"role": "user", "content": user_message}],
    # 不传 tools
)

# 第二步：根据分类结果加载相关 Skills
if classification.needs_weather:
    tools = [weather_function_definition]
```

## 📈 性能对比

### 当前实现（agent.py）

```
用户: "你好"
→ 发送所有函数定义（2个，约150 tokens）
→ LLM 决定不调用任何 Skill
→ 返回回复

用户: "北京天气"
→ 发送所有函数定义（2个，约150 tokens）
→ LLM 调用 get_weather
→ 执行 Skill（本地，0 tokens）
→ 返回结果（约50 tokens）
→ 返回最终回复
```

### 优化实现（agent_optimized.py）

```
用户: "你好"
→ 不发送函数定义（0 tokens）✅ 节省 150 tokens
→ LLM 返回回复

用户: "北京天气"
→ 只发送 get_weather 定义（1个，约75 tokens）✅ 节省 75 tokens
→ LLM 调用 get_weather
→ 执行 Skill（本地，0 tokens）
→ 返回结果（约50 tokens）
→ 返回最终回复
```

## 🎯 使用建议

### 场景1：Skills 数量少（<5个）
- **推荐**：使用 `agent.py`（当前实现）
- **原因**：Token 节省不明显，代码更简单

### 场景2：Skills 数量多（>5个）
- **推荐**：使用 `agent_optimized.py`（优化实现）
- **原因**：Token 节省显著，用户体验更好

### 场景3：需要精确控制
- **推荐**：手动选择 Skills
```python
# 手动指定需要的 Skills
agent = OptimizedAgent()
tools = agent.skill_manager.get_function_definitions_for(["get_weather"])
```

## 📝 代码示例

### 使用优化版 Agent

```python
from agent_optimized import OptimizedAgent

# 启用智能路由（默认）
agent = OptimizedAgent(enable_smart_routing=True)

# 查看统计信息
stats = agent.get_stats()
print(f"节省 Token: {stats['tokens_saved']}")
```

### 禁用智能路由（对比测试）

```python
# 禁用智能路由，总是加载所有 Skills
agent = OptimizedAgent(enable_smart_routing=False)
```

## 🔍 关键理解

1. **Skill 执行本身不消耗 Token**
   - `skill.execute()` 是本地函数调用
   - 只有 API 调用才消耗 Token

2. **Function Definitions 消耗 Token**
   - 每次发送给 LLM 的函数定义都会计入输入 Token
   - 优化目标是减少不必要的函数定义

3. **按需调用是双向的**
   - LLM 决定是否调用（按需执行）
   - 我们可以决定发送哪些定义（按需加载）

## 📊 Token 消耗估算

假设：
- 每个函数定义：75 tokens
- 每次对话：平均 500 tokens（输入+输出）
- 10 个 Skills，但每次只用 1-2 个

**当前实现**：
- 每次发送 10 个定义 = 750 tokens
- 实际需要 1-2 个 = 75-150 tokens
- **浪费：600-675 tokens/次**

**优化实现**：
- 智能选择 1-2 个定义 = 75-150 tokens
- **节省：600-675 tokens/次**
- 如果每天 100 次对话，节省 60,000-67,500 tokens

## 🎓 总结

- ✅ **Skill 执行是按需的**（已实现）
- ✅ **Function Definitions 可以优化**（已提供优化方案）
- ✅ **优化版 Agent 可以显著减少 Token 消耗**
- ✅ **适用于 Skills 数量较多的场景**

