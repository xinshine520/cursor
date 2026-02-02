package com.hyai.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ai_tasks")
public class AiTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false, length = 50)
    private String taskType; // account_analysis, content_generation, video_creation, etc.
    
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String input;
    
    @Column(columnDefinition = "TEXT")
    private String output;
    
    @Column(nullable = false)
    private Integer progress = 0; // 0-100
    
    @Column(nullable = false)
    private Integer status = 0; // 0:待处理 1:处理中 2:已完成 3:失败
    
    @Column(length = 500)
    private String errorMessage;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
