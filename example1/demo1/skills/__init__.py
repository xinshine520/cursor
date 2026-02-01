"""
Skills 模块
提供各种 Skill 实现
"""
from .base_skill import BaseSkill
from .weather_skill import WeatherSkill
from .news_skill import NewsSkill

__all__ = ["BaseSkill", "WeatherSkill", "NewsSkill"]

