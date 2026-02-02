package com.hyai.repository;

import com.hyai.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    Page<Asset> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
    
    Page<Asset> findByCategoryAndDeletedAtIsNull(String category, Pageable pageable);
    
    Page<Asset> findByUserIdAndCategoryAndDeletedAtIsNull(Long userId, String category, Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.userId = :userId AND a.category = :category AND a.deletedAt IS NULL")
    Page<Asset> findByUserAndCategory(@Param("userId") Long userId, @Param("category") String category, Pageable pageable);
    
    List<Asset> findByUserIdAndDeletedAtIsNull(Long userId);
}
