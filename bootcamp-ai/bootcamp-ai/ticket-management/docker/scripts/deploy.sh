#!/bin/bash

# Ticket Management Docker 部署脚本
# 使用方法: ./deploy.sh [start|stop|restart|logs|status|update]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="ticket-management"

# Docker Compose 文件路径
COMPOSE_FILE="../docker-compose.prod.yml"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 和 Docker Compose
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量文件..."
    
    if [ ! -f "../.env" ]; then
        log_warning ".env 文件不存在，从 .env.example 复制"
        if [ -f "../.env.example" ]; then
            cp ../.env.example ../.env
            log_warning "请编辑 .env 文件并设置正确的环境变量"
            exit 1
        else
            log_error ".env.example 文件不存在"
            exit 1
        fi
    fi
    
    log_success "环境变量文件检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p ../logs/nginx
    mkdir -p ../logs/backend
    mkdir -p ../nginx/ssl
    
    log_success "目录创建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    check_dependencies
    check_env_file
    create_directories
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    log_success "服务启动完成"
    
    # 显示服务状态
    show_status
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    
    log_success "服务停止完成"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    stop_services
    start_services
}

# 显示日志
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_info "显示所有服务日志..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    else
        log_info "显示 $service 服务日志..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
    fi
}

# 显示服务状态
show_status() {
    log_info "服务状态:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo ""
    log_info "服务健康检查:"
    
    # 检查后端健康状态
    if curl -f http://localhost/api/v1/health &> /dev/null; then
        log_success "后端服务: 健康"
    else
        log_warning "后端服务: 不可用"
    fi
    
    # 检查前端健康状态
    if curl -f http://localhost &> /dev/null; then
        log_success "前端服务: 健康"
    else
        log_warning "前端服务: 不可用"
    fi
}

# 更新服务
update_services() {
    log_info "更新服务..."
    
    # 拉取最新代码
    log_info "拉取最新代码..."
    git pull origin main
    
    # 重新构建镜像
    log_info "重新构建镜像..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache
    
    # 重启服务
    restart_services
    
    log_success "服务更新完成"
}

# 备份数据库
backup_database() {
    log_info "备份数据库..."
    
    local backup_file="../backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p ../backups
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $backup_file
    
    log_success "数据库备份完成: $backup_file"
}

# 恢复数据库
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "请指定备份文件路径"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    log_info "恢复数据库..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < $backup_file
    
    log_success "数据库恢复完成"
}

# 清理资源
cleanup() {
    log_info "清理未使用的 Docker 资源..."
    
    docker system prune -f
    
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "Ticket Management Docker 部署脚本"
    echo ""
    echo "使用方法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  start              启动所有服务"
    echo "  stop               停止所有服务"
    echo "  restart            重启所有服务"
    echo "  logs [service]     显示日志 (可选指定服务名)"
    echo "  status             显示服务状态"
    echo "  update             更新服务 (拉取代码并重新构建)"
    echo "  backup             备份数据库"
    echo "  restore <file>     从备份文件恢复数据库"
    echo "  cleanup            清理未使用的 Docker 资源"
    echo "  help               显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start           # 启动所有服务"
    echo "  $0 logs backend    # 显示后端服务日志"
    echo "  $0 backup          # 备份数据库"
    echo "  $0 restore backup.sql # 从备份文件恢复数据库"
}

# 主函数
main() {
    case "$1" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs $2
            ;;
        status)
            show_status
            ;;
        update)
            update_services
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database $2
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main $@
