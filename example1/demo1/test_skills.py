"""
Skills 测试脚本
用于验证 Skills 的基本功能
"""
import sys
from skills.weather_skill import WeatherSkill
from skills.news_skill import NewsSkill
from skill_manager import SkillManager


def test_weather_skill():
    """测试天气 Skill"""
    print("=" * 60)
    print("测试天气 Skill")
    print("=" * 60)
    
    weather = WeatherSkill()
    
    # 测试执行
    result = weather.execute(city="北京")
    print(f"执行结果: {result}")
    
    # 测试函数定义
    func_def = weather.get_function_definition()
    assert func_def["function"]["name"] == "get_weather"
    print("✓ 函数定义正确")
    
    # 测试参数验证
    assert weather.validate_params({"city": "上海"}) == True
    assert weather.validate_params({"city": ""}) == False
    print("✓ 参数验证正确")
    
    print("✓ 天气 Skill 测试通过\n")


def test_news_skill():
    """测试新闻 Skill"""
    print("=" * 60)
    print("测试新闻 Skill")
    print("=" * 60)
    
    news = NewsSkill()
    
    # 测试执行
    result = news.execute(country="cn", page_size=3)
    print(f"执行结果: 获取到 {len(result.get('articles', []))} 条新闻")
    
    # 测试函数定义
    func_def = news.get_function_definition()
    assert func_def["function"]["name"] == "get_news"
    print("✓ 函数定义正确")
    
    # 测试参数验证
    assert news.validate_params({"country": "us"}) == True
    assert news.validate_params({"page_size": 25}) == False  # 超过最大值
    print("✓ 参数验证正确")
    
    print("✓ 新闻 Skill 测试通过\n")


def test_skill_manager():
    """测试 Skill 管理器"""
    print("=" * 60)
    print("测试 Skill 管理器")
    print("=" * 60)
    
    manager = SkillManager()
    
    # 注册 Skills
    weather = WeatherSkill()
    news = NewsSkill()
    
    manager.register_skill(weather)
    manager.register_skill(news)
    
    # 测试列出 Skills
    skills_list = manager.list_skills()
    assert len(skills_list) == 2
    assert "get_weather" in skills_list
    assert "get_news" in skills_list
    print(f"✓ 已注册 Skills: {skills_list}")
    
    # 测试获取 Skill
    skill = manager.get_skill("get_weather")
    assert skill is not None
    assert skill.name == "get_weather"
    print("✓ 获取 Skill 成功")
    
    # 测试执行 Skill
    result = manager.execute_skill("get_weather", city="上海")
    assert result.get("success") is not None
    print("✓ 执行 Skill 成功")
    
    # 测试注销 Skill
    manager.unregister_skill("get_news")
    assert "get_news" not in manager.list_skills()
    print("✓ 注销 Skill 成功")
    
    # 测试获取函数定义
    func_defs = manager.get_all_function_definitions()
    assert len(func_defs) == 1  # 只剩下 weather
    print("✓ 获取函数定义成功")
    
    print("✓ Skill 管理器测试通过\n")


def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("Skills 测试")
    print("=" * 60 + "\n")
    
    try:
        test_weather_skill()
        test_news_skill()
        test_skill_manager()
        
        print("=" * 60)
        print("所有测试通过！")
        print("=" * 60)
    except Exception as e:
        print(f"\n测试失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

