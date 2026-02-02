package com.hyai.service;

import com.hyai.entity.Asset;
import com.hyai.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AssetService {
    
    private final AssetRepository assetRepository;
    
    public Page<Asset> getAssets(Long userId, String category, Pageable pageable) {
        if (category != null && !category.isEmpty()) {
            if (userId != null) {
                return assetRepository.findByUserIdAndCategoryAndDeletedAtIsNull(userId, category, pageable);
            } else {
                return assetRepository.findByCategoryAndDeletedAtIsNull(category, pageable);
            }
        } else {
            if (userId != null) {
                return assetRepository.findByUserIdAndDeletedAtIsNull(userId, pageable);
            } else {
                return assetRepository.findAll(pageable);
            }
        }
    }
    
    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资产不存在"));
    }
    
    @Transactional
    public Asset createAsset(Asset asset) {
        asset.setStatus(1);
        asset.setProgress(0);
        return assetRepository.save(asset);
    }
    
    @Transactional
    public Asset updateAsset(Long id, Asset asset) {
        Asset existingAsset = getAssetById(id);
        if (asset.getTitle() != null) {
            existingAsset.setTitle(asset.getTitle());
        }
        if (asset.getDescription() != null) {
            existingAsset.setDescription(asset.getDescription());
        }
        if (asset.getUrl() != null) {
            existingAsset.setUrl(asset.getUrl());
        }
        if (asset.getThumbnail() != null) {
            existingAsset.setThumbnail(asset.getThumbnail());
        }
        return assetRepository.save(existingAsset);
    }
    
    @Transactional
    public Asset updateProgress(Long id, Integer progress) {
        Asset asset = getAssetById(id);
        asset.setProgress(progress);
        if (progress >= 100) {
            asset.setStatus(2); // 已完成
        }
        return assetRepository.save(asset);
    }
    
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = getAssetById(id);
        asset.setDeletedAt(LocalDateTime.now());
        asset.setStatus(3);
        assetRepository.save(asset);
    }
}
