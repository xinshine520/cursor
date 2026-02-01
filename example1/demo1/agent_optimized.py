"""
优化版 Agent - 按需加载 Skills，减少 Token 消耗
根据用户意图智能选择发送哪些 Skill 定义
"""
import os
import json
import re
from typing import List, Dict, Any, Optional, Set
from openai import OpenAI
from dotenv import load_dotenv
from skill_manager import SkillManager
from skills.weather_skill import WeatherSkill
from skills.news_skill import NewsSkill
from config import get_config

# 加载环境变量
load_dotenv()


class IntentClassifier:
    """简单的意图分类器，用于判断用户需要哪些 Skills"""
    
    def __init__(self, config_file: Optional[str] = None):
        """初始化意图分类器"""
        self.config = get_config(config_file)
        intent_config = self.config.get_intent_classifier_config()
        self.skill_keywords = intent_config["keywords"]
        self.connectors = intent_config["connectors"]
        self.min_message_length = self.config.get("agent.smart_routing.min_message_length", 5)
    
    def classify_intent(self, user_message: str) -> Set[str]:
        """
        根据用户消息分类意图，返回需要的 Skill 名称集合
        :param user_message: 用户消息
        :return: 需要的 Skill 名称集合
        """
        user_lower = user_message.lower()
        needed_skills = set()
        
        for skill_name, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword.lower() in user_lower:
                    needed_skills.add(skill_name)
                    break
        
        return needed_skills
    
    def should_use_all_skills(self, user_message: str) -> bool:
        """
        判断是否应该使用所有 Skills（当消息模糊或包含多个意图时）
        :param user_message: 用户消息
        :return: 是否使用所有 Skills
        """
        # 如果消息很短或包含连接词，可能需要多个 Skills
        if len(user_message) < self.min_message_length:
            return True
        
        # 包含多个意图关键词
        intent_count = len(self.classify_intent(user_message))
        if intent_count > 1:
            return True
        
        # 包含连接词
        if any(conn in user_message for conn in self.connectors):
            return True
        
        return False


