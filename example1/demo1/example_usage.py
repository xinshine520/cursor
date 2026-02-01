"""
Agent 使用示例
演示如何使用基于 Skills 架构的 Agent
"""
import os
from agent import Agent
from skills.weather_skill import WeatherSkill
from skills.news_skill import NewsSkill


def example_1_simple_chat():
    """示例1：简单对话"""
    print("=" * 60)
    print("示例1：简单对话")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = Agent()
    
    # 单次对话
    response = agent.chat("你好，请介绍一下你自己")
    print(f"用户: 你好，请介绍一下你自己")
    print(f"Agent: {response}\n")


def example_2_weather_query():
    """示例2：天气查询"""
    print("=" * 60)
    print("示例2：天气查询")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = Agent()
    
    # 查询天气
    response = agent.chat("北京今天天气怎么样？")
    print(f"用户: 北京今天天气怎么样？")
    print(f"Agent: {response}\n")


def example_3_news_query():
    """示例3：新闻查询"""
    print("=" * 60)
    print("示例3：新闻查询")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = Agent()
    
    # 查询新闻
    response = agent.chat("给我看看最新的科技新闻")
    print(f"用户: 给我看看最新的科技新闻")
    print(f"Agent: {response}\n")


def example_4_direct_skill_call():
    """示例4：直接调用 Skill（不需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例4：直接调用 Skill")
    print("=" * 60)
    
    # 直接使用天气 Skill
    weather_skill = WeatherSkill()
    result = weather_skill.execute(city="上海")
    print("天气 Skill 调用结果:")
    if result.get("success"):
        print(f"  城市: {result.get('city')}")
        print(f"  温度: {result.get('temperature')}{result.get('units')}")
        print(f"  天气: {result.get('description')}")
    else:
        print(f"  错误: {result.get('error')}")
    print()
    
    # 直接使用新闻 Skill
    news_skill = NewsSkill()
    result = news_skill.execute(country="cn", page_size=3)
    print("新闻 Skill 调用结果:")
    if result.get("success"):
        for i, article in enumerate(result.get('articles', []), 1):
            print(f"  {i}. {article.get('title')}")
    else:
        print(f"  错误: {result.get('error')}")
    print()


def example_5_custom_skill():
    """示例5：注册自定义 Skill"""
    print("=" * 60)
    print("示例5：注册自定义 Skill")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = Agent()
    
    # 显示已注册的 Skills
    print("已注册的 Skills:")
    for skill_name in agent.skill_manager.list_skills():
        print(f"  • {skill_name}")
    print()


def example_6_conversation_history():
    """示例6：带对话历史的连续对话"""
    print("=" * 60)
    print("示例6：连续对话")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = Agent()
    conversation = []
    
    # 第一轮对话
    user_msg1 = "北京今天天气怎么样？"
    response1 = agent.chat(user_msg1, conversation)
    print(f"用户: {user_msg1}")
    print(f"Agent: {response1}\n")
    
    # 第二轮对话（带上下文）
    user_msg2 = "那明天呢？"
    response2 = agent.chat(user_msg2, conversation)
    print(f"用户: {user_msg2}")
    print(f"Agent: {response2}\n")


def main():
    """运行所有示例"""
    print("\n" + "=" * 60)
    print("Agent 使用示例（基于 Skills 架构）")
    print("=" * 60)
    print("\n提示：部分示例需要设置OPENAI_API_KEY环境变量")
    print("=" * 60 + "\n")
    
    # 运行示例
    example_4_direct_skill_call()  # 这个不需要API密钥
    
    # 需要API密钥的示例
    example_1_simple_chat()
    example_2_weather_query()
    example_3_news_query()
    example_5_custom_skill()
    example_6_conversation_history()
    
    print("=" * 60)
    print("所有示例运行完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()

