"""验证测试数据"""
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.database import SessionLocal
from app.models.label import Label
from app.models.ticket import Ticket

db = SessionLocal()

try:
    labels = db.query(Label).all()
    tickets = db.query(Ticket).all()
    
    print(f"标签总数: {len(labels)}")
    print(f"Ticket 总数: {len(tickets)}")
    print(f"\n前10个标签及其 Ticket 数量:")
    
    for label in labels[:10]:
        ticket_count = len([t for t in tickets if label in t.labels])
        print(f"  - {label.name}: {ticket_count} 条 Ticket")
    
    # 统计每个标签的 Ticket 数量分布
    label_ticket_counts = {}
    for label in labels:
        count = len([t for t in tickets if label in t.labels])
        label_ticket_counts[label.name] = count
    
    print(f"\nTicket 数量统计:")
    print(f"  最少: {min(label_ticket_counts.values())} 条")
    print(f"  最多: {max(label_ticket_counts.values())} 条")
    print(f"  平均: {sum(label_ticket_counts.values()) / len(label_ticket_counts):.2f} 条")
    
finally:
    db.close()

