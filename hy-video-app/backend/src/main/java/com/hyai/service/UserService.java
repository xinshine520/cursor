package com.hyai.service;

import com.hyai.dto.LoginRequest;
import com.hyai.dto.LoginResponse;
import com.hyai.dto.RegisterRequest;
import com.hyai.entity.User;
import com.hyai.repository.UserRepository;
import com.hyai.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus(1);
        
        return userRepository.save(user);
    }
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        
        // 存储 Token 到 Redis
        String redisKey = com.hyai.common.Constants.REDIS_USER_TOKEN_PREFIX + user.getId();
        redisTemplate.opsForValue().set(redisKey, token, 
                com.hyai.common.Constants.TOKEN_EXPIRATION, TimeUnit.SECONDS);
        
        // 存储用户信息到 Redis
        String userInfoKey = com.hyai.common.Constants.REDIS_USER_INFO_PREFIX + user.getId();
        redisTemplate.opsForValue().set(userInfoKey, user, 
                com.hyai.common.Constants.USER_INFO_CACHE_EXPIRATION, TimeUnit.SECONDS);
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setNickname(user.getNickname());
        userInfo.setAvatar(user.getAvatar());
        userInfo.setEmail(user.getEmail());
        userInfo.setPhone(user.getPhone());
        response.setUserInfo(userInfo);
        
        return response;
    }
    
    public void logout(Long userId) {
        String redisKey = com.hyai.common.Constants.REDIS_USER_TOKEN_PREFIX + userId;
        redisTemplate.delete(redisKey);
        
        String userInfoKey = com.hyai.common.Constants.REDIS_USER_INFO_PREFIX + userId;
        redisTemplate.delete(userInfoKey);
    }
    
    public User getUserById(Long id) {
        return userRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    @Transactional
    public User updateUser(Long id, User user) {
        User existingUser = getUserById(id);
        if (user.getNickname() != null) {
            existingUser.setNickname(user.getNickname());
        }
        if (user.getAvatar() != null) {
            existingUser.setAvatar(user.getAvatar());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        return userRepository.save(existingUser);
    }
    
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = getUserById(id);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
