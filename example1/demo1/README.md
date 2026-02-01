# Agent 程序（基于 Skills 架构）

这是一个基于 Skills 架构的 Agent 程序，支持动态注册和管理各种功能 Skills。

## 架构特点

- **模块化设计**：每个功能作为独立的 Skill 实现
- **统一接口**：所有 Skill 继承自 `BaseSkill`，提供统一的接口
- **动态管理**：通过 `SkillManager` 动态注册和管理 Skills
- **易于扩展**：添加新功能只需创建新的 Skill 类并注册

## 目录结构

```
demo1/
├── skills/              # Skills 模块
│   ├── __init__.py
│   ├── base_skill.py    # Skill 基类
│   ├── weather_skill.py  # 天气 Skill
│   └── news_skill.py     # 新闻 Skill
├── skill_manager.py     # Skill 管理器
├── agent.py             # Agent 主程序
├── example_usage.py     # 使用示例
└── README.md           # 本文件
```

## 已实现的 Skills

### 1. WeatherSkill（天气 Skill）
- **功能**：查询指定城市的天气信息
- **参数**：
  - `city`（必需）：城市名称
  - `units`（可选）：温度单位（metric/imperial）

### 2. NewsSkill（新闻 Skill）
- **功能**：获取指定国家或类别的新闻头条
- **参数**：
  - `country`（可选）：国家代码，默认 "cn"
  - `category`（可选）：新闻类别
  - `page_size`（可选）：返回数量，默认 5

## 安装依赖

```bash
pip install -r ../requirements.txt
```

## 配置环境变量

创建 `.env` 文件（参考 `../config.example.env`）：

```env
# OpenAI API 配置（必需）
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_URL=  # 可选，用于自定义API端点

# 天气 API 配置（可选，不配置则使用模拟数据）
WEATHER_API_KEY=your_weather_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5/weather

# 新闻 API 配置（可选，不配置则使用模拟数据）
NEWS_API_KEY=your_news_api_key
NEWS_API_URL=https://newsapi.org/v2/top-headlines
```

## 使用方法

### 1. 交互式对话

```bash
python agent.py
```

### 2. 运行示例代码

```bash
python example_usage.py
```

### 3. 在代码中使用

```python
from agent import Agent

# 创建 Agent 实例
agent = Agent()

# 单次对话
response = agent.chat("北京今天天气怎么样？")
print(response)

# 带对话历史的连续对话
conversation = []
response1 = agent.chat("北京天气如何？", conversation)
response2 = agent.chat("那上海呢？", conversation)
```

### 4. 直接使用 Skill

```python
from skills.weather_skill import WeatherSkill

# 创建 Skill 实例
weather = WeatherSkill()

# 执行 Skill
result = weather.execute(city="北京", units="metric")
print(result)
```

### 5. 注册自定义 Skill

```python
from agent import Agent
from skills.base_skill import BaseSkill

# 创建自定义 Skill
class MyCustomSkill(BaseSkill):
    def __init__(self):
        super().__init__("my_skill", "我的自定义功能")
    
    def execute(self, **kwargs):
        return {"success": True, "result": "自定义结果"}
    
    def get_function_definition(self):
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {"type": "object", "properties": {}}
            }
        }

# 注册 Skill
agent = Agent()
agent.register_skill(MyCustomSkill())
```

## Skills 架构说明

### BaseSkill 基类

所有 Skill 必须继承 `BaseSkill` 并实现以下方法：

- `execute(**kwargs)`: 执行 Skill 的核心功能
- `get_function_definition()`: 返回 OpenAI 函数调用定义
- `validate_params(params)`: 验证参数（可选）

### SkillManager

`SkillManager` 负责管理所有 Skills：

- `register_skill(skill)`: 注册 Skill
- `unregister_skill(name)`: 注销 Skill
- `get_skill(name)`: 获取指定 Skill
- `execute_skill(name, **kwargs)`: 执行指定 Skill
- `list_skills()`: 列出所有已注册的 Skills
- `get_all_function_definitions()`: 获取所有函数定义

## 扩展新 Skill

1. 在 `skills/` 目录下创建新的 Skill 文件
2. 继承 `BaseSkill` 类
3. 实现 `execute()` 和 `get_function_definition()` 方法
4. 在 `agent.py` 中注册新 Skill，或在运行时动态注册

示例：

```python
from skills.base_skill import BaseSkill

class CalculatorSkill(BaseSkill):
    def __init__(self):
        super().__init__("calculate", "执行数学计算")
    
    def execute(self, expression: str):
        try:
            result = eval(expression)
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_function_definition(self):
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "数学表达式"
                        }
                    },
                    "required": ["expression"]
                }
            }
        }
```

## 注意事项

1. 如果没有配置 API 密钥，WeatherSkill 和 NewsSkill 会使用模拟数据
2. 确保已安装所有依赖：`pip install -r ../requirements.txt`
3. 交互式模式下，输入 `quit` 或 `exit` 退出程序
4. Skills 的执行结果会自动传递给 OpenAI 模型生成最终回复

## 许可证

与主项目保持一致