class OptimizedAgent:
    """优化版 Agent - 按需加载 Skills"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None,
                 base_url: Optional[str] = None, enable_smart_routing: Optional[bool] = None,
                 config_file: Optional[str] = None):
        """
        初始化 Agent
        :param api_key: OpenAI API密钥（可选，优先使用参数，其次配置文件，最后环境变量）
        :param model: 使用的模型名称（可选）
        :param base_url: OpenAI API的基础URL（可选）
        :param enable_smart_routing: 是否启用智能路由（可选，默认从配置文件读取）
        :param config_file: 配置文件路径（可选）
        """
        # 加载配置
        self.config = get_config(config_file)
        agent_config = self.config.get_agent_config()
        logging_config = self.config.get_logging_config()
        
        self.api_key = api_key or agent_config["api_key"]
        if not self.api_key:
            raise ValueError("请设置OPENAI_API_KEY环境变量、配置文件或传入api_key参数")
        
        self.model = model or agent_config["model"]
        openai_base_url = base_url or agent_config["base_url"]
        self.enable_smart_routing = enable_smart_routing if enable_smart_routing is not None else agent_config["smart_routing_enabled"]
        self.max_history_length = agent_config["max_history_length"]
        self.enable_history = agent_config["enable_history"]
        self.exit_commands = agent_config["exit_commands"]
        self.show_stats_command = agent_config["show_stats_command"]
        self.show_skill_calls = logging_config["show_skill_calls"]
        self.show_skill_results = logging_config["show_skill_results"]
        
        # 初始化意图分类器
        self.intent_classifier = IntentClassifier(config_file)
        
        # 安全显示 API Key
        if logging_config["enabled"]:
            api_key_display = self.api_key[:10] + "..." if len(self.api_key) > 10 else self.api_key
            print(f"[Agent初始化] OpenAI API Key: {api_key_display}")
            print(f"[Agent初始化] 使用模型: {self.model}")
            print(f"[Agent初始化] 智能路由: {'启用' if self.enable_smart_routing else '禁用'}")
        
        # 初始化 OpenAI 客户端
        if openai_base_url:
            self.client = OpenAI(api_key=self.api_key, base_url=openai_base_url,
                               timeout=agent_config["timeout"])
        else:
            self.client = OpenAI(api_key=self.api_key, timeout=agent_config["timeout"])
        
        # 初始化 Skill 管理器
        self.skill_manager = SkillManager()
        self._register_default_skills()
        
        # 统计信息
        self.stats = {
            "total_calls": 0,
            "skill_calls": 0,
            "tokens_saved": 0  # 估算节省的 token（通过减少 function definitions）
        }
    
    def _register_default_skills(self):
        """注册默认的 Skills"""
        logging_config = self.config.get_logging_config()
        
        if logging_config["enabled"]:
            print("\n[注册 Skills]")
            print("-" * 60)
        
        # 注册天气 Skill（从配置读取）
        weather_config = self.config.get_weather_config()
        weather_skill = WeatherSkill(
            api_key=weather_config["api_key"],
            base_url=weather_config["base_url"],
            timeout=weather_config["timeout"],
            default_lang=weather_config["default_lang"]
        )
        self.skill_manager.register_skill(weather_skill)
        
        # 注册新闻 Skill（从配置读取）
        news_config = self.config.get_news_config()
        news_skill = NewsSkill(
            api_key=news_config["api_key"],
            base_url=news_config["base_url"],
            timeout=news_config["timeout"],
            default_country=news_config["default_country"],
            default_page_size=news_config["default_page_size"],
            max_page_size=news_config["max_page_size"]
        )
        self.skill_manager.register_skill(news_skill)
        
        if logging_config["enabled"]:
            print("-" * 60)
            print(f"✓ 共注册 {len(self.skill_manager.list_skills())} 个 Skills\n")
    
    def _get_relevant_function_definitions(self, user_message: str) -> List[Dict[str, Any]]:
        """
        根据用户消息智能选择相关的函数定义
        :param user_message: 用户消息
        :return: 相关的函数定义列表
        """
        if not self.enable_smart_routing:
            # 禁用智能路由时，返回所有函数定义
            return self.skill_manager.get_all_function_definitions()
        
        # 使用意图分类器判断需要的 Skills
        if self.intent_classifier.should_use_all_skills(user_message):
            # 消息模糊或需要多个 Skills，返回所有
            print("[智能路由] 消息需要多个 Skills，加载所有函数定义")
            return self.skill_manager.get_all_function_definitions()
        
        needed_skills = self.intent_classifier.classify_intent(user_message)
        
        if not needed_skills:
            # 没有匹配到任何 Skill，返回所有（让 LLM 决定）
            print("[智能路由] 未识别到明确意图，加载所有函数定义")
            return self.skill_manager.get_all_function_definitions()
        
        # 只返回需要的 Skills 的函数定义
        relevant_defs = []
        all_defs = self.skill_manager.get_all_function_definitions()
        
        for skill_name in needed_skills:
            for func_def in all_defs:
                if func_def.get("function", {}).get("name") == skill_name:
                    relevant_defs.append(func_def)
                    break
        
        print(f"[智能路由] 识别到意图，仅加载 {len(relevant_defs)} 个相关函数定义: {list(needed_skills)}")
        
        # 估算节省的 token（每个 function definition 大约 50-100 tokens）
        tokens_saved = (len(all_defs) - len(relevant_defs)) * 75
        self.stats["tokens_saved"] += tokens_saved
        
        return relevant_defs
    
    def chat(self, user_message: str, conversation_history: Optional[List[Dict]] = None) -> str:
        """
        与 Agent 对话（优化版 - 按需加载 Skills）
        :param user_message: 用户消息
        :param conversation_history: 对话历史（可选）
        :return: Agent 的回复
        """
        self.stats["total_calls"] += 1
        
        messages = conversation_history or []
        messages.append({"role": "user", "content": user_message})
        
        # 智能选择相关的函数定义（关键优化点）
        tools = self._get_relevant_function_definitions(user_message)
        
        # 调用 OpenAI API
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None
        )
        
        message = response.choices[0].message
        messages.append(message)
        
        # 检查是否需要调用 Skill
        if message.tool_calls:
            self.stats["skill_calls"] += len(message.tool_calls)
            
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                print(f"\n[Skill调用] {function_name}")
                print(f"  参数: {function_args}")
                
                # 执行 Skill（本地执行，不消耗 API token）
                skill_result = self.skill_manager.execute_skill(function_name, **function_args)
                print(f"  结果: {json.dumps(skill_result, ensure_ascii=False, indent=2)}")
                
                # 将 Skill 执行结果添加到消息中
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": json.dumps(skill_result, ensure_ascii=False)
                })
            
            # 再次调用 API 获取最终回复
            second_response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            
            return second_response.choices[0].message.content
        else:
            return message.content
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        return {
            **self.stats,
            "skill_call_rate": self.stats["skill_calls"] / self.stats["total_calls"] if self.stats["total_calls"] > 0 else 0
        }
    
    def run_interactive(self):
        """运行交互式对话"""
        print("=" * 60)
        print("Agent - 优化版（按需加载 Skills）")
        print("=" * 60)
        print("已注册的 Skills:")
        for skill_name in self.skill_manager.list_skills():
            skill = self.skill_manager.get_skill(skill_name)
            print(f"  • {skill_name}: {skill.description}")
        print("=" * 60)
        print("提示：输入 'quit' 或 'exit' 退出程序")
        print("输入 'stats' 查看统计信息")
        print("示例问题：")
        print("  - 北京今天天气怎么样？")
        print("  - 给我看看最新的科技新闻")
        print("=" * 60)
        print()
        
        conversation_history = []
        
        while True:
            try:
                user_input = input("\n你: ").strip()
                
                if user_input.lower() in ['quit', 'exit', '退出']:
                    print("\n再见！")
                    stats = self.get_stats()
                    print(f"\n统计信息:")
                    print(f"  总调用次数: {stats['total_calls']}")
                    print(f"  Skill 调用次数: {stats['skill_calls']}")
                    print(f"  估算节省 Token: {stats['tokens_saved']}")
                    break
                
                if user_input.lower() == 'stats':
                    stats = self.get_stats()
                    print(f"\n统计信息:")
                    print(f"  总调用次数: {stats['total_calls']}")
                    print(f"  Skill 调用次数: {stats['skill_calls']}")
                    print(f"  Skill 调用率: {stats['skill_call_rate']:.2%}")
                    print(f"  估算节省 Token: {stats['tokens_saved']}")
                    continue
                
                if not user_input:
                    continue
                
                print("\nAgent: ", end="", flush=True)
                response = self.chat(user_input, conversation_history)
                print(response)
                
                # 更新对话历史
                conversation_history.append({"role": "user", "content": user_input})
                conversation_history.append({"role": "assistant", "content": response})
                if len(conversation_history) > 20:
                    conversation_history = conversation_history[-20:]
                    
            except KeyboardInterrupt:
                print("\n\n程序已中断")
                break
            except Exception as e:
                print(f"\n错误: {str(e)}")


def main():
    """主函数"""
    try:
        # enable_smart_routing=True 启用智能路由（按需加载）
        # enable_smart_routing=False 禁用智能路由（总是加载所有）
        agent = OptimizedAgent(enable_smart_routing=True)
        agent.run_interactive()
    except ValueError as e:
        print(f"配置错误: {e}")
        print("\n请确保：")
        print("1. 创建 .env 文件")
        print("2. 设置 OPENAI_API_KEY=your_api_key")
    except Exception as e:
        print(f"运行错误: {e}")


if __name__ == "__main__":
    main()

