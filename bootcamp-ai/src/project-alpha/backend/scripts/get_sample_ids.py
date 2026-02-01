"""获取示例 ID 用于测试"""
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.database import SessionLocal
from app.models.label import Label
from app.models.ticket import Ticket

db = SessionLocal()

try:
    # 获取第一个标签
    first_label = db.query(Label).first()
    if first_label:
        print("=" * 60)
        print("示例 ID（复制到 test.rest 文件顶部）:")
        print("=" * 60)
        print(f"@labelId = {first_label.id}")
    
    # 获取第一个 Ticket
    first_ticket = db.query(Ticket).first()
    if first_ticket:
        print(f"@ticketId = {first_ticket.id}")
        print("=" * 60)
        print("\n使用方法:")
        print("1. 复制上面的 @labelId 和 @ticketId 值")
        print("2. 打开 test.rest 文件")
        print("3. 替换文件顶部的变量值")
        print("4. 然后就可以测试需要 ID 的端点了")
    else:
        print("⚠️  数据库中没有 Ticket 数据")
        
finally:
    db.close()

