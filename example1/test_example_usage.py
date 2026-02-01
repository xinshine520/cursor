"""
example_usage 示例函数的测试用例

使用 pytest，对示例中暴露的函数进行基础行为验证：
- 避免真实请求 OpenAI / 外部 API
- 验证在不同环境变量条件下的分支逻辑
"""

import os
from typing import List

import pytest

import example_usage


def _assert_in_output(lines: List[str], keyword: str) -> bool:
    """辅助函数：判断关键字是否出现在输出行中"""
    return any(keyword in line for line in lines)


def test_example_4_direct_service_call(capsys):
    """
    example_4_direct_service_call 不依赖 OPENAI_API_KEY，
    主要验证调用不会抛异常且有预期关键字输出。
    """
    example_usage.example_4_direct_service_call()

    captured = capsys.readouterr()
    out_lines = captured.out.splitlines()

    # 验证打印了模块标题
    assert _assert_in_output(out_lines, "示例4：直接调用服务")
    # 验证包含天气/新闻调用结果关键字
    assert _assert_in_output(out_lines, "天气服务调用结果")
    assert _assert_in_output(out_lines, "新闻服务调用结果")


def test_example_1_simple_chat_without_api_key(monkeypatch, capsys):
    """当未设置 OPENAI_API_KEY 时，应提示跳过示例。"""
    # 确保环境变量不存在
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    example_usage.example_1_simple_chat()
    captured = capsys.readouterr()

    assert "未设置OPENAI_API_KEY，跳过此示例" in captured.out


def test_example_1_simple_chat_with_api_key(monkeypatch, capsys):
    """
    当设置了 OPENAI_API_KEY 时：
    - 通过 monkeypatch 替换 OpenAIAgent，避免真实调用 OpenAI
    - 验证输出包含我们模拟的返回内容
    """

    class DummyAgent:
        def __init__(self, *_, **__):
            self.model = "dummy-model"

        def chat(self, message: str, conversation_history=None) -> str:
            # 简单回显，方便断言
            return f"fake-response-for: {message}"

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(example_usage, "OpenAIAgent", DummyAgent)

    example_usage.example_1_simple_chat()
    captured = capsys.readouterr()

    # 标题输出
    assert "示例1：简单对话" in captured.out
    # 我们构造的虚假返回值
    assert "fake-response-for: 你好，请介绍一下你自己" in captured.out


def test_example_2_weather_query_with_api_key(monkeypatch, capsys):
    """测试示例2：使用假的 Agent，验证函数流程正确执行。"""

    class DummyAgent:
        def __init__(self, *_, **__):
            self.model = "dummy-model"

        def chat(self, message: str, conversation_history=None) -> str:
            return f"weather-info-for: {message}"

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(example_usage, "OpenAIAgent", DummyAgent)

    example_usage.example_2_weather_query()
    captured = capsys.readouterr()

    assert "示例2：天气查询" in captured.out
    assert "weather-info-for: 北京今天天气怎么样？" in captured.out


def test_example_3_news_query_with_api_key(monkeypatch, capsys):
    """测试示例3：使用假的 Agent，验证函数流程正确执行。"""

    class DummyAgent:
        def __init__(self, *_, **__):
            self.model = "dummy-model"

        def chat(self, message: str, conversation_history=None) -> str:
            return f"news-info-for: {message}"

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(example_usage, "OpenAIAgent", DummyAgent)

    example_usage.example_3_news_query()
    captured = capsys.readouterr()

    assert "示例3：新闻查询" in captured.out
    assert "news-info-for: 给我看看最新的科技新闻" in captured.out


def test_example_5_conversation_history_with_api_key(monkeypatch, capsys):
    """测试示例5：带对话历史的连续对话流程。"""

    class DummyAgent:
        def __init__(self, *_, **__):
            self.model = "dummy-model"
            self._count = 0

        def chat(self, message: str, conversation_history=None) -> str:
            # 根据调用顺序返回不同内容，方便断言
            self._count += 1
            if self._count == 1:
                return "first-turn-response"
            return "second-turn-response"

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(example_usage, "OpenAIAgent", DummyAgent)

    example_usage.example_5_conversation_history()
    captured = capsys.readouterr()

    out = captured.out
    assert "示例5：连续对话" in out
    assert "北京今天天气怎么样？" in out
    assert "那明天呢？" in out
    assert "first-turn-response" in out
    assert "second-turn-response" in out


def test_main_runs_without_error(monkeypatch, capsys):
    """
    对 example_usage.main 做一个烟雾测试：
    - 使用假的 Agent 避免真实网络调用
    - 确保整体流程可执行
    """

    class DummyAgent:
        def __init__(self, *_, **__):
            self.model = "dummy-model"

        def chat(self, message: str, conversation_history=None) -> str:
            return f"dummy: {message}"

    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setattr(example_usage, "OpenAIAgent", DummyAgent)

    example_usage.main()
    captured = capsys.readouterr()

    # 验证主流程标题存在
    assert "Agent使用示例" in captured.out


