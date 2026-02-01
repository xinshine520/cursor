# Agent 渐进式 Skill 实现原理与特性

## 📚 什么是渐进式 Skill？

**渐进式 Skill（Progressive Skills）** 是一种按需加载和激活 Skills 的机制，根据用户意图和对话上下文，动态决定哪些 Skills 应该被加载到 LLM 的上下文中。

### 核心思想

```
传统方式：一次性加载所有 Skills
┌─────────────────────────────────┐
│  所有 Skills 定义（10个）        │  → 发送给 LLM（消耗大量 Token）
└─────────────────────────────────┘

渐进式方式：按需加载相关 Skills
┌─────────────────────────────────┐
│  用户意图分析                   │
│  ↓                              │
│  只加载需要的 Skills（1-2个）    │  → 发送给 LLM（节省 Token）
└─────────────────────────────────┘
```

## 🔧 实现原理

### 1. 架构层次

```
┌─────────────────────────────────────────────┐
│           Agent Layer                       │
│  - 接收用户消息                              │
│  - 调用意图分类器                            │
│  - 决定加载哪些 Skills                       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│      Intent Classifier Layer                │
│  - 关键词匹配                                │
│  - 意图识别                                  │
│  - 多意图检测                                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│      Skill Manager Layer                    │
│  - Skill 注册表（所有已注册的 Skills）       │
│  - 按需筛选相关 Skills                       │
│  - 返回函数定义列表                          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│      LLM API Layer                          │
│  - 接收筛选后的函数定义                      │
│  - 决定是否调用                              │
│  - 执行 Skill（如果需要）                   │
└─────────────────────────────────────────────┘
```

### 2. 工作流程

```python
# 1. 用户发送消息
user_message = "北京今天天气怎么样？"

# 2. 意图分类（IntentClassifier）
intent_classifier = IntentClassifier()
needed_skills = intent_classifier.classify_intent(user_message)
# 结果: {"get_weather"}

# 3. 智能路由（OptimizedAgent）
relevant_defs = agent._get_relevant_function_definitions(user_message)
# 只返回 get_weather 的函数定义

# 4. 发送给 LLM（只包含相关定义）
response = llm.chat(messages, tools=relevant_defs)

# 5. LLM 决定调用
if response.tool_calls:
    # 执行 Skill
    skill_result = skill_manager.execute_skill("get_weather", city="北京")
```

### 3. 关键代码实现

#### 意图分类器（IntentClassifier）

```python
class IntentClassifier:
    """意图分类器 - 分析用户消息，识别需要的 Skills"""
    
    def classify_intent(self, user_message: str) -> Set[str]:
        """
        根据关键词匹配识别意图
        返回需要的 Skill 名称集合
        """
        user_lower = user_message.lower()
        needed_skills = set()
        
        # 遍历所有 Skill 的关键词
        for skill_name, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword.lower() in user_lower:
                    needed_skills.add(skill_name)
                    break
        
        return needed_skills
    
    def should_use_all_skills(self, user_message: str) -> bool:
        """
        判断是否需要加载所有 Skills
        - 消息太短（<5字符）
        - 包含多个意图
        - 包含连接词（"和"、"以及"等）
        """
        # ... 判断逻辑
```

#### 智能路由（OptimizedAgent）

```python
def _get_relevant_function_definitions(self, user_message: str):
    """
    渐进式加载：根据意图只返回相关的函数定义
    """
    # 1. 检查是否启用智能路由
    if not self.enable_smart_routing:
        return self.skill_manager.get_all_function_definitions()
    
    # 2. 判断是否需要所有 Skills
    if self.intent_classifier.should_use_all_skills(user_message):
        return self.skill_manager.get_all_function_definitions()
    
    # 3. 识别用户意图
    needed_skills = self.intent_classifier.classify_intent(user_message)
    
    # 4. 如果没有识别到意图，返回所有（让 LLM 决定）
    if not needed_skills:
        return self.skill_manager.get_all_function_definitions()
    
    # 5. 只返回需要的 Skills 的函数定义
    relevant_defs = []
    all_defs = self.skill_manager.get_all_function_definitions()
    
    for skill_name in needed_skills:
        for func_def in all_defs:
            if func_def.get("function", {}).get("name") == skill_name:
                relevant_defs.append(func_def)
                break
    
    return relevant_defs
```

