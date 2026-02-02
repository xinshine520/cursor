package com.hyai.repository;

import com.hyai.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    Page<Material> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
    
    Page<Material> findByCategoryAndDeletedAtIsNull(String category, Pageable pageable);
    
    Page<Material> findByUserIdAndCategoryAndDeletedAtIsNull(Long userId, String category, Pageable pageable);
    
    @Query("SELECT m FROM Material m WHERE m.userId = :userId AND m.category = :category AND m.deletedAt IS NULL")
    Page<Material> findByUserAndCategory(@Param("userId") Long userId, @Param("category") String category, Pageable pageable);
    
    List<Material> findByUserIdAndDeletedAtIsNull(Long userId);
}
