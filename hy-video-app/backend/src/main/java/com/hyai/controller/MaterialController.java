package com.hyai.controller;

import com.hyai.common.Result;
import com.hyai.entity.Material;
import com.hyai.service.MaterialService;
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

@Tag(name = "素材接口", description = "素材管理相关接口")
@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {
    
    private final MaterialService materialService;
    private final JwtUtil jwtUtil;
    
    @Operation(summary = "获取素材列表")
    @GetMapping
    public Result<Page<Material>> getMaterials(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Material> materials = materialService.getMaterials(userId, category, pageable);
        return Result.success(materials);
    }
    
    @Operation(summary = "获取素材详情")
    @GetMapping("/{id}")
    public Result<Material> getMaterial(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        return Result.success(material);
    }
    
    @Operation(summary = "创建素材")
    @PostMapping
    public Result<Material> createMaterial(@RequestBody Material material, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        material.setUserId(userId);
        Material created = materialService.createMaterial(material);
        return Result.success("创建成功", created);
    }
    
    @Operation(summary = "更新素材")
    @PutMapping("/{id}")
    public Result<Material> updateMaterial(@PathVariable Long id, @RequestBody Material material) {
        Material updated = materialService.updateMaterial(id, material);
        return Result.success("更新成功", updated);
    }
    
    @Operation(summary = "删除素材")
    @DeleteMapping("/{id}")
    public Result<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
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
