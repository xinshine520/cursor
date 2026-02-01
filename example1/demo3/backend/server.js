import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// 中间件配置
app.use(cors())
app.use(express.json())

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads')
const outputDir = path.join(__dirname, 'outputs')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 配置 Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 允许所有文件类型
    cb(null, true)
  }
})

// 文件转换接口（简化版，实际需要根据文件类型使用不同的转换库）
app.post('/api/convert/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '未上传文件' })
    }

    const targetFormat = req.body.targetFormat || 'pdf'
    const inputPath = req.file.path
    const outputPath = path.join(outputDir, `converted.${targetFormat}`)

    // 注意：这里只是示例，实际的文件转换需要根据文件类型使用相应的库
    // 例如：docx 转 pdf 需要 mammoth 或 libreoffice
    // 这里我们只是简单地将文件复制并返回
    fs.copyFileSync(inputPath, outputPath)

    res.download(outputPath, (err) => {
      if (err) {
        console.error('下载错误:', err)
        res.status(500).json({ message: '文件下载失败' })
      }
      // 清理临时文件
      setTimeout(() => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      }, 1000)
    })
  } catch (error) {
    console.error('文件转换错误:', error)
    res.status(500).json({ message: '文件转换失败: ' + error.message })
  }
})

// 图片格式转换接口
app.post('/api/convert/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '未上传图片' })
    }

    const targetFormat = req.body.targetFormat || 'png'
    const inputPath = req.file.path
    const outputPath = path.join(outputDir, `converted.${targetFormat}`)

    // 使用 Sharp 进行图片格式转换
    let sharpInstance = sharp(inputPath)

    // 根据目标格式进行转换
    switch (targetFormat.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: 90 })
        break
      case 'png':
        sharpInstance = sharpInstance.png()
        break
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: 90 })
        break
      case 'gif':
        sharpInstance = sharpInstance.gif()
        break
      case 'bmp':
        sharpInstance = sharpInstance.bmp()
        break
      default:
        sharpInstance = sharpInstance.png()
    }

    await sharpInstance.toFile(outputPath)

    res.download(outputPath, `converted.${targetFormat}`, (err) => {
      if (err) {
        console.error('下载错误:', err)
        res.status(500).json({ message: '文件下载失败' })
      }
      // 清理临时文件
      setTimeout(() => {
        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      }, 1000)
    })
  } catch (error) {
    console.error('图片转换错误:', error)
    res.status(500).json({ message: '图片转换失败: ' + error.message })
  }
})

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})

