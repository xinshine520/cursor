# 文件与图片处理工具

基于 React + Node.js 的文件与图片处理系统，提供文件转换、图片压缩、裁剪、格式转换和水印等功能。

## 项目结构

```
demo3/
├── frontend/          # 前端 React 应用
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── App.jsx        # 主应用组件
│   │   └── main.jsx       # 入口文件
│   ├── package.json
│   └── vite.config.js
├── backend/           # 后端 Node.js 服务
│   ├── server.js      # 服务器主文件
│   ├── uploads/       # 上传文件临时目录
│   └── outputs/       # 输出文件临时目录
├── web-instruction.md # 架构设计文档
└── README.md          # 项目说明文档
```

## 功能模块

### 1. 文件转换
- 支持多种文档格式转换（PDF、DOCX、TXT、HTML等）
- 需要后端服务支持

### 2. 图片压缩
- 纯前端实现，使用 browser-image-compression 库
- 可调节压缩质量
- 实时预览压缩效果

### 3. 图片裁剪
- 纯前端实现，使用 react-image-crop 组件
- 自由选择裁剪区域
- 支持比例锁定

### 4. 图片格式转换
- 后端使用 Sharp 库处理
- 支持 PNG、JPG、WebP、GIF、BMP 等格式

### 5. 图片水印
- 纯前端实现，使用 fabric.js 库
- 支持文字水印
- 可调节字体大小和透明度

## 技术栈

### 前端
- React.js 18
- Ant Design 5
- React Router 6
- Axios
- browser-image-compression
- react-image-crop
- fabric.js
- Vite

### 后端
- Node.js
- Express
- Multer（文件上传）
- Sharp（图片处理）
- CORS

## 安装和运行

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

### 后端

```bash
cd backend
npm install
npm start
```

后端服务将运行在 http://localhost:3001

## 使用说明

1. 启动后端服务（必须）
2. 启动前端服务
3. 在浏览器中访问 http://localhost:3000
4. 选择相应的功能模块进行操作

## API 接口

### 文件转换
- POST `/api/convert/file`
  - 参数：file (文件), targetFormat (目标格式)
  - 返回：转换后的文件

### 图片格式转换
- POST `/api/convert/image`
  - 参数：file (图片文件), targetFormat (目标格式)
  - 返回：转换后的图片

### 健康检查
- GET `/api/health`
  - 返回：服务状态

## 注意事项

1. 文件上传大小限制为 50MB
2. 临时文件会在处理完成后自动清理
3. 文件转换功能需要根据实际需求集成相应的转换库（如 LibreOffice、mammoth 等）
4. 建议在生产环境中添加身份验证和请求频率限制

## 开发说明

- 前端使用 Vite 作为构建工具
- 后端使用 ES6 模块语法
- 代码遵循项目规范，使用中文注释

## 许可证

MIT License

