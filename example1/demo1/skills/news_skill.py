"""
新闻 Skill
提供新闻查询功能
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


class NewsSkill(BaseSkill):
    """新闻查询 Skill"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None,
                 timeout: Optional[int] = None, default_country: Optional[str] = None,
                 default_page_size: Optional[int] = None, max_page_size: Optional[int] = None):
        """
        初始化新闻 Skill
        :param api_key: NewsAPI密钥（可选，优先使用参数，其次配置文件，最后环境变量）
        :param base_url: 新闻API的基础URL（可选）
        :param timeout: 请求超时时间（秒）
        :param default_country: 默认国家代码
        :param default_page_size: 默认返回数量
        :param max_page_size: 最大返回数量
        """
        super().__init__(
            name="get_news",
            description="获取指定国家或类别的新闻头条"
        )
        
        # 从配置文件读取配置
        config = get_config().get_news_config()
        
        self.api_key = api_key or config["api_key"]
        self.base_url = base_url or config["base_url"]
        self.timeout = timeout or config["timeout"]
        self.default_country = default_country or config["default_country"]
        self.default_page_size = default_page_size or config["default_page_size"]
        self.max_page_size = max_page_size or config["max_page_size"]
    
    def execute(self, country: Optional[str] = None, category: Optional[str] = None, 
                page_size: Optional[int] = None) -> Dict[str, Any]:
        """
        执行新闻查询
        :param country: 国家代码，例如：cn（中国）、us（美国）
        :param category: 新闻类别（可选）：business, entertainment, general, health, science, sports, technology
        :param page_size: 返回的新闻数量
        :return: 新闻信息字典
        """
        # 使用默认值
        country = country or self.default_country
        page_size = page_size or self.default_page_size
        
        if self.api_key:
            try:
                params = {
                    "country": country,
                    "apiKey": self.api_key,
                    "pageSize": page_size
                }
                if category:
                    params["category"] = category
                
                response = requests.get(self.base_url, params=params, timeout=self.timeout)
                response.raise_for_status()
                data = response.json()
                
                articles = []
                for article in data.get("articles", [])[:page_size]:
                    articles.append({
                        "title": article.get("title", ""),
                        "description": article.get("description", ""),
                        "source": article.get("source", {}).get("name", ""),
                        "url": article.get("url", ""),
                        "published_at": article.get("publishedAt", "")
                    })
                
                return {
                    "success": True,
                    "status": "success",
                    "total_results": data.get("totalResults", 0),
                    "articles": articles
                }
            except Exception as e:
                return {
                    "success": False,
                    "status": "error",
                    "error": f"获取新闻失败: {str(e)}"
                }
        else:
            # 模拟新闻数据（用于演示）
            return {
                "success": True,
                "status": "success",
                "total_results": 5,
                "articles": [
                    {
                        "title": "人工智能技术取得重大突破",
                        "description": "最新研究显示，AI在自然语言处理领域取得显著进展",
                        "source": "科技日报",
                        "url": "https://example.com/news/1",
                        "published_at": "2024-01-15T10:00:00Z"
                    },
                    {
                        "title": "全球气候变化会议召开",
                        "description": "各国代表齐聚一堂，讨论应对气候变化的措施",
                        "source": "环境时报",
                        "url": "https://example.com/news/2",
                        "published_at": "2024-01-15T09:30:00Z"
                    },
                    {
                        "title": "新能源汽车销量创新高",
                        "description": "今年新能源汽车市场持续增长，销量同比增长30%",
                        "source": "财经周刊",
                        "url": "https://example.com/news/3",
                        "published_at": "2024-01-15T08:15:00Z"
                    }
                ],
                "note": "这是模拟数据，请配置NEWS_API_KEY使用真实API"
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
                        "country": {
                            "type": "string",
                            "description": "国家代码，例如：cn（中国）、us（美国）、gb（英国）",
                            "default": self.default_country
                        },
                        "category": {
                            "type": "string",
                            "enum": ["business", "entertainment", "general", "health", 
                                    "science", "sports", "technology"],
                            "description": "新闻类别（可选）"
                        },
                        "page_size": {
                            "type": "integer",
                            "description": f"返回的新闻数量，默认{self.default_page_size}条",
                            "default": self.default_page_size,
                            "minimum": 1,
                            "maximum": self.max_page_size
                        }
                    }
                }
            }
        }
    
    def validate_params(self, params: Dict[str, Any]) -> bool:
        """验证参数"""
        if "page_size" in params:
            page_size = params["page_size"]
            if not isinstance(page_size, int) or page_size < 1 or page_size > self.max_page_size:
                return False
        if "category" in params and params["category"]:
            valid_categories = ["business", "entertainment", "general", "health", 
                              "science", "sports", "technology"]
            if params["category"] not in valid_categories:
                return False
        return True

