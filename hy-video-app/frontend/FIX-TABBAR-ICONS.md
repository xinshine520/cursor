# 修复 TabBar 图标格式问题

## ✅ 问题已解决

微信小程序不支持 SVG 格式的图标，只支持 `.png`、`.jpg`、`.jpeg` 格式。

## 🔧 修复内容

### 1. 创建 PNG 图标
已为所有 TabBar 图标创建了 PNG 版本：

- ✅ `home.png` / `home-active.png` - 首页图标
- ✅ `folder.png` / `folder-active.png` - 素材图标
- ✅ `briefcase.png` / `briefcase-active.png` - 资产图标
- ✅ `user.png` / `user-active.png` - 我的图标

### 2. 更新 pages.json
已将 `pages.json` 中的所有图标路径从 `.svg` 改为 `.png`：

```json
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/home.png",           // ✅ 已更新
        "selectedIconPath": "static/home-active.png"  // ✅ 已更新
      },
      // ... 其他图标也已更新
    ]
  }
}
```

## 📁 文件位置

所有图标文件位于：
```
src/static/
├── home.png
├── home-active.png
├── folder.png
├── folder-active.png
├── briefcase.png
├── briefcase-active.png
├── user.png
└── user-active.png
```

## 🎨 图标规格

- **尺寸**: 40x40 像素
- **格式**: PNG
- **未选中状态**: 灰色图标
- **选中状态**: 蓝色图标（#2563EB）

## ✅ 验证

1. ✅ PNG 图标文件已创建
2. ✅ `pages.json` 已更新
3. ✅ 项目已重新构建
4. ✅ 构建成功完成

## 🚀 下一步

现在可以在微信开发者工具中预览小程序了：

1. 打开微信开发者工具
2. 导入 `dist\build\mp-weixin` 目录
3. 预览小程序，TabBar 图标应该正常显示

## 📝 注意事项

- SVG 图标文件仍然保留在 `static` 目录中，但不会被使用
- 如果需要更换图标，请使用 PNG 格式
- 图标建议尺寸：81x81 像素（微信小程序推荐）
- 当前图标为 40x40 像素，适合 TabBar 使用

## 🔄 如需自定义图标

如果需要更换图标：

1. 准备 PNG 格式的图标（建议 81x81 像素）
2. 替换 `src/static/` 目录中对应的 PNG 文件
3. 重新构建项目：`pnpm run build:mp-weixin`

## ✅ 状态

- ✅ 图标格式问题已修复
- ✅ 构建成功
- ✅ 可以正常预览
