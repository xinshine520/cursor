"""
Agent程序的简单测试脚本
用于验证基本功能是否正常
"""
import os
import sys
from agent import WeatherService, NewsService, OpenAIAgent


def test_weather_service():
    """测试天气服务"""
    print("测试天气服务...")
    weather = WeatherService()
    
    # 测试获取天气（使用模拟数据）
    result = weather.get_weather("北京")
    print(f"  结果: {result}")
    
    # 测试函数定义
    func_def = WeatherService.get_function_definition()
    assert func_def["function"]["name"] == "get_weather"
    print("  ✓ 天气服务测试通过")


def test_news_service():
    """测试新闻服务"""
    print("测试新闻服务...")
    news = NewsService()
    
    # 测试获取新闻（使用模拟数据）
    result = news.get_news(country="cn", page_size=3)
    print(f"  结果: 获取到 {len(result.get('articles', []))} 条新闻")
    
    # 测试函数定义
    func_def = NewsService.get_function_definition()
    assert func_def["function"]["name"] == "get_news"
    print("  ✓ 新闻服务测试通过")


def test_agent_initialization():
    """测试Agent初始化"""
    print("测试Agent初始化...")
    
    # 检查是否有API密钥
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("  ⚠ 未设置OPENAI_API_KEY，跳过Agent初始化测试")
        print("  提示：设置OPENAI_API_KEY后可以测试完整功能")
        return
    
    try:
        agent = OpenAIAgent()
        print(f"  ✓ Agent初始化成功，使用模型: {agent.model}")
        print(f"  ✓ 已注册 {len(agent.functions)} 个MCP工具")
    except Exception as e:
        print(f"  ✗ Agent初始化失败: {e}")


def main():
    """主测试函数"""
    print("=" * 60)
    print("Agent程序测试")
    print("=" * 60)
    print()
    
    try:
        test_weather_service()
        print()
        test_news_service()
        print()
        test_agent_initialization()
        print()
        print("=" * 60)
        print("测试完成！")
        print("=" * 60)
    except Exception as e:
        print(f"\n测试失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

