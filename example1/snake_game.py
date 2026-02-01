"""
贪吃蛇游戏
使用方向键控制蛇的移动，吃到食物会变长并得分
按 ESC 退出游戏，按 R 重新开始
"""
import pygame      # 导入 pygame 库用于游戏开发
import random      # 导入 random 库用于生成随机数（食物位置）
import sys         # 导入 sys 库用于系统操作（如退出程序）

# 初始化 Pygame
pygame.init()

# 游戏配置参数
WINDOW_WIDTH = 800          # 窗口宽度（像素）
WINDOW_HEIGHT = 600         # 窗口高度（像素）
GRID_SIZE = 20              # 每个格子的大小（像素）
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE    # 水平方向格子数量
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE  # 垂直方向格子数量

# 颜色定义 (R, G, B)
BLACK = (0, 0, 0)           # 黑色
WHITE = (255, 255, 255)     # 白色
GREEN = (0, 255, 0)         # 绿色（蛇身）
RED = (255, 0, 0)           # 红色（食物）
DARK_GREEN = (0, 200, 0)    # 深绿色（蛇头/边框）
BLUE = (0, 100, 255)        # 蓝色（备用色，没有用到）
GRAY = (128, 128, 128)      # 灰色（网格线）
YELLOW = (255, 255, 0)      # 黄色（食物轮廓）

# 方向常量（(dx, dy)）
UP = (0, -1)          # 上
DOWN = (0, 1)         # 下
LEFT = (-1, 0)        # 左
RIGHT = (1, 0)        # 右


class Snake:
    """蛇类"""
    
    def __init__(self):
        """初始化蛇"""
        self.length = 3   # 蛇的初始长度
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]  # 蛇头初始位置在屏幕中央
        self.direction = RIGHT     # 蛇初始移动方向向右
        self.color = GREEN         # 蛇身颜色
        self.head_color = DARK_GREEN  # 蛇头颜色
        self.score = 0             # 得分
        
        # 初始化蛇的身体（三节）
        for i in range(1, self.length):
            self.positions.append((self.positions[0][0] - i, self.positions[0][1]))
    
    def get_head_position(self):
        """获取蛇头位置"""
        return self.positions[0]
    
    def update(self):
        """更新蛇的位置"""
        cur = self.get_head_position()   # 获取当前蛇头位置
        x, y = self.direction           # 当前移动方向
        new = ((cur[0] + x) % GRID_WIDTH, (cur[1] + y) % GRID_HEIGHT)    # 计算新蛇头位置（支持穿越边界）
        
        # 检查是否撞到自己（如果蛇头移动到蛇身第二节以后的任何一点，就算自撞）
        if new in self.positions[2:]:
            return False
        
        self.positions.insert(0, new)           # 把新蛇头插入到前面
        if len(self.positions) > self.length:   # 去掉蛇尾
            self.positions.pop()
        
        return True
    
    def reset(self):
        """重置蛇"""
        self.length = 3
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = RIGHT
        self.score = 0
        
        # 重建蛇的初始身体结构
        for i in range(1, self.length):
            self.positions.append((self.positions[0][0] - i, self.positions[0][1]))
    
    def render(self, surface):
        """渲染蛇"""
        for i, p in enumerate(self.positions):
            r = pygame.Rect((p[0] * GRID_SIZE, p[1] * GRID_SIZE), (GRID_SIZE, GRID_SIZE)) # 格子的像素位置
            if i == 0:
                # 蛇头用不同颜色，并画白色边框
                pygame.draw.rect(surface, self.head_color, r)
                pygame.draw.rect(surface, WHITE, r, 2)
            else:
                # 蛇身
                pygame.draw.rect(surface, self.color, r)
                pygame.draw.rect(surface, DARK_GREEN, r, 1)  # 蛇身用深绿色细边框
    
    def handle_keys(self, keys):
        """处理键盘输入"""
        if keys[pygame.K_UP] and self.direction != DOWN:
            self.direction = UP
        elif keys[pygame.K_DOWN] and self.direction != UP:
            self.direction = DOWN
        elif keys[pygame.K_LEFT] and self.direction != RIGHT:
            self.direction = LEFT
        elif keys[pygame.K_RIGHT] and self.direction != LEFT:
            self.direction = RIGHT


