"""
天气 Skill
提供天气查询功能
"""
import os
import requests
from typing import Dict, Any, Optional
from .base_skill import BaseSkill
import sys
from pathlib import Path

# 添加父目录到路径，以便导入 config
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import get_config


class WeatherSkill(BaseSkill):
    """天气查询 Skill"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None,
                 timeout: Optional[int] = None, default_lang: Optional[str] = None):
        """
        初始化天气 Skill
        :param api_key: OpenWeatherMap API密钥（可选，优先使用参数，其次配置文件，最后环境变量）
        :param base_url: 天气API的基础URL（可选）
        :param timeout: 请求超时时间（秒）
        :param default_lang: 默认语言
        """
        super().__init__(
            name="get_weather",
            description="获取指定城市的当前天气信息，包括温度、湿度、风速、气压等"
        )
        
        # 从配置文件读取配置
        config = get_config().get_weather_config()
        
        self.api_key = api_key or config["api_key"]
        self.base_url = base_url or config["base_url"]
        self.timeout = timeout or config["timeout"]
        self.default_lang = default_lang or config["default_lang"]
    
    def execute(self, city: str, units: str = "metric") -> Dict[str, Any]:
        """
        执行天气查询
        :param city: 城市名称
        :param units: 单位（metric=摄氏度, imperial=华氏度）
        :return: 天气信息字典
        """
        if self.api_key:
            try:
                params = {
                    "q": city,
                    "appid": self.api_key,
                    "units": units,
                    "lang": self.default_lang
                }
                response = requests.get(self.base_url, params=params, timeout=self.timeout)
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "description": data["weather"][0]["description"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "pressure": data["main"]["pressure"],
                    "units": "°C" if units == "metric" else "°F"
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"获取天气信息失败: {str(e)}",
                    "city": city
                }
        else:
            # 模拟天气数据（用于演示）
            return {
                "success": True,
                "city": city,
                "country": "CN",
                "temperature": 22,
                "feels_like": 24,
                "description": "晴朗",
                "humidity": 65,
                "wind_speed": 3.5,
                "pressure": 1013,
                "units": "°C",
                "note": "这是模拟数据，请配置WEATHER_API_KEY使用真实API"
            }
    
    def get_function_definition(self) -> Dict[str, Any]:
        """返回 OpenAI 函数调用定义"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "城市名称，例如：北京、上海、New York"
                        },
                        "units": {
                            "type": "string",
                            "enum": ["metric", "imperial"],
                            "description": "温度单位，metric为摄氏度，imperial为华氏度",
                            "default": "metric"
                        }
                    },
                    "required": ["city"]
                }
            }
        }
    
    def validate_params(self, params: Dict[str, Any]) -> bool:
        """验证参数"""
        if "city" not in params or not params["city"]:
            return False
        if "units" in params and params["units"] not in ["metric", "imperial"]:
            return False
        return True

