"""
生成测试数据脚本
- 100 条标签数据
- 每个标签 3-10 条 Ticket 数据
"""
import sys
import random
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.label import Label
from app.models.ticket import Ticket, TicketPriority, TicketStatus
import uuid


# 预设标签名称和颜色
LABEL_NAMES = [
    "Bug", "Feature", "Enhancement", "Documentation", "Question", "Urgent",
    "Frontend", "Backend", "Database", "API", "UI/UX", "Testing", "Security",
    "Performance", "Refactoring", "Deployment", "Monitoring", "Analytics",
    "Mobile", "Desktop", "Web", "Cloud", "DevOps", "CI/CD", "Infrastructure",
    "Design", "Content", "Marketing", "Sales", "Support", "Finance", "HR",
    "Legal", "Compliance", "Training", "Onboarding", "Offboarding", "Review",
    "Planning", "Research", "Prototype", "MVP", "Production", "Staging",
    "Development", "Maintenance", "Hotfix", "Patch", "Update", "Migration",
    "Integration", "Authentication", "Authorization", "Payment", "Billing",
    "Notification", "Email", "SMS", "Push", "Webhook", "Event", "Logging",
    "Audit", "Backup", "Recovery", "Disaster", "Scalability", "Optimization",
    "Caching", "CDN", "Load Balancing", "Microservices", "Serverless",
    "Container", "Kubernetes", "Docker", "AWS", "Azure", "GCP", "Firebase",
    "GraphQL", "REST", "gRPC", "WebSocket", "SSE", "Real-time", "Async",
    "Queue", "Message", "Stream", "Batch", "ETL", "Data Pipeline", "ML",
    "AI", "NLP", "Computer Vision", "Recommendation", "Search", "Index"
]

LABEL_COLORS = [
    "#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
    "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
    "#d946ef", "#ec4899", "#f43f5e", "#dc2626", "#ea580c", "#ca8a04",
    "#65a30d", "#16a34a", "#059669", "#0891b2", "#0284c7", "#2563eb",
    "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48"
]

TICKET_TITLES = [
    "修复登录页面的验证错误",
    "添加用户头像上传功能",
    "优化数据库查询性能",
    "更新 API 文档",
    "实现密码重置功能",
    "添加多语言支持",
    "修复移动端显示问题",
    "优化页面加载速度",
    "添加数据导出功能",
    "实现实时通知系统",
    "修复支付流程中的bug",
    "添加搜索功能",
    "优化图片上传压缩",
    "实现文件预览功能",
    "添加用户权限管理",
    "修复邮件发送失败问题",
    "优化搜索算法",
    "添加数据统计图表",
    "实现批量操作功能",
    "修复缓存失效问题",
    "添加操作日志记录",
    "优化表单验证逻辑",
    "实现数据备份功能",
    "添加主题切换功能",
    "修复时区显示问题",
    "优化移动端适配",
    "添加快捷键支持",
    "实现拖拽排序功能",
    "修复数据同步问题",
    "添加评论功能",
    "优化错误提示信息",
    "实现数据导入功能",
    "添加分享功能",
    "修复内存泄漏问题",
    "优化代码结构",
    "添加单元测试",
    "实现自动化部署",
    "优化数据库索引",
    "添加操作确认对话框",
    "修复跨域问题",
    "实现数据加密",
    "添加操作历史记录",
    "优化用户体验",
    "实现数据同步",
    "添加数据验证",
    "修复并发问题",
    "优化API响应时间",
    "实现数据分页",
    "添加数据筛选功能",
    "优化前端渲染性能"
]

TICKET_DESCRIPTIONS = [
    "需要修复登录页面中的表单验证逻辑，确保用户输入正确格式的邮箱和密码。",
    "实现用户头像上传功能，支持图片裁剪和压缩，最大文件大小限制为2MB。",
    "优化慢查询，添加必要的数据库索引，提升查询响应速度。",
    "更新API文档，添加最新的接口说明和示例代码。",
    "实现密码重置功能，通过邮箱发送重置链接，支持安全验证。",
    "添加多语言支持，目前需要支持中文、英文和日文。",
    "修复移动端在某些设备上的显示问题，确保响应式布局正常工作。",
    "优化页面加载速度，使用懒加载和代码分割技术。",
    "添加数据导出功能，支持导出为Excel和CSV格式。",
    "实现实时通知系统，使用WebSocket推送消息给用户。",
    "修复支付流程中的bug，确保支付状态正确更新。",
    "添加全文搜索功能，支持标题和描述内容搜索。",
    "优化图片上传，自动压缩大图片，减少存储空间。",
    "实现文件预览功能，支持PDF、图片、Office文档等格式。",
    "添加用户权限管理，支持角色和权限分配。",
    "修复邮件发送失败问题，检查SMTP配置和网络连接。",
    "优化搜索算法，提升搜索准确性和响应速度。",
    "添加数据统计图表，使用图表库展示数据趋势。",
    "实现批量操作功能，支持批量删除、批量更新等。",
    "修复缓存失效问题，确保缓存数据及时更新。"
]