class Food:
    """食物类"""
    
    def __init__(self):
        """初始化食物"""
        self.position = (0, 0)       # 食物初始位置（先为0，0，然后重置为随机）
        self.color = RED             # 食物颜色
        self.randomize_position()    # 随机放置食物
    
    def randomize_position(self):
        """随机生成食物位置"""
        self.position = (random.randint(0, GRID_WIDTH - 1), 
                        random.randint(0, GRID_HEIGHT - 1))
    
    def render(self, surface):
        """渲染食物"""
        r = pygame.Rect((self.position[0] * GRID_SIZE, self.position[1] * GRID_SIZE),
                       (GRID_SIZE, GRID_SIZE))
        pygame.draw.rect(surface, self.color, r)         # 食物矩形块
        pygame.draw.rect(surface, YELLOW, r, 2)          # 外边框黄色
        # 绘制一个圆形表示食物
        center = (self.position[0] * GRID_SIZE + GRID_SIZE // 2,
                 self.position[1] * GRID_SIZE + GRID_SIZE // 2)
        pygame.draw.circle(surface, YELLOW, center, GRID_SIZE // 3)  # 黄色圆


class Game:
    """游戏主类"""
    
    def __init__(self):
        """初始化游戏"""
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))   # 创建窗口
        pygame.display.set_caption("贪吃蛇游戏 - 按方向键控制，ESC退出，R重新开始")  # 窗口标题
        self.clock = pygame.time.Clock()   # 控制帧率
        self.font = pygame.font.Font(None, 36)         # 主字体
        self.small_font = pygame.font.Font(None, 24)   # 小字体
        self.snake = Snake()     # 实例化蛇对象
        self.food = Food()       # 实例化食物对象
        self.game_over = False   # 游戏是否结束
        self.speed = 10          # 游戏初始速度（帧率，影响移动速度）
    
    def handle_events(self):
        """处理游戏事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False   # 点击窗口关闭，则退出游戏主循环
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    return False   # 按 ESC 退出
                elif event.key == pygame.K_r and self.game_over:
                    self.reset_game()   # 按 R 且游戏结束时重新开始
        
        if not self.game_over:
            keys = pygame.key.get_pressed()   # 按键状态
            self.snake.handle_keys(keys)      # 调用蛇的按键处理逻辑
        
        return True
    
    def update(self):
        """更新游戏状态"""
        if not self.game_over:
            # 更新蛇的位置，如果撞到自己则 game_over
            if not self.snake.update():
                self.game_over = True
                return
            
            # 检查是否吃到食物
            if self.snake.get_head_position() == self.food.position:
                self.snake.length += 1        # 吃到食物蛇变长
                self.snake.score += 10        # 加分
                self.food.randomize_position()# 随机刷新食物位置
                
                # 确保食物不会生成在蛇身上
                while self.food.position in self.snake.positions:
                    self.food.randomize_position()
                
                # 随着得分增加，速度逐渐加快（最高20帧）
                self.speed = min(20, 10 + self.snake.score // 50)
    
    def render(self):
        """渲染游戏画面"""
        self.screen.fill(BLACK)  # 背景填充黑色
        
        # 绘制网格线（可选，让游戏更美观帮助对齐）
        for x in range(0, WINDOW_WIDTH, GRID_SIZE):
            pygame.draw.line(self.screen, GRAY, (x, 0), (x, WINDOW_HEIGHT))
        for y in range(0, WINDOW_HEIGHT, GRID_SIZE):
            pygame.draw.line(self.screen, GRAY, (0, y), (WINDOW_WIDTH, y))
        
        # 渲染蛇和食物对象
        self.snake.render(self.screen)
        self.food.render(self.screen)
        
        # 显示得分
        score_text = self.font.render(f"得分: {self.snake.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        # 显示长度
        length_text = self.small_font.render(f"长度: {self.snake.length}", True, WHITE)
        self.screen.blit(length_text, (10, 50))
        
        # 显示速度
        speed_text = self.small_font.render(f"速度: {self.speed}", True, WHITE)
        self.screen.blit(speed_text, (10, 75))
        
        # 游戏结束提示
        if self.game_over:
            game_over_text = self.font.render("游戏结束!", True, RED)
            restart_text = self.small_font.render("按 R 重新开始，ESC 退出", True, WHITE)
            
            text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 30))
            restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 10))
            
            # 半透明背景遮罩
            overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
            overlay.set_alpha(180)  # 设置透明度
            overlay.fill(BLACK)     # 填充黑色
            self.screen.blit(overlay, (0, 0))
            
            self.screen.blit(game_over_text, text_rect)     # 游戏结束文字
            self.screen.blit(restart_text, restart_rect)    # 重新开始提示
        
        pygame.display.update()    # 刷新窗口显示内容
    
    def reset_game(self):
        """重置游戏"""
        self.snake.reset()                # 重置蛇
        self.food.randomize_position()    # 随机新食物
        self.game_over = False            # 重置游戏结束状态
        self.speed = 10                   # 重置速度
        
        # 确保食物不在蛇身上
        while self.food.position in self.snake.positions:
            self.food.randomize_position()
    
    def run(self):
        """运行游戏主循环"""
        running = True
        
        while running:
            running = self.handle_events()   # 处理输入/事件
            self.update()                    # 更新数据
            self.render()                    # 渲染画面
            self.clock.tick(self.speed)      # 控制游戏速度（帧率）
        
        pygame.quit()    # 退出pygame
        sys.exit()       # 退出程序


def main():
    """主函数"""
    try:
        game = Game()       # 创建游戏对象
        game.run()          # 启动游戏主循环
    except Exception as e:
        print(f"游戏运行出错: {e}")
        pygame.quit()
        sys.exit(1)


if __name__ == "__main__":
    main()