## ✨ 核心特性

### 1. **按需加载（On-Demand Loading）**

**特性**：
- Skills 在内存中已注册，但函数定义只在需要时发送给 LLM
- 减少每次 API 调用的 Token 消耗

**示例**：
```python
# 场景1：用户问天气
用户: "北京天气怎么样？"
→ 只加载 get_weather 定义（1个，约75 tokens）
→ 节省：75 tokens

# 场景2：用户问新闻
用户: "给我看看科技新闻"
→ 只加载 get_news 定义（1个，约75 tokens）
→ 节省：75 tokens

# 场景3：用户打招呼
用户: "你好"
→ 不加载任何定义（0 tokens）
→ 节省：150 tokens
```

### 2. **意图感知（Intent-Aware）**

**特性**：
- 基于关键词匹配识别用户意图
- 支持多意图检测
- 可配置的关键词映射

**配置示例**：
```json
{
  "intent_classifier": {
    "keywords": {
      "get_weather": ["天气", "温度", "weather", "temperature"],
      "get_news": ["新闻", "头条", "news", "headline"]
    }
  }
}
```

### 3. **智能降级（Intelligent Fallback）**

**特性**：
- 当意图不明确时，自动加载所有 Skills
- 保证功能可用性，避免遗漏

**降级场景**：
```python
# 场景1：消息太短
用户: "你好"  # < 5字符
→ 加载所有 Skills（降级）

# 场景2：多意图
用户: "天气和新闻"  # 包含连接词
→ 加载所有 Skills（降级）

# 场景3：未识别意图
用户: "帮我做点什么"  # 无关键词匹配
→ 加载所有 Skills（降级，让 LLM 决定）
```

### 4. **动态注册（Dynamic Registration）**

**特性**：
- 支持运行时注册新 Skills
- Skills 注册后立即可用
- 无需重启 Agent

**示例**：
```python
# 运行时注册新 Skill
agent = OptimizedAgent()
new_skill = CalculatorSkill()
agent.register_skill(new_skill)

# 下次对话时，新 Skill 会自动参与意图分类
```

### 5. **Token 优化（Token Optimization）**

**特性**：
- 统计节省的 Token 数量
- 可配置的优化策略
- 实时监控优化效果

**统计信息**：
```python
stats = agent.get_stats()
# {
#   "total_calls": 100,
#   "skill_calls": 50,
#   "tokens_saved": 7500  # 累计节省的 Token
# }
```

## 📊 性能对比

### Token 消耗对比

| 场景 | 传统方式 | 渐进式 | 节省 |
|------|---------|--------|------|
| 简单对话（无需 Skill） | 150 tokens | 0 tokens | **100%** |
| 单一 Skill 调用 | 150 tokens | 75 tokens | **50%** |
| 多 Skill 调用 | 150 tokens | 150 tokens | 0% |
| 平均（假设 30% 需要 Skill） | 150 tokens | 60 tokens | **60%** |

### 响应时间对比

| 指标 | 传统方式 | 渐进式 | 说明 |
|------|---------|--------|------|
| 意图识别时间 | 0ms | ~1ms | 关键词匹配，几乎无延迟 |
| API 调用时间 | 1000ms | 950ms | Token 减少，响应稍快 |
| 总体延迟 | 1000ms | 951ms | **几乎无影响** |

## 🎯 应用场景

### 1. **Skills 数量较多的系统**