def generate_labels(db: Session, count: int = 100):
    """生成标签数据"""
    print(f"正在生成 {count} 条标签数据...")
    labels = []
    
    # 获取已存在的标签名称
    existing_labels = db.query(Label).all()
    existing_names = {label.name.lower() for label in existing_labels}
    
    created_count = 0
    skipped_count = 0
    
    for i in range(count):
        # 如果预设名称用完了，使用通用名称
        if i < len(LABEL_NAMES):
            name = LABEL_NAMES[i]
        else:
            name = f"标签 {i + 1}"
        
        # 检查标签名称是否已存在（不区分大小写）
        if name.lower() in existing_names:
            skipped_count += 1
            continue
        
        # 随机选择颜色
        color = random.choice(LABEL_COLORS)
        
        # 随机生成描述（可选）
        description = None
        if random.random() > 0.3:  # 70% 的概率有描述
            descriptions = [
                f"{name}相关的任务",
                f"用于标记{name}类型的工作项",
                f"{name}分类标签",
                f"与{name}相关的所有事项"
            ]
            description = random.choice(descriptions)
        
        label = Label(
            id=uuid.uuid4(),
            name=name,
            color=color,
            description=description
        )
        labels.append(label)
        db.add(label)
        existing_names.add(name.lower())  # 添加到已存在列表，避免本次批量创建中的重复
        created_count += 1
    
    if labels:
        db.commit()
        print(f"✓ 成功生成 {created_count} 条新标签数据")
        if skipped_count > 0:
            print(f"⚠️  跳过 {skipped_count} 条已存在的标签")
    else:
        print(f"⚠️  所有标签都已存在，未创建新标签")
    
    # 返回数据库中所有的标签（包括新创建的和已存在的）
    all_labels = db.query(Label).all()
    return all_labels


def generate_tickets(db: Session, labels: list, tickets_per_label_min: int = 3, tickets_per_label_max: int = 10):
    """为每个标签生成 Ticket 数据"""
    print(f"正在为每个标签生成 {tickets_per_label_min}-{tickets_per_label_max} 条 Ticket 数据...")
    total_tickets = 0
    
    for label in labels:
        # 随机生成每个标签的 Ticket 数量
        ticket_count = random.randint(tickets_per_label_min, tickets_per_label_max)
        
        for i in range(ticket_count):
            # 随机选择标题和描述
            title = random.choice(TICKET_TITLES)
            description = random.choice(TICKET_DESCRIPTIONS) if random.random() > 0.2 else None
            
            # 随机选择优先级
            priority = random.choice(list(TicketPriority))
            
            # 随机选择状态（80% 概率是 open，20% 概率是 completed）
            status = TicketStatus.COMPLETED if random.random() < 0.2 else TicketStatus.OPEN
            
            ticket = Ticket(
                id=uuid.uuid4(),
                title=title,
                description=description,
                priority=priority,
                status=status,
                labels=[label]  # 关联当前标签
            )
            db.add(ticket)
            total_tickets += 1
    
    db.commit()
    print(f"✓ 成功生成 {total_tickets} 条 Ticket 数据")
    return total_tickets


def main():
    """主函数"""
    print("=" * 60)
    print("开始生成测试数据...")
    print("=" * 60)
    
    db: Session = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing_labels_count = db.query(Label).count()
        existing_tickets_count = db.query(Ticket).count()
        if existing_labels_count > 0 or existing_tickets_count > 0:
            print(f"⚠️  警告：数据库中已存在 {existing_labels_count} 条标签和 {existing_tickets_count} 条 Ticket")
            print("脚本会自动跳过已存在的标签名称，继续生成新数据...")
        
        # 生成标签
        labels = generate_labels(db, count=100)
        
        # 生成 Ticket
        total_tickets = generate_tickets(db, labels, tickets_per_label_min=3, tickets_per_label_max=10)
        
        # 统计信息
        print("\n" + "=" * 60)
        print("数据生成完成！")
        print("=" * 60)
        print(f"标签总数: {len(labels)}")
        print(f"Ticket 总数: {total_tickets}")
        print(f"平均每个标签的 Ticket 数: {total_tickets / len(labels):.2f}")
        
        # 验证数据
        label_count = db.query(Label).count()
        ticket_count = db.query(Ticket).count()
        print(f"\n验证数据:")
        print(f"数据库中的标签数: {label_count}")
        print(f"数据库中的 Ticket 数: {ticket_count}")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

