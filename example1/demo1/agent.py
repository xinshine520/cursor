"""
基于 Skills 架构的 Agent 程序
支持动态注册和管理 Skills
"""
import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from skill_manager import SkillManager
from skills.weather_skill import WeatherSkill
from skills.news_skill import NewsSkill
from config import get_config

# 加载环境变量
load_dotenv()


class Agent:
    """基于 Skills 架构的 Agent"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None,
                 base_url: Optional[str] = None, config_file: Optional[str] = None):
        """
        初始化 Agent
        :param api_key: OpenAI API密钥（可选，优先使用参数，其次配置文件，最后环境变量）
        :param model: 使用的模型名称（可选）
        :param base_url: OpenAI API的基础URL（可选，用于自定义API端点）
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
        self.max_history_length = agent_config["max_history_length"]
        self.enable_history = agent_config["enable_history"]
        self.exit_commands = agent_config["exit_commands"]
        self.show_skill_calls = logging_config["show_skill_calls"]
        self.show_skill_results = logging_config["show_skill_results"]
        
        # 安全显示 API Key（只显示前10个字符）
        api_key_display = self.api_key[:10] + "..." if len(self.api_key) > 10 else self.api_key
        if logging_config["enabled"]:
            print(f"[Agent初始化] OpenAI API Key: {api_key_display}")
            print(f"[Agent初始化] OpenAI API Base URL: {openai_base_url or '默认（https://api.openai.com/v1）'}")
            print(f"[Agent初始化] 使用模型: {self.model}")
        
        # 初始化 OpenAI 客户端
        if openai_base_url:
            self.client = OpenAI(api_key=self.api_key, base_url=openai_base_url, 
                               timeout=agent_config["timeout"])
        else:
            self.client = OpenAI(api_key=self.api_key, timeout=agent_config["timeout"])
        
        # 初始化 Skill 管理器
        self.skill_manager = SkillManager()
        
        # 注册默认 Skills
        self._register_default_skills()
    
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
    
    def register_skill(self, skill):
        """
        注册一个新的 Skill
        :param skill: Skill 实例
        """
        self.skill_manager.register_skill(skill)
    
    def chat(self, user_message: str, conversation_history: Optional[List[Dict]] = None) -> str:
        """
        与 Agent 对话
        :param user_message: 用户消息
        :param conversation_history: 对话历史（可选）
        :return: Agent 的回复
        """
        messages = conversation_history or []
        messages.append({"role": "user", "content": user_message})
        
        # 获取所有 Skill 的函数定义
        tools = self.skill_manager.get_all_function_definitions()
        
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
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if self.show_skill_calls:
                    print(f"\n[Skill调用] {function_name}")
                    print(f"  参数: {function_args}")
                
                # 执行 Skill
                skill_result = self.skill_manager.execute_skill(function_name, **function_args)
                
                if self.show_skill_results:
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
    
    def run_interactive(self):
        """运行交互式对话"""
        print("=" * 60)
        print("Agent - 基于 Skills 架构")
        print("=" * 60)
        print("已注册的 Skills:")
        for skill_name in self.skill_manager.list_skills():
            skill = self.skill_manager.get_skill(skill_name)
            print(f"  • {skill_name}: {skill.description}")
        print("=" * 60)
        print("提示：输入 'quit' 或 'exit' 退出程序")
        print("示例问题：")
        print("  - 北京今天天气怎么样？")
        print("  - 给我看看最新的科技新闻")
        print("  - 上海的天气和今天的新闻")
        print("=" * 60)
        print()
        
        conversation_history = []
        
        while True:
            try:
                user_input = input("\n你: ").strip()
                
                if user_input.lower() in self.exit_commands:
                    print("\n再见！")
                    break
                
                if not user_input:
                    continue
                
                print("\nAgent: ", end="", flush=True)
                response = self.chat(user_input, conversation_history)
                print(response)
                
                # 更新对话历史（保留最近N条消息）
                if self.enable_history:
                    conversation_history.append({"role": "user", "content": user_input})
                    conversation_history.append({"role": "assistant", "content": response})
                    if len(conversation_history) > self.max_history_length:
                        conversation_history = conversation_history[-self.max_history_length:]
                    
            except KeyboardInterrupt:
                print("\n\n程序已中断")
                break
            except Exception as e:
                print(f"\n错误: {str(e)}")


def main():
    """主函数"""
    try:
        agent = Agent()
        agent.run_interactive()
    except ValueError as e:
        print(f"配置错误: {e}")
        print("\n请确保：")
        print("1. 创建 .env 文件")
        print("2. 设置 OPENAI_API_KEY=your_api_key")
        print("3. （可选）设置 WEATHER_API_KEY 和 NEWS_API_KEY")
    except Exception as e:
        print(f"运行错误: {e}")


if __name__ == "__main__":
    main()

