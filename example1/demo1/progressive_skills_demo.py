"""
渐进式 Skill 实现演示
展示不同场景下的 Skill 加载策略
"""
from agent_optimized import OptimizedAgent, IntentClassifier
from config import get_config


def demo_progressive_loading():
    """演示渐进式加载的不同场景"""
    
    print("=" * 70)
    print("渐进式 Skill 加载演示")
    print("=" * 70)
    
    # 创建意图分类器
    classifier = IntentClassifier()
    
    # 测试场景
    test_scenarios = [
        {
            "message": "你好",
            "description": "简单问候，无需任何 Skill",
            "expected_skills": set(),
            "should_load_all": True
        },
        {
            "message": "北京今天天气怎么样？",
            "description": "明确需要天气 Skill",
            "expected_skills": {"get_weather"},
            "should_load_all": False
        },
        {
            "message": "给我看看最新的科技新闻",
            "description": "明确需要新闻 Skill",
            "expected_skills": {"get_news"},
            "should_load_all": False
        },
        {
            "message": "上海的天气和今天的新闻",
            "description": "需要多个 Skills（天气 + 新闻）",
            "expected_skills": {"get_weather", "get_news"},
            "should_load_all": True
        },
        {
            "message": "帮我做点什么",
            "description": "意图不明确，无关键词匹配",
            "expected_skills": set(),
            "should_load_all": True
        },
        {
            "message": "温度",
            "description": "短消息，触发降级策略",
            "expected_skills": {"get_weather"},
            "should_load_all": True  # 消息太短，触发降级
        }
    ]
    
    print("\n场景分析：")
    print("-" * 70)
    
    for i, scenario in enumerate(test_scenarios, 1):
        message = scenario["message"]
        description = scenario["description"]
        
        # 意图识别
        detected_skills = classifier.classify_intent(message)
        should_load_all = classifier.should_use_all_skills(message)
        
        print(f"\n场景 {i}: {message}")
        print(f"  描述: {description}")
        print(f"  识别到的 Skills: {list(detected_skills) if detected_skills else '无'}")
        print(f"  是否加载所有: {'是' if should_load_all else '否'}")
        
        # 判断加载策略
        if should_load_all:
            load_strategy = "加载所有 Skills（降级策略）"
            tokens_used = 150  # 假设 2 个 Skills
        elif detected_skills:
            load_strategy = f"只加载 {len(detected_skills)} 个相关 Skills"
            tokens_used = len(detected_skills) * 75
        else:
            load_strategy = "加载所有 Skills（未识别意图）"
            tokens_used = 150
        
        print(f"  加载策略: {load_strategy}")
        print(f"  预计 Token: {tokens_used}")
        
        # 计算节省
        if not should_load_all and detected_skills:
            tokens_saved = 150 - tokens_used
            print(f"  ✅ 节省 Token: {tokens_saved}")


def demo_token_savings():
    """演示 Token 节省效果"""
    
    print("\n" + "=" * 70)
    print("Token 节省效果分析")
    print("=" * 70)
    
    # 模拟 100 次对话
    scenarios = [
        ("简单对话", 30, 0),      # 30% 简单对话，无需 Skill
        ("单一 Skill", 50, 1),    # 50% 需要 1 个 Skill
        ("多 Skills", 20, 2),     # 20% 需要多个 Skills
    ]
    
    print("\n假设 100 次对话的分布：")
    print("-" * 70)
    
    total_tokens_traditional = 0
    total_tokens_progressive = 0
    
    for scenario_name, count, skills_needed in scenarios:
        tokens_traditional = count * 150  # 传统方式：总是发送所有
        tokens_progressive = count * (skills_needed * 75 if skills_needed > 0 else 0)
        
        total_tokens_traditional += tokens_traditional
        total_tokens_progressive += tokens_progressive
        
        print(f"\n{scenario_name}: {count} 次")
        print(f"  传统方式: {tokens_traditional} tokens")
        print(f"  渐进式: {tokens_progressive} tokens")
        print(f"  节省: {tokens_traditional - tokens_progressive} tokens")
    
    print("\n" + "-" * 70)
    print(f"总计（100 次对话）:")
    print(f"  传统方式: {total_tokens_traditional} tokens")
    print(f"  渐进式: {total_tokens_progressive} tokens")
    print(f"  总节省: {total_tokens_traditional - total_tokens_progressive} tokens")
    print(f"  节省率: {(1 - total_tokens_progressive / total_tokens_traditional) * 100:.1f}%")


