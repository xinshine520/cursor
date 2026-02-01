# TechCorp 企业官网

一个采用 Apple 官网设计风格的企业官网模板，具有现代化的设计和流畅的用户体验。

## 特性

- 🎨 **Apple 风格设计** - 简洁、优雅、现代的设计风格
- 📱 **完全响应式** - 适配桌面、平板和移动设备
- ⚡ **流畅动画** - 平滑的滚动和交互动画效果
- 🎯 **性能优化** - 轻量级代码，快速加载
- ♿ **可访问性** - 符合 Web 可访问性标准

## 文件结构

```
demo2/
├── index.html           # 主页面
├── product-detail.html  # 产品详情页面
├── styles.css           # 样式文件
├── script.js            # JavaScript 交互
└── README.md            # 说明文档
```

## 页面结构

### 首页 (index.html)

1. **导航栏** - 固定顶部导航，支持移动端菜单
2. **主视觉区域** - 大图背景的 Hero 区域
3. **产品展示** - 产品卡片网格布局，点击可跳转到详情页
4. **特色展示** - 左右分栏的特色介绍
5. **服务区域** - 服务项目展示
6. **关于我们** - 公司介绍和统计数据
7. **联系表单** - 联系信息和表单
8. **页脚** - 网站信息和链接

### 产品详情页 (product-detail.html)

1. **面包屑导航** - 显示当前位置
2. **产品图片展示** - 大图展示产品
3. **产品信息** - 标题、描述、特性列表
4. **技术规格** - 详细的技术参数表格
5. **产品详情** - 核心优势和应用场景
6. **操作按钮** - 联系咨询和返回产品列表

**URL 参数说明：**
- `?product=platform` - 智能平台
- `?product=cloud` - 云服务
- `?product=analytics` - 数据分析

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 或者使用本地服务器：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (需要安装 http-server)
   npx http-server
   ```
3. 在浏览器中访问 `http://localhost:8000`

## 自定义

### 修改颜色主题

在 `styles.css` 文件的 `:root` 变量中修改：

```css
:root {
    --primary-color: #0071e3;      /* 主色调 */
    --primary-hover: #0077ed;       /* 悬停色 */
    --text-primary: #1d1d1f;        /* 主文本色 */
    --text-secondary: #86868b;      /* 次要文本色 */
    --bg-white: #ffffff;            /* 白色背景 */
    --bg-light: #f5f5f7;           /* 浅色背景 */
}
```

### 修改内容

直接编辑 `index.html` 文件中的文本内容，包括：
- 公司名称和 Logo
- 产品介绍
- 服务内容
- 联系信息

### 添加图片

将图片文件放在项目目录中，然后在 HTML 中替换占位符：

```html
<!-- 替换占位符 -->
<div class="product-placeholder"></div>

<!-- 使用实际图片 -->
<img src="images/product1.jpg" alt="产品图片">
```

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 技术栈

- HTML5
- CSS3 (使用 CSS 变量、Grid、Flexbox)
- Vanilla JavaScript (无依赖)

## 许可证

MIT License - 可自由使用和修改

## 更新日志

### v1.1.0 (2024)
- 新增产品详情页面
- 支持通过 URL 参数动态加载不同产品信息
- 更新首页产品链接，可跳转到详情页
- 产品详情页包含完整的产品信息、特性、规格和详情

### v1.0.0 (2024)
- 初始版本发布
- 完整的响应式设计
- 平滑滚动和动画效果
- 移动端菜单支持

