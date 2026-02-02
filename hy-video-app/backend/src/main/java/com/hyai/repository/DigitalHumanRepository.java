package com.hyai.repository;

import com.hyai.entity.DigitalHuman;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalHumanRepository extends JpaRepository<DigitalHuman, Long> {
    
    List<DigitalHuman> findByUserIdAndDeletedAtIsNull(Long userId);
}
