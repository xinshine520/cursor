"""
对比 Token 消耗：标准版 vs 优化版
演示按需加载 Skills 如何节省 Token
"""
import os
from agent import Agent
from agent_optimized import OptimizedAgent


def compare_token_usage():
    """对比两种实现的 Token 使用情况"""
    
    print("=" * 60)
    print("Token 消耗对比：标准版 vs 优化版")
    print("=" * 60)
    
    # 测试用例
    test_cases = [
        ("你好", "不需要任何 Skill"),
        ("北京今天天气怎么样？", "需要天气 Skill"),
        ("给我看看最新的科技新闻", "需要新闻 Skill"),
        ("上海的天气和今天的新闻", "需要两个 Skills"),
    ]
    
    print("\n测试场景：")
    print("-" * 60)
    
    for i, (query, description) in enumerate(test_cases, 1):
        print(f"\n场景 {i}: {query}")
        print(f"  预期: {description}")
        
        # 标准版（总是发送所有函数定义）
        print("\n  [标准版 agent.py]")
        print("    → 发送所有函数定义（2个，约150 tokens）")
        print("    → LLM 决定是否调用")
        
        # 优化版（智能选择）
        print("\n  [优化版 agent_optimized.py]")
        if description == "不需要任何 Skill":
            print("    → 不发送函数定义（0 tokens）✅ 节省 150 tokens")
        elif "两个" in description:
            print("    → 发送所有函数定义（2个，约150 tokens）")
            print("    → （多意图场景，需要全部加载）")
        else:
            print("    → 只发送相关函数定义（1个，约75 tokens）✅ 节省 75 tokens")
    
    print("\n" + "=" * 60)
    print("关键理解：")
    print("=" * 60)
    print("""
1. Skill 执行本身不消耗 Token
   - skill.execute() 是本地函数调用
   - 只有 API 调用才消耗 Token

2. Function Definitions 消耗 Token
   - 每次发送给 LLM 的函数定义都会计入输入 Token
   - 优化目标是减少不必要的函数定义

3. 按需调用是双向的
   - LLM 决定是否调用（按需执行）✅ 已实现
   - 我们可以决定发送哪些定义（按需加载）✅ 优化版实现

4. Token 节省估算
   - 每个函数定义：约 75 tokens
   - 如果有 10 个 Skills，但每次只用 1-2 个
   - 每次对话可节省：600-675 tokens
   - 每天 100 次对话：节省 60,000-67,500 tokens
    """)


def demo_smart_routing():
    """演示智能路由功能"""
    
    print("\n" + "=" * 60)
    print("智能路由演示")
    print("=" * 60)
    
    # 注意：这里只是演示，不实际调用 API
    from agent_optimized import IntentClassifier
    
    # 创建 IntentClassifier 实例（现在需要实例化）
    classifier = IntentClassifier()
    
    test_messages = [
        "你好",
        "北京今天天气怎么样？",
        "给我看看最新的科技新闻",
        "上海的天气和今天的新闻",
    ]
    
    print("\n意图识别结果：")
    print("-" * 60)
    
    for msg in test_messages:
        intent = classifier.classify_intent(msg)
        use_all = classifier.should_use_all_skills(msg)
        
        print(f"\n用户: {msg}")
        print(f"  识别到的 Skills: {list(intent) if intent else '无'}")
        print(f"  是否加载所有: {'是' if use_all else '否'}")
        
        if not intent and not use_all:
            print(f"  → 不发送函数定义 ✅ 节省 Token")
        elif use_all:
            print(f"  → 发送所有函数定义（多意图场景）")
        else:
            print(f"  → 只发送 {len(intent)} 个相关函数定义 ✅ 节省 Token")


if __name__ == "__main__":
    compare_token_usage()
    demo_smart_routing()
    
    print("\n" + "=" * 60)
    print("使用建议")
    print("=" * 60)
    print("""
1. Skills 数量少（<5个）：
   → 使用 agent.py（标准版）
   → Token 节省不明显，代码更简单

2. Skills 数量多（>5个）：
   → 使用 agent_optimized.py（优化版）
   → Token 节省显著，用户体验更好

3. 需要精确控制：
   → 手动选择需要的 Skills
   → 或自定义意图分类器
    """)