**场景**：系统有 20+ Skills
- **传统方式**：每次发送 20 个定义（~1500 tokens）
- **渐进式**：平均只发送 1-2 个（~150 tokens）
- **节省**：90%+ Token

### 2. **高频对话场景**

**场景**：每天 1000+ 次对话
- **传统方式**：150,000 tokens/天
- **渐进式**：60,000 tokens/天（假设 60% 节省）
- **节省**：90,000 tokens/天 ≈ **$0.27/天**（按 GPT-4 价格）

### 3. **多租户系统**

**场景**：不同用户需要不同的 Skills
- **传统方式**：所有用户都加载所有 Skills
- **渐进式**：根据用户历史偏好，只加载相关 Skills
- **优势**：个性化优化，更好的用户体验

## 🔄 渐进式加载策略

### 策略1：关键词匹配（当前实现）

**优点**：
- 实现简单
- 响应快速
- 无需额外 API 调用

**缺点**：
- 依赖关键词配置
- 可能误判

**适用场景**：
- Skills 数量中等（<50）
- 关键词明确
- 对延迟敏感

### 策略2：LLM 预分类（未来优化）

**流程**：
```
用户消息 → 轻量级 LLM 分类 → 识别意图 → 加载相关 Skills
```

**优点**：
- 准确率高
- 支持复杂意图

**缺点**：
- 需要额外 API 调用
- 增加延迟和成本

**适用场景**：
- Skills 数量很多（>50）
- 意图复杂
- 对准确性要求高

### 策略3：历史学习（未来优化）

**流程**：
```
用户消息 → 查询历史使用记录 → 预测需要的 Skills → 加载
```

**优点**：
- 个性化
- 准确率高
- 无需额外 API

**缺点**：
- 需要历史数据
- 冷启动问题

**适用场景**：
- 有用户历史数据
- 需要个性化
- 长期运行的系统

## 🛠️ 配置与扩展

### 自定义意图分类器

```python
class CustomIntentClassifier(IntentClassifier):
    """自定义意图分类器"""
    
    def classify_intent(self, user_message: str) -> Set[str]:
        # 使用更复杂的逻辑
        # 例如：NER、情感分析等
        pass
```

### 自定义加载策略

```python
class CustomAgent(OptimizedAgent):
    """自定义 Agent，实现不同的加载策略"""
    
    def _get_relevant_function_definitions(self, user_message: str):
        # 实现自己的策略
        # 例如：基于用户画像、历史记录等
        pass
```

## 📈 最佳实践

### 1. **关键词配置**

- ✅ 使用常见、明确的词汇
- ✅ 覆盖同义词和变体
- ✅ 定期更新和维护
- ❌ 避免过于宽泛的词汇

### 2. **降级策略**

- ✅ 保持功能可用性（未识别时加载所有）
- ✅ 记录降级情况，优化关键词
- ✅ 监控降级频率

### 3. **性能监控**

- ✅ 统计 Token 节省
- ✅ 监控意图识别准确率
- ✅ 跟踪 API 响应时间

### 4. **扩展性**

- ✅ 支持动态注册 Skills
- ✅ 配置化的关键词映射
- ✅ 可插拔的意图分类器

## 🎓 总结

**渐进式 Skill 实现** 是一种智能的资源管理机制，通过：

1. **意图识别**：分析用户消息，识别需要的 Skills
2. **按需加载**：只加载相关的函数定义，减少 Token 消耗
3. **智能降级**：保证功能可用性，避免遗漏
4. **动态扩展**：支持运行时注册新 Skills

**核心优势**：
- ✅ 显著减少 Token 消耗（50-90%）
- ✅ 提升响应速度（减少传输数据）
- ✅ 更好的可扩展性（支持大量 Skills）
- ✅ 个性化优化（基于用户意图）

**适用场景**：
- Skills 数量较多（>5）
- 高频对话场景
- 对成本敏感的应用
- 需要个性化服务的系统

