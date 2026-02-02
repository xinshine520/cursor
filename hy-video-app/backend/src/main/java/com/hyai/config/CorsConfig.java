package com.hyai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域配置
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许的前端域名
        config.addAllowedOrigin("http://localhost:5173"); // Vite 开发服务器
        config.addAllowedOrigin("http://127.0.0.1:5173");
        
        // 允许所有请求头
        config.addAllowedHeader("*");
        
        // 允许所有请求方法
        config.addAllowedMethod("*");
        
        // 允许发送 Cookie
        config.setAllowCredentials(true);
        
        // 预检请求的有效期，单位：秒
        config.setMaxAge(3600L);
        
        // 配置路径
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