def demo_intent_classification():
    """演示意图分类的详细过程"""
    
    print("\n" + "=" * 70)
    print("意图分类详细过程")
    print("=" * 70)
    
    classifier = IntentClassifier()
    config = get_config()
    keywords = config.get_intent_classifier_config()["keywords"]
    
    print("\n配置的关键词：")
    print("-" * 70)
    for skill_name, keyword_list in keywords.items():
        print(f"\n{skill_name}:")
        print(f"  {', '.join(keyword_list[:5])}..." if len(keyword_list) > 5 else f"  {', '.join(keyword_list)}")
    
    test_messages = [
        "北京天气",
        "今天温度多少",
        "科技新闻",
        "最新头条",
        "天气和新闻",
    ]
    
    print("\n\n意图识别过程：")
    print("-" * 70)
    
    for message in test_messages:
        print(f"\n用户消息: \"{message}\"")
        print(f"  处理: 转换为小写 -> \"{message.lower()}\"")
        
        detected_skills = classifier.classify_intent(message)
        print(f"  匹配过程:")
        
        for skill_name, keyword_list in keywords.items():
            matched_keywords = [kw for kw in keyword_list if kw.lower() in message.lower()]
            if matched_keywords:
                print(f"    ✓ {skill_name}: 匹配到关键词 {matched_keywords[0]}")
            else:
                print(f"    ✗ {skill_name}: 无匹配")
        
        print(f"  结果: {list(detected_skills) if detected_skills else '无匹配'}")


def demo_fallback_strategy():
    """演示降级策略"""
    
    print("\n" + "=" * 70)
    print("智能降级策略演示")
    print("=" * 70)
    
    classifier = IntentClassifier()
    
    fallback_scenarios = [
        {
            "message": "你好",
            "reason": "消息太短（<5字符）",
            "check": lambda m: len(m) < 5
        },
        {
            "message": "天气和新闻",
            "reason": "包含连接词",
            "check": lambda m: any(conn in m for conn in classifier.connectors)
        },
        {
            "message": "帮我做点什么",
            "reason": "未识别到任何意图",
            "check": lambda m: len(classifier.classify_intent(m)) == 0
        },
        {
            "message": "北京天气和上海新闻",
            "reason": "包含多个意图",
            "check": lambda m: len(classifier.classify_intent(m)) > 1
        }
    ]
    
    print("\n降级场景：")
    print("-" * 70)
    
    for scenario in fallback_scenarios:
        message = scenario["message"]
        reason = scenario["reason"]
        check = scenario["check"]
        
        should_fallback = classifier.should_use_all_skills(message)
        check_result = check(message)
        
        print(f"\n消息: \"{message}\"")
        print(f"  原因: {reason}")
        print(f"  检查结果: {'触发降级' if check_result else '不触发'}")
        print(f"  最终决策: {'加载所有 Skills' if should_fallback else '按需加载'}")
        
        if should_fallback:
            print(f"  ⚠️  降级策略：为保证功能可用性，加载所有 Skills")


if __name__ == "__main__":
    demo_progressive_loading()
    demo_token_savings()
    demo_intent_classification()
    demo_fallback_strategy()
    
    print("\n" + "=" * 70)
    print("总结")
    print("=" * 70)
    print("""
渐进式 Skill 实现的核心优势：

1. ✅ Token 节省：根据场景可节省 50-90% 的 Token
2. ✅ 智能路由：基于意图识别，只加载需要的 Skills
3. ✅ 降级保护：未识别意图时自动加载所有，保证功能可用
4. ✅ 动态扩展：支持运行时注册新 Skills，无需重启
5. ✅ 可配置：关键词、降级策略等均可配置

适用场景：
- Skills 数量较多（>5）
- 高频对话场景
- 对成本敏感的应用
- 需要个性化服务的系统
    """)

