package com.hyai.common;

public class Constants {
    
    // Redis Key 前缀
    public static final String REDIS_USER_TOKEN_PREFIX = "user:token:";
    public static final String REDIS_USER_INFO_PREFIX = "user:info:";
    public static final String REDIS_AI_TASK_PREFIX = "ai:task:";
    public static final String REDIS_CONFIG_PREFIX = "config:";
    
    // Token 过期时间（秒）
    public static final long TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7天
    
    // 用户信息缓存过期时间（秒）
    public static final long USER_INFO_CACHE_EXPIRATION = 60 * 60; // 1小时
    
    // AI 任务状态过期时间（秒）
    public static final long AI_TASK_EXPIRATION = 24 * 60 * 60; // 24小时
}
