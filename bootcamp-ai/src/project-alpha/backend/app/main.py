from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import tickets, labels

app = FastAPI(
    title="Ticket Hub API",
    version="1.0.0",
    description="Ticket 管理系统 API"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(labels.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Ticket Hub API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

