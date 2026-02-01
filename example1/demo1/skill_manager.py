"""
Skill 管理器
负责注册、管理和调用 Skills
"""
from typing import Dict, List, Optional, Any
from skills.base_skill import BaseSkill


class SkillManager:
    """Skill 管理器"""
    
    def __init__(self):
        """初始化 Skill 管理器"""
        self.skills: Dict[str, BaseSkill] = {}
    
    def register_skill(self, skill: BaseSkill) -> bool:
        """
        注册一个 Skill
        :param skill: Skill 实例
        :return: 是否注册成功
        """
        if not isinstance(skill, BaseSkill):
            raise ValueError(f"skill 必须是 BaseSkill 的实例，当前类型: {type(skill)}")
        
        if skill.name in self.skills:
            print(f"警告: Skill '{skill.name}' 已存在，将被覆盖")
        
        self.skills[skill.name] = skill
        print(f"✓ 已注册 Skill: {skill.name} - {skill.description}")
        return True
    
    def unregister_skill(self, skill_name: str) -> bool:
        """
        注销一个 Skill
        :param skill_name: Skill 名称
        :return: 是否注销成功
        """
        if skill_name in self.skills:
            del self.skills[skill_name]
            print(f"✓ 已注销 Skill: {skill_name}")
            return True
        return False
    
    def get_skill(self, skill_name: str) -> Optional[BaseSkill]:
        """
        获取指定的 Skill
        :param skill_name: Skill 名称
        :return: Skill 实例或 None
        """
        return self.skills.get(skill_name)
    
    def list_skills(self) -> List[str]:
        """
        列出所有已注册的 Skill 名称
        :return: Skill 名称列表
        """
        return list(self.skills.keys())
    
    def execute_skill(self, skill_name: str, **kwargs) -> Dict[str, Any]:
        """
        执行指定的 Skill
        :param skill_name: Skill 名称
        :param kwargs: Skill 执行参数
        :return: 执行结果
        """
        skill = self.get_skill(skill_name)
        if not skill:
            return {
                "success": False,
                "error": f"Skill '{skill_name}' 未找到"
            }
        
        # 验证参数
        if not skill.validate_params(kwargs):
            return {
                "success": False,
                "error": f"Skill '{skill_name}' 参数验证失败"
            }
        
        try:
            result = skill.execute(**kwargs)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": f"执行 Skill '{skill_name}' 时出错: {str(e)}"
            }
    
    def get_all_function_definitions(self) -> List[Dict[str, Any]]:
        """
        获取所有 Skill 的函数定义（用于 OpenAI 函数调用）
        :return: 函数定义列表
        """
        return [skill.get_function_definition() for skill in self.skills.values()]
    
    def get_available_functions(self) -> Dict[str, callable]:
        """
        获取所有可用的函数映射（用于 OpenAI 函数调用）
        :return: 函数名称到执行函数的映射
        """
        def make_wrapper(skill_name: str):
            """创建包装函数，避免闭包问题"""
            def wrapper(**kwargs):
                return self.execute_skill(skill_name, **kwargs)
            return wrapper
        
        return {
            name: make_wrapper(name)
            for name in self.skills.keys()
        }

