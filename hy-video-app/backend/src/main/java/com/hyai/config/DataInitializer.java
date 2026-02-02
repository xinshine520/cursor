package com.hyai.config;

import com.hyai.entity.User;
import com.hyai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * 数据初始化器
 * 应用启动时自动初始化测试用户数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 检查是否已有用户数据
        long userCount = userRepository.count();
        if (userCount > 0) {
            log.info("数据库已有 {} 条用户记录，跳过初始化", userCount);
            return;
        }

        log.info("开始初始化用户数据...");

        // 创建测试用户列表
        List<User> users = Arrays.asList(
            // 管理员账号
            createUser("admin", "111111", "系统管理员", "13800138000", "admin@hyai.com"),
            
            // 普通用户
            createUser("user001", "123456", "张三", "13800138001", "zhangsan@example.com"),
            createUser("user002", "123456", "李四", "13800138002", "lisi@example.com"),
            createUser("user003", "123456", "王五", "13800138003", "wangwu@example.com"),
            createUser("user004", "123456", "赵六", "13800138004", "zhaoliu@example.com"),
            createUser("user005", "123456", "孙七", "13800138005", "sunqi@example.com"),
            createUser("user006", "123456", "周八", "13800138006", "zhouba@example.com"),
            createUser("user007", "123456", "吴九", "13800138007", "wujiu@example.com"),
            createUser("user008", "123456", "郑十", "13800138008", "zhengshi@example.com"),
            createUser("user009", "123456", "陈十一", "13800138009", "chenshiyi@example.com")
        );

        // 批量保存用户
        userRepository.saveAll(users);

        log.info("用户数据初始化完成！共创建 {} 条记录", users.size());
        log.info("管理员账号 - 用户名: admin, 密码: 111111");
        log.info("测试账号 - 用户名: user001~user009, 密码: 123456");
    }

    /**
     * 创建用户对象
     */
    private User createUser(String username, String rawPassword, String nickname, 
                           String phone, String email) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword)); // BCrypt 加密
        user.setNickname(nickname);
        user.setPhone(phone);
        user.setEmail(email);
        user.setStatus(1); // 正常状态
        return user;
    }
}
