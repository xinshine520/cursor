# 测试优化脚本

## ✅ 脚本已修复

PowerShell 脚本已经重写为英文版本，解决了中文编码问题。

## 📝 如何使用

### 在 PowerShell 中运行

打开 PowerShell，然后：

```powershell
# 1. 进入项目目录
cd e:\DevSample\Cursor\hy-video-app\frontend

# 2. 仅检查（推荐先运行这个）
.\optimize-miniprogram.ps1 -CheckOnly

# 3. 执行优化并构建
.\optimize-miniprogram.ps1 -BuildAfter

# 4. 完整优化
.\optimize-miniprogram.ps1 -FullOptimize -BuildAfter
```

### 如果遇到执行策略错误

```powershell
# 设置执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或者使用 Bypass 运行
powershell -ExecutionPolicy Bypass -File .\optimize-miniprogram.ps1 -CheckOnly
```

## 📊 脚本功能

### 检查模式 (-CheckOnly)

脚本会检查以下6个方面：

1. **大文件检查** - 查找 > 100KB 的文件
   ```
   [1/6] Checking large files...
   ```

2. **Mock 数据检查** - 分析 mockData.ts 大小
   ```
   [2/6] Checking Mock data...
   ```

3. **Vite 配置检查** - 验证是否启用压缩
   ```
   [3/6] Checking Vite config...
   ```

4. **分包配置检查** - 检查是否配置分包
   ```
   [4/6] Checking subpackage config...
   ```

5. **包大小估算** - 估算构建后的大小
   ```
   [5/6] Estimating package size...
   ```

6. **优化建议** - 提供优化建议
   ```
   [6/6] Optimization suggestions...
   ```

## 🎯 预期输出示例

```
========================================
  WeChat MiniProgram Optimizer
========================================

[1/6] Checking large files...
  [OK] No large files found

[2/6] Checking Mock data...
  mockData.ts: 156.78 KB
  [Warning] Mock data is large, suggest removing in production

[3/6] Checking Vite config...
  [Warning] Code minification not configured
  [Warning] Console removal not configured

[4/6] Checking subpackage config...
  [Info] No subpackages configured

[5/6] Estimating package size...
  [Info] Build directory not found, please build first

[6/6] Optimization suggestions...

Check completed!

Optimization suggestions:
  1. Use vite.config.optimized.ts to replace current config
  2. Compress or remove large files in static directory
  3. Remove Mock data in production
  4. For subpackages, see WECHAT-MINIPROGRAM-OPTIMIZATION.md
```

## 🔧 手动优化（如果脚本无法运行）

如果 PowerShell 脚本无法运行，可以手动执行以下操作：

### 1. 应用优化配置
```powershell
cp vite.config.ts vite.config.ts.backup
cp vite.config.optimized.ts vite.config.ts
```

### 2. 检查大文件
```powershell
Get-ChildItem -Path src\static -Recurse -File | Where-Object { $_.Length -gt 100KB }
```

### 3. 检查 Mock 数据大小
```powershell
(Get-Item src\api\mockData.ts).Length / 1KB
```

### 4. 构建测试
```powershell
pnpm run build:mp-weixin
```

### 5. 检查包大小
```powershell
(Get-ChildItem -Path dist\build\mp-weixin -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
```

## 📚 相关文档

- `SCRIPT-FIXED.md` - 脚本修复说明
- `QUICK-OPTIMIZATION.md` - 快速优化指南
- `OPTIMIZATION-README.md` - 完整文档索引
- `vite.config.optimized.ts` - 优化配置文件

## ✅ 验证脚本已修复

运行以下命令验证脚本可以正常执行：

```powershell
cd e:\DevSample\Cursor\hy-video-app\frontend
.\optimize-miniprogram.ps1 -CheckOnly
```

如果看到带颜色的输出和 6 个检查步骤，说明脚本工作正常！

## 🎉 总结

- ✅ 脚本已修复（移除中文字符）
- ✅ 全英文输出
- ✅ 支持 3 种运行模式
- ✅ 提供详细的检查报告
- ✅ 可选的自动优化功能

现在可以直接在 PowerShell 终端中运行脚本了！
