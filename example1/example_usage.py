"""
Agent使用示例
演示如何在代码中使用Agent
"""
import os
from agent import OpenAIAgent, WeatherService, NewsService


def example_1_simple_chat():
    """示例1：简单对话（需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例1：简单对话")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = OpenAIAgent()
    
    # 单次对话
    response = agent.chat("你好，请介绍一下你自己")
    print(f"用户: 你好，请介绍一下你自己")
    print(f"Agent: {response}\n")


def example_2_weather_query():
    """示例2：天气查询（需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例2：天气查询")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = OpenAIAgent()
    
    # 查询天气
    response = agent.chat("北京今天天气怎么样？")
    print(f"用户: 北京今天天气怎么样？")
    print(f"Agent: {response}\n")


def example_3_news_query():
    """示例3：新闻查询（需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例3：新闻查询")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = OpenAIAgent()
    
    # 查询新闻
    response = agent.chat("给我看看最新的科技新闻")
    print(f"用户: 给我看看最新的科技新闻")
    print(f"Agent: {response}\n")


def example_4_direct_service_call():
    """示例4：直接调用服务（不需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例4：直接调用服务")
    print("=" * 60)
    
    # 直接使用天气服务
    weather = WeatherService()
    result = weather.get_weather("上海")
    print("天气服务调用结果:")
    print(f"  城市: {result.get('city')}")
    print(f"  温度: {result.get('temperature')}{result.get('units')}")
    print(f"  天气: {result.get('description')}")
    print()
    
    # 直接使用新闻服务
    news = NewsService()
    result = news.get_news(country="cn", page_size=3)
    print("新闻服务调用结果:")
    for i, article in enumerate(result.get('articles', []), 1):
        print(f"  {i}. {article.get('title')}")
    print()


def example_5_conversation_history():
    """示例5：带对话历史的连续对话（需要OPENAI_API_KEY）"""
    print("=" * 60)
    print("示例5：连续对话")
    print("=" * 60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠ 未设置OPENAI_API_KEY，跳过此示例")
        return
    
    agent = OpenAIAgent()
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
    print("Agent使用示例")
    print("=" * 60)
    print("\n提示：部分示例需要设置OPENAI_API_KEY环境变量")
    print("=" * 60 + "\n")
    
    # 运行示例
    example_4_direct_service_call()  # 这个不需要API密钥
    
    # 需要API密钥的示例
    example_1_simple_chat()
    example_2_weather_query()
    example_3_news_query()
    example_5_conversation_history()
    
    print("=" * 60)
    print("所有示例运行完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()

