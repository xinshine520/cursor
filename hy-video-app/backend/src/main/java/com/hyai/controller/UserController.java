package com.hyai.controller;

import com.hyai.common.Result;
import com.hyai.entity.User;
import com.hyai.service.UserService;
import com.hyai.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "用户接口", description = "用户管理相关接口")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @Operation(summary = "获取用户信息")
    @GetMapping("/info")
    public Result<User> getUserInfo(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        User user = userService.getUserById(userId);
        // 隐藏密码
        user.setPassword(null);
        return Result.success(user);
    }
    
    @Operation(summary = "更新用户信息")
    @PutMapping("/info")
    public Result<User> updateUserInfo(@RequestBody User user, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        User updatedUser = userService.updateUser(userId, user);
        updatedUser.setPassword(null);
        return Result.success("更新成功", updatedUser);
    }
    
    @Operation(summary = "上传头像")
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam String avatarUrl, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        User user = new User();
        user.setAvatar(avatarUrl);
        userService.updateUser(userId, user);
        return Result.success("上传成功", avatarUrl);
    }
    
    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public Result<Void> changePassword(@RequestParam String oldPassword, 
                                       @RequestParam String newPassword,
                                       HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        userService.changePassword(userId, oldPassword, newPassword);
        return Result.success("密码修改成功", null);
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = extractToken(request);
        return jwtUtil.getUserIdFromToken(token);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
