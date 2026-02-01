"""
Skill 基类
定义所有 Skill 的统一接口
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseSkill(ABC):
    """Skill 基类，所有 Skill 都需要继承此类"""
    
    def __init__(self, name: str, description: str):
        """
        初始化 Skill
        :param name: Skill 名称
        :param description: Skill 描述
        """
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, **kwargs) -> Dict[str, Any]:
        """
        执行 Skill 的核心功能
        :param kwargs: 执行参数
        :return: 执行结果字典
        """
        pass
    
    @abstractmethod
    def get_function_definition(self) -> Dict[str, Any]:
        """
        返回 OpenAI 函数调用定义
        :return: 函数定义字典
        """
        pass
    
    def validate_params(self, params: Dict[str, Any]) -> bool:
        """
        验证参数是否有效（可选实现）
        :param params: 参数字典
        :return: 是否有效
        """
        return True
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(name={self.name})>"

