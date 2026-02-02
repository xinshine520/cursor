package com.hyai.repository;

import com.hyai.entity.AiTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiTaskRepository extends JpaRepository<AiTask, Long> {
    
    Page<AiTask> findByUserId(Long userId, Pageable pageable);
    
    List<AiTask> findByUserIdAndStatus(Long userId, Integer status);
}
