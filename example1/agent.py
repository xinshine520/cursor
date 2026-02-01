"""
基于OpenAI的Agent程序，支持MCP调用天气和新闻服务
"""
import os
import json
import requests
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class WeatherService:
    """天气服务MCP工具"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        初始化天气服务
        :param api_key: OpenWeatherMap API密钥（可选，如果未提供则使用模拟数据）
        :param base_url: 天气API的基础URL（可选，从配置文件读取或使用默认值）
        """
        self.api_key = api_key or os.getenv("WEATHER_API_KEY")
        self.base_url = base_url or os.getenv("WEATHER_API_URL", "https://api.openweathermap.org/data/2.5/weather")
    
    def get_weather(self, city: str, units: str = "metric") -> Dict[str, Any]:
        """
        获取指定城市的天气信息
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
                    "lang": "zh_cn"
                }
                response = requests.get(self.base_url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                return {
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
                    "error": f"获取天气信息失败: {str(e)}",
                    "city": city
                }
        else:
            # 模拟天气数据（用于演示）
            return {
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
    
    @staticmethod
    def get_function_definition() -> Dict[str, Any]:
        """返回OpenAI函数调用定义"""
        return {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "获取指定城市的当前天气信息，包括温度、湿度、风速、气压等",
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


class NewsService:
    """新闻服务MCP工具"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        初始化新闻服务
        :param api_key: NewsAPI密钥（可选，如果未提供则使用模拟数据）
        :param base_url: 新闻API的基础URL（可选，从配置文件读取或使用默认值）
        """
        self.api_key = api_key or os.getenv("NEWS_API_KEY")
        self.base_url = base_url or os.getenv("NEWS_API_URL", "https://newsapi.org/v2/top-headlines")
    
    def get_news(self, country: str = "us", category: Optional[str] = None, 
                  page_size: int = 5) -> Dict[str, Any]:
        """
        获取新闻头条
        :param country: 国家代码，例如：cn（中国）、us（美国）
        :param category: 新闻类别（可选）：business, entertainment, general, health, science, sports, technology
        :param page_size: 返回的新闻数量
        :return: 新闻信息字典
        """
        if self.api_key:
            try:
                params = {
                    "country": country,
                    "apiKey": self.api_key,
                    "pageSize": page_size
                }
                if category:
                    params["category"] = category
                
                response = requests.get(self.base_url, params=params, timeout=10)
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
                    "status": "success",
                    "total_results": data.get("totalResults", 0),
                    "articles": articles
                }
            except Exception as e:
                return {
                    "status": "error",
                    "error": f"获取新闻失败: {str(e)}"
                }
        else:
            # 模拟新闻数据（用于演示）
            return {
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
    
    @staticmethod
    def get_function_definition() -> Dict[str, Any]:
        """返回OpenAI函数调用定义"""
        return {
            "type": "function",
            "function": {
                "name": "get_news",
                "description": "获取指定国家或类别的新闻头条",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "country": {
                            "type": "string",
                            "description": "国家代码，例如：cn（中国）、us（美国）、gb（英国）",
                            "default": "cn"
                        },
                        "category": {
                            "type": "string",
                            "enum": ["business", "entertainment", "general", "health", "science", "sports", "technology"],
                            "description": "新闻类别（可选）"
                        },
                        "page_size": {
                            "type": "integer",
                            "description": "返回的新闻数量，默认5条",
                            "default": 5,
                            "minimum": 1,
                            "maximum": 20
                        }
                    }
                }
            }
        }


class OpenAIAgent:
    """基于OpenAI的Agent主类"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, 
                 base_url: Optional[str] = None):
        """
        初始化Agent
        :param api_key: OpenAI API密钥
        :param model: 使用的模型名称（可选，从配置文件读取或使用默认值）
        :param base_url: OpenAI API的基础URL（可选，从配置文件读取，用于自定义API端点）
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("请设置OPENAI_API_KEY环境变量或传入api_key参数")
        
        # 从配置文件读取model和base_url，如果没有则使用默认值
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        openai_base_url = base_url or os.getenv("OPENAI_API_URL")
        # 打印key和url信息
        print(f"[Agent初始化] OpenAI API Key: {self.api_key}")
        print(f"[Agent初始化] OpenAI API Base URL: {openai_base_url or '默认（https://api.openai.com/v1）'}")
        # 如果配置了base_url，则使用自定义端点（例如兼容OpenAI的API）
        if openai_base_url:
            self.client = OpenAI(api_key=self.api_key, base_url=openai_base_url)
        else:
            self.client = OpenAI(api_key=self.api_key)
        
        # 初始化MCP工具
        self.weather_service = WeatherService()
        self.news_service = NewsService()
        
        # 定义可用函数
        self.available_functions = {
            "get_weather": self.weather_service.get_weather,
            "get_news": self.news_service.get_news
        }
        
        # 函数定义列表（用于OpenAI函数调用）
        self.functions = [
            WeatherService.get_function_definition(),
            NewsService.get_function_definition()
        ]
    
    def chat(self, user_message: str, conversation_history: Optional[List[Dict]] = None) -> str:
        """
        与Agent对话
        :param user_message: 用户消息
        :param conversation_history: 对话历史（可选）
        :return: Agent的回复
        """
        messages = conversation_history or []
        messages.append({"role": "user", "content": user_message})
        
        # 调用OpenAI API
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=self.functions,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        messages.append(message)
        
        # 检查是否需要调用函数
        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                print(f"[函数调用] 函数名称: {function_name}, 函数参数: {function_args}")
                
                # 调用相应的函数
                if function_name in self.available_functions:
                    function_response = self.available_functions[function_name](**function_args)
                    
                    # 将函数调用结果添加到消息中
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(function_response, ensure_ascii=False)
                    })
            
            # 再次调用API获取最终回复
            second_response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )
            
            return second_response.choices[0].message.content
        else:
            return message.content
    
    def run_interactive(self):
        """运行交互式对话"""
        print("=" * 60)
        print("OpenAI Agent - 支持天气和新闻查询")
        print("=" * 60)
        print("提示：输入 'quit' 或 'exit' 退出程序")
        print("示例问题：")
        print("  - 北京今天天气怎么样？")
        print("  - 给我看看最新的科技新闻")
        print("  - 上海的天气和今天的新闻")
        print("=" * 60)
        print()
        
        conversation_history = []
        
        while True:
            try:
                user_input = input("\n你: ").strip()
                
                if user_input.lower() in ['quit', 'exit', '退出']:
                    print("\n再见！")
                    break
                
                if not user_input:
                    continue
                
                print("\nAgent: ", end="", flush=True)
                response = self.chat(user_input, conversation_history)
                print(response)
                
                # 更新对话历史（保留最近10轮对话）
                conversation_history.append({"role": "user", "content": user_input})
                conversation_history.append({"role": "assistant", "content": response})
                if len(conversation_history) > 20:
                    conversation_history = conversation_history[-20:]
                    
            except KeyboardInterrupt:
                print("\n\n程序已中断")
                break
            except Exception as e:
                print(f"\n错误: {str(e)}")


def main():
    """主函数"""
    try:
        agent = OpenAIAgent()
        agent.run_interactive()
    except ValueError as e:
        print(f"配置错误: {e}")
        print("\n请确保：")
        print("1. 创建 .env 文件")
        print("2. 设置 OPENAI_API_KEY=your_api_key")
        print("3. （可选）设置 WEATHER_API_KEY 和 NEWS_API_KEY")
    except Exception as e:
        print(f"运行错误: {e}")


if __name__ == "__main__":
    main()

