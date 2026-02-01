@echo off
REM Ticket Management Docker 部署脚本 (Windows)
REM 使用方法: deploy.bat [start|stop|restart|logs|status|update]

setlocal enabledelayedexpansion

REM 项目名称
set PROJECT_NAME=ticket-management

REM Docker Compose 文件路径
set COMPOSE_FILE=..\docker-compose.prod.yml

REM 检查命令
if "%1"=="" goto help
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="update" goto update
if "%1"=="backup" goto backup
if "%1"=="cleanup" goto cleanup
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help

echo [ERROR] 未知命令: %1
goto help

:check_dependencies
echo [INFO] 检查依赖...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker 未安装，请先安装 Docker
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose 未安装，请先安装 Docker Compose
    exit /b 1
)

echo [SUCCESS] 依赖检查完成
goto :eof

:check_env_file
echo [INFO] 检查环境变量文件...
if not exist "..\.env" (
    echo [WARNING] .env 文件不存在，从 .env.example 复制
    if exist "..\.env.example" (
        copy "..\.env.example" "..\.env" >nul
        echo [WARNING] 请编辑 .env 文件并设置正确的环境变量
        exit /b 1
    ) else (
        echo [ERROR] .env.example 文件不存在
        exit /b 1
    )
)
echo [SUCCESS] 环境变量文件检查完成
goto :eof

:create_directories
echo [INFO] 创建必要的目录...
if not exist "..\logs\nginx" mkdir "..\logs\nginx"
if not exist "..\logs\backend" mkdir "..\logs\backend"
if not exist "..\nginx\ssl" mkdir "..\nginx\ssl"
echo [SUCCESS] 目录创建完成
goto :eof

:start
echo [INFO] 启动服务...
call :check_dependencies
call :check_env_file
call :create_directories

docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% up -d

echo [SUCCESS] 服务启动完成
call :status
goto :eof

:stop
echo [INFO] 停止服务...
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% down
echo [SUCCESS] 服务停止完成
goto :eof

:restart
echo [INFO] 重启服务...
call :stop
call :start
goto :eof

:logs
if "%2"=="" (
    echo [INFO] 显示所有服务日志...
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs -f
) else (
    echo [INFO] 显示 %2 服务日志...
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs -f %2
)
goto :eof

:status
echo [INFO] 服务状态:
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps

echo.
echo [INFO] 服务健康检查:

REM 检查后端健康状态
curl -f http://localhost/api/v1/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] 后端服务: 不可用
) else (
    echo [SUCCESS] 后端服务: 健康
)

REM 检查前端健康状态
curl -f http://localhost >nul 2>&1
if errorlevel 1 (
    echo [WARNING] 前端服务: 不可用
) else (
    echo [SUCCESS] 前端服务: 健康
)
goto :eof

:update
echo [INFO] 更新服务...

REM 拉取最新代码
echo [INFO] 拉取最新代码...
git pull origin main

REM 重新构建镜像
echo [INFO] 重新构建镜像...
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% build --no-cache

REM 重启服务
call :restart

echo [SUCCESS] 服务更新完成
goto :eof

:backup
echo [INFO] 备份数据库...
set BACKUP_FILE=..\backups\backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set BACKUP_FILE=%BACKUP_FILE: =0%

if not exist "..\backups" mkdir "..\backups"

docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% exec -T postgres pg_dump -U %POSTGRES_USER% %POSTGRES_DB% > %BACKUP_FILE%

echo [SUCCESS] 数据库备份完成: %BACKUP_FILE%
goto :eof

:cleanup
echo [INFO] 清理未使用的 Docker 资源...
docker system prune -f
echo [SUCCESS] 清理完成
goto :eof

:help
echo Ticket Management Docker 部署脚本 (Windows)
echo.
echo 使用方法: %0 [命令] [选项]
echo.
echo 命令:
echo   start              启动所有服务
echo   stop               停止所有服务
echo   restart            重启所有服务
echo   logs [service]     显示日志 (可选指定服务名)
echo   status             显示服务状态
echo   update             更新服务 (拉取代码并重新构建)
echo   backup             备份数据库
echo   cleanup            清理未使用的 Docker 资源
echo   help               显示此帮助信息
echo.
echo 示例:
echo   %0 start           # 启动所有服务
echo   %0 logs backend    # 显示后端服务日志
echo   %0 backup          # 备份数据库
goto :eof
