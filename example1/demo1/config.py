"""
配置管理模块
支持从配置文件和环境变量读取配置
"""
import os
import json
from typing import Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Config:
    """配置管理类"""
    
    def __init__(self, config_file: Optional[str] = None):
        """
        初始化配置
        :param config_file: 配置文件路径（可选，默认使用 config.json）
        """
        self.config_file = config_file or os.path.join(
            os.path.dirname(__file__), "config.json"
        )
        self._config: Dict[str, Any] = {}
        self._load_config()
    
    def _load_config(self):
        """加载配置文件"""
        # 先加载默认配置
        self._config = self._get_default_config()
        
        # 如果配置文件存在，加载并合并
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                    self._merge_config(self._config, file_config)
            except Exception as e:
                print(f"警告: 加载配置文件失败: {e}，使用默认配置")
    
    def _merge_config(self, base: Dict, override: Dict):
        """递归合并配置"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_config(base[key], value)
            else:
                base[key] = value
    
    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            "agent": {
                "openai": {
                    "api_key": None,  # 从环境变量读取
                    "model": "gpt-4o-mini",
                    "base_url": None,  # 从环境变量读取
                    "timeout": 30
                },
                "conversation": {
                    "max_history_length": 20,
                    "enable_history": True
                },
                "smart_routing": {
                    "enabled": True,
                    "min_message_length": 5
                },
                "ui": {
                    "exit_commands": ["quit", "exit", "退出"],
                    "show_stats_command": "stats",
                    "prompt_prefix": "你: ",
                    "response_prefix": "Agent: "
                }
            },
            "skills": {
                "weather": {
                    "api_key": None,  # 从环境变量读取
                    "base_url": "https://api.openweathermap.org/data/2.5/weather",
                    "timeout": 10,
                    "default_lang": "zh_cn",
                    "default_units": "metric"
                },
                "news": {
                    "api_key": None,  # 从环境变量读取
                    "base_url": "https://newsapi.org/v2/top-headlines",
                    "timeout": 10,
                    "default_country": "cn",
                    "default_page_size": 5,
                    "max_page_size": 20
                }
            },
            "intent_classifier": {
                "keywords": {
                    "get_weather": [
                        "天气", "温度", "气温", "下雨", "晴天", "阴天", "多云",
                        "weather", "temperature", "rain", "sunny", "cloudy"
                    ],
                    "get_news": [
                        "新闻", "头条", "资讯", "消息", "报道", "news", "headline",
                        "科技", "财经", "体育", "娱乐", "健康", "科学", "技术"
                    ]
                },
                "connectors": ["和", "以及", "还有", "同时", "and", "also", "plus"]
            },
            "logging": {
                "enabled": True,
                "level": "INFO",
                "show_skill_calls": True,
                "show_skill_results": True
            }
        }
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """
        获取配置值（支持点号分隔的路径）
        :param key_path: 配置路径，如 "agent.openai.model"
        :param default: 默认值
        :return: 配置值
        """
        keys = key_path.split(".")
        value = self._config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                # 如果配置中不存在，尝试从环境变量读取
                env_key = key_path.upper().replace(".", "_")
                env_value = os.getenv(env_key)
                if env_value is not None:
                    return self._parse_env_value(env_value)
                return default
        
        # 如果值是 None，尝试从环境变量读取
        if value is None:
            env_key = key_path.upper().replace(".", "_")
            env_value = os.getenv(env_key)
            if env_value is not None:
                return self._parse_env_value(env_value)
        
        return value if value is not None else default
    
    def _parse_env_value(self, value: str) -> Any:
        """解析环境变量值（支持布尔和数字）"""
        if value.lower() in ("true", "1", "yes"):
            return True
        if value.lower() in ("false", "0", "no"):
            return False
        try:
            return int(value)
        except ValueError:
            try:
                return float(value)
            except ValueError:
                return value
    
    def set(self, key_path: str, value: Any):
        """
        设置配置值
        :param key_path: 配置路径
        :param value: 配置值
        """
        keys = key_path.split(".")
        config = self._config
        
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        
        config[keys[-1]] = value
    
    def save(self, file_path: Optional[str] = None):
        """
        保存配置到文件
        :param file_path: 文件路径（可选）
        """
        save_path = file_path or self.config_file
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(self._config, f, ensure_ascii=False, indent=2)
    
    def get_agent_config(self) -> Dict[str, Any]:
        """获取 Agent 配置"""
        return {
            "api_key": self.get("agent.openai.api_key") or os.getenv("OPENAI_API_KEY"),
            "model": self.get("agent.openai.model", "gpt-4o-mini"),
            "base_url": self.get("agent.openai.base_url") or os.getenv("OPENAI_API_URL"),
            "timeout": self.get("agent.openai.timeout", 30),
            "max_history_length": self.get("agent.conversation.max_history_length", 20),
            "enable_history": self.get("agent.conversation.enable_history", True),
            "smart_routing_enabled": self.get("agent.smart_routing.enabled", True),
            "min_message_length": self.get("agent.smart_routing.min_message_length", 5),
            "exit_commands": self.get("agent.ui.exit_commands", ["quit", "exit", "退出"]),
            "show_stats_command": self.get("agent.ui.show_stats_command", "stats"),
        }
    
    def get_weather_config(self) -> Dict[str, Any]:
        """获取天气 Skill 配置"""
        return {
            "api_key": self.get("skills.weather.api_key") or os.getenv("WEATHER_API_KEY"),
            "base_url": self.get("skills.weather.base_url", 
                                "https://api.openweathermap.org/data/2.5/weather"),
            "timeout": self.get("skills.weather.timeout", 10),
            "default_lang": self.get("skills.weather.default_lang", "zh_cn"),
            "default_units": self.get("skills.weather.default_units", "metric")
        }
    
    def get_news_config(self) -> Dict[str, Any]:
        """获取新闻 Skill 配置"""
        return {
            "api_key": self.get("skills.news.api_key") or os.getenv("NEWS_API_KEY"),
            "base_url": self.get("skills.news.base_url",
                                "https://newsapi.org/v2/top-headlines"),
            "timeout": self.get("skills.news.timeout", 10),
            "default_country": self.get("skills.news.default_country", "cn"),
            "default_page_size": self.get("skills.news.default_page_size", 5),
            "max_page_size": self.get("skills.news.max_page_size", 20)
        }
    
    def get_intent_classifier_config(self) -> Dict[str, Any]:
        """获取意图分类器配置"""
        return {
            "keywords": self.get("intent_classifier.keywords", {}),
            "connectors": self.get("intent_classifier.connectors", [])
        }
    
    def get_logging_config(self) -> Dict[str, Any]:
        """获取日志配置"""
        return {
            "enabled": self.get("logging.enabled", True),
            "level": self.get("logging.level", "INFO"),
            "show_skill_calls": self.get("logging.show_skill_calls", True),
            "show_skill_results": self.get("logging.show_skill_results", True)
        }


# 全局配置实例
_config_instance: Optional[Config] = None


def get_config(config_file: Optional[str] = None) -> Config:
    """
    获取全局配置实例（单例模式）
    :param config_file: 配置文件路径（可选）
    :return: Config 实例
    """
    global _config_instance
    if _config_instance is None:
        _config_instance = Config(config_file)
    return _config_instance


def reload_config(config_file: Optional[str] = None):
    """重新加载配置"""
    global _config_instance
    _config_instance = Config(config_file)

