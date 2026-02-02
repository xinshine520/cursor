package com.hyai.controller;

import com.hyai.common.Result;
import com.hyai.dto.LoginRequest;
import com.hyai.dto.LoginResponse;
import com.hyai.dto.RegisterRequest;
import com.hyai.entity.User;
import com.hyai.service.UserService;
import com.hyai.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "认证接口", description = "用户认证相关接口")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return Result.success("注册成功", user);
    }
    
    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return Result.success("登录成功", response);
    }
    
    @Operation(summary = "用户退出")
    @PostMapping("/logout")
    public Result<Void> logout(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null) {
            Long userId = jwtUtil.getUserIdFromToken(token);
            userService.logout(userId);
        }
        return Result.success("退出成功", null);
    }
    
    @Operation(summary = "刷新Token")
    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return Result.error("Token无效");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        String newToken = jwtUtil.generateToken(userId, username);
        
        User user = userService.getUserById(userId);
        LoginResponse response = new LoginResponse();
        response.setToken(newToken);
        
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        response.setUserInfo(userInfo);
        
        return Result.success("刷新成功", response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
