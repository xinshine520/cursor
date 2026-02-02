package com.hyai.controller;

import com.hyai.common.Result;
import com.hyai.entity.Asset;
import com.hyai.service.AssetService;
import com.hyai.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@Tag(name = "资产接口", description = "资产管理相关接口")
@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
public class AssetController {
    
    private final AssetService assetService;
    private final JwtUtil jwtUtil;
    
    @Operation(summary = "获取资产列表")
    @GetMapping
    public Result<Page<Asset>> getAssets(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Asset> assets = assetService.getAssets(userId, category, pageable);
        return Result.success(assets);
    }
    
    @Operation(summary = "获取资产详情")
    @GetMapping("/{id}")
    public Result<Asset> getAsset(@PathVariable Long id) {
        Asset asset = assetService.getAssetById(id);
        return Result.success(asset);
    }
    
    @Operation(summary = "创建资产")
    @PostMapping
    public Result<Asset> createAsset(@RequestBody Asset asset, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        asset.setUserId(userId);
        Asset created = assetService.createAsset(asset);
        return Result.success("创建成功", created);
    }
    
    @Operation(summary = "更新资产")
    @PutMapping("/{id}")
    public Result<Asset> updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        Asset updated = assetService.updateAsset(id, asset);
        return Result.success("更新成功", updated);
    }
    
    @Operation(summary = "更新进度")
    @PutMapping("/{id}/progress")
    public Result<Asset> updateProgress(@PathVariable Long id, @RequestParam Integer progress) {
        Asset updated = assetService.updateProgress(id, progress);
        return Result.success("进度更新成功", updated);
    }
    
    @Operation(summary = "删除资产")
    @DeleteMapping("/{id}")
    public Result<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return Result.success("删除成功", null);
    }
    
    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null) {
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
