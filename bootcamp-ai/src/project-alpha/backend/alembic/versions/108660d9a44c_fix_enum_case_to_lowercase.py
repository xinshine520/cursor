"""fix enum case to lowercase

Revision ID: 108660d9a44c
Revises: e0f1abcb761f
Create Date: 2025-12-04 17:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '108660d9a44c'
down_revision: Union[str, None] = 'e0f1abcb761f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    修复枚举类型大小写问题：
    - 数据库枚举类型是大写（'OPEN', 'COMPLETED'）
    - Python 代码和触发器使用小写（'open', 'completed'）
    - 需要将数据库枚举改为小写以保持一致
    """
    conn = op.get_bind()
    
    # 检查枚举类型当前值
    result = conn.execute(sa.text("""
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticketstatus')
        ORDER BY enumsortorder;
    """))
    current_values = [row[0] for row in result]
    
    # 如果已经是小写，跳过
    if current_values == ['open', 'completed']:
        return
    
    # 先删除依赖 status 列的触发器
    op.execute("DROP TRIGGER IF EXISTS trg_tickets_set_completed_at ON tickets;")
    
    # 创建临时枚举类型（小写）
    op.execute("""
        CREATE TYPE ticketstatus_new AS ENUM ('open', 'completed');
    """)
    
    # 先删除默认值
    op.execute("ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;")
    
    # 将 tickets 表的 status 列转换为新枚举类型
    op.execute("""
        ALTER TABLE tickets 
        ALTER COLUMN status TYPE ticketstatus_new 
        USING CASE 
            WHEN status::text = 'OPEN' THEN 'open'::ticketstatus_new
            WHEN status::text = 'COMPLETED' THEN 'completed'::ticketstatus_new
            ELSE 'open'::ticketstatus_new
        END;
    """)
    
    # 重新设置默认值
    op.execute("ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'open'::ticketstatus_new;")
    
    # 删除旧枚举类型
    op.execute("DROP TYPE ticketstatus CASCADE;")
    
    # 重命名新枚举类型
    op.execute("ALTER TYPE ticketstatus_new RENAME TO ticketstatus;")
    
    # 重新创建触发器函数和触发器
    op.execute("""
        CREATE OR REPLACE FUNCTION set_completed_at_on_status_change()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
                NEW.completed_at = CURRENT_TIMESTAMP;
            END IF;
            
            IF NEW.status = 'open' AND OLD.status = 'completed' THEN
                NEW.completed_at = NULL;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    op.execute("""
        CREATE TRIGGER trg_tickets_set_completed_at
        BEFORE UPDATE OF status ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION set_completed_at_on_status_change();
    """)
    
    # 同样修复 priority 枚举
    result = conn.execute(sa.text("""
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticketpriority')
        ORDER BY enumsortorder;
    """))
    current_priority_values = [row[0] for row in result]
    
    if current_priority_values != ['low', 'medium', 'high', 'critical']:
        # 创建临时枚举类型（小写）
        op.execute("""
            CREATE TYPE ticketpriority_new AS ENUM ('low', 'medium', 'high', 'critical');
        """)
        
        # 先删除默认值
        op.execute("ALTER TABLE tickets ALTER COLUMN priority DROP DEFAULT;")
        
        # 将 tickets 表的 priority 列转换为新枚举类型
        op.execute("""
            ALTER TABLE tickets 
            ALTER COLUMN priority TYPE ticketpriority_new 
            USING CASE 
                WHEN priority::text = 'LOW' THEN 'low'::ticketpriority_new
                WHEN priority::text = 'MEDIUM' THEN 'medium'::ticketpriority_new
                WHEN priority::text = 'HIGH' THEN 'high'::ticketpriority_new
                WHEN priority::text = 'CRITICAL' THEN 'critical'::ticketpriority_new
                ELSE 'medium'::ticketpriority_new
            END;
        """)
        
        # 重新设置默认值
        op.execute("ALTER TABLE tickets ALTER COLUMN priority SET DEFAULT 'medium'::ticketpriority_new;")
        
        # 删除旧枚举类型
        op.execute("DROP TYPE ticketpriority CASCADE;")
        
        # 重命名新枚举类型
        op.execute("ALTER TYPE ticketpriority_new RENAME TO ticketpriority;")


def downgrade() -> None:
    """
    回滚到大写枚举类型
    """
    conn = op.get_bind()
    
    # 检查枚举类型当前值
    result = conn.execute(sa.text("""
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticketstatus')
        ORDER BY enumsortorder;
    """))
    current_values = [row[0] for row in result]
    
    # 如果已经是大写，跳过
    if current_values == ['OPEN', 'COMPLETED']:
        return
    
    # 创建临时枚举类型（大写）
    op.execute("""
        CREATE TYPE ticketstatus_new AS ENUM ('OPEN', 'COMPLETED');
    """)
    
    # 将 tickets 表的 status 列转换为新枚举类型
    op.execute("""
        ALTER TABLE tickets 
        ALTER COLUMN status TYPE ticketstatus_new 
        USING CASE 
            WHEN status::text = 'open' THEN 'OPEN'::ticketstatus_new
            WHEN status::text = 'completed' THEN 'COMPLETED'::ticketstatus_new
            ELSE 'OPEN'::ticketstatus_new
        END;
    """)
    
    # 删除旧枚举类型
    op.execute("DROP TYPE ticketstatus CASCADE;")
    
    # 重命名新枚举类型
    op.execute("ALTER TYPE ticketstatus_new RENAME TO ticketstatus;")
    
    # 同样回滚 priority 枚举
    result = conn.execute(sa.text("""
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticketpriority')
        ORDER BY enumsortorder;
    """))
    current_priority_values = [row[0] for row in result]
    
    if current_priority_values != ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
        # 创建临时枚举类型（大写）
        op.execute("""
            CREATE TYPE ticketpriority_new AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        """)
        
        # 将 tickets 表的 priority 列转换为新枚举类型
        op.execute("""
            ALTER TABLE tickets 
            ALTER COLUMN priority TYPE ticketpriority_new 
            USING CASE 
                WHEN priority::text = 'low' THEN 'LOW'::ticketpriority_new
                WHEN priority::text = 'medium' THEN 'MEDIUM'::ticketpriority_new
                WHEN priority::text = 'high' THEN 'HIGH'::ticketpriority_new
                WHEN priority::text = 'critical' THEN 'CRITICAL'::ticketpriority_new
                ELSE 'MEDIUM'::ticketpriority_new
            END;
        """)
        
        # 删除旧枚举类型
        op.execute("DROP TYPE ticketpriority CASCADE;")
        
        # 重命名新枚举类型
        op.execute("ALTER TYPE ticketpriority_new RENAME TO ticketpriority;")
