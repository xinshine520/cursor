package com.hyai.service;

import com.hyai.entity.Material;
import com.hyai.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaterialService {
    
    private final MaterialRepository materialRepository;
    
    public Page<Material> getMaterials(Long userId, String category, Pageable pageable) {
        if (category != null && !category.isEmpty()) {
            if (userId != null) {
                return materialRepository.findByUserIdAndCategoryAndDeletedAtIsNull(userId, category, pageable);
            } else {
                return materialRepository.findByCategoryAndDeletedAtIsNull(category, pageable);
            }
        } else {
            if (userId != null) {
                return materialRepository.findByUserIdAndDeletedAtIsNull(userId, pageable);
            } else {
                return materialRepository.findAll(pageable);
            }
        }
    }
    
    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("素材不存在"));
    }
    
    @Transactional
    public Material createMaterial(Material material) {
        material.setStatus(1);
        return materialRepository.save(material);
    }
    
    @Transactional
    public Material updateMaterial(Long id, Material material) {
        Material existingMaterial = getMaterialById(id);
        if (material.getTitle() != null) {
            existingMaterial.setTitle(material.getTitle());
        }
        if (material.getDescription() != null) {
            existingMaterial.setDescription(material.getDescription());
        }
        if (material.getUrl() != null) {
            existingMaterial.setUrl(material.getUrl());
        }
        if (material.getThumbnail() != null) {
            existingMaterial.setThumbnail(material.getThumbnail());
        }
        return materialRepository.save(existingMaterial);
    }
    
    @Transactional
    public void deleteMaterial(Long id) {
        Material material = getMaterialById(id);
        material.setDeletedAt(LocalDateTime.now());
        material.setStatus(0);
        materialRepository.save(material);
    }
}
