import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.resolve(__dirname, 'dist')
const PORT = Number(process.env.PORT || 4173)

// 可选：部署到子路径时使用，例如 /huayue
const BASE_PATH_RAW = String(process.env.BASE_PATH || '/')
const BASE_PATH = BASE_PATH_RAW === '/' ? '/' : `/${BASE_PATH_RAW.replace(/^\/|\/$/g, '')}`

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function stripBasePath(urlPath) {
  if (BASE_PATH === '/') return urlPath
  if (!urlPath.startsWith(BASE_PATH)) return null
  const stripped = urlPath.slice(BASE_PATH.length)
  return stripped.startsWith('/') ? stripped : `/${stripped}`
}

async function fileExists(p) {
  try {
    const stat = await fs.stat(p)
    return stat.isFile()
  } catch {
    return false
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url || '/', 'http://localhost')
    const pathname = urlObj.pathname

    const stripped = stripBasePath(pathname)
    if (stripped === null) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
      return
    }

    // 静态资源优先
    const candidatePath = path.join(DIST_DIR, decodeURIComponent(stripped))
    const safePath = path.resolve(candidatePath)
    if (!safePath.startsWith(DIST_DIR)) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Bad Request')
      return
    }

    if (await fileExists(safePath)) {
      const data = await fs.readFile(safePath)
      res.writeHead(200, { 'Content-Type': getContentType(safePath) })
      res.end(data)
      return
    }

    // SPA History 回退：所有非文件请求返回 index.html
    const indexPath = path.join(DIST_DIR, 'index.html')
    const indexHtml = await fs.readFile(indexPath)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(indexHtml)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
    console.error('服务端错误:', err)
  }
})

server.listen(PORT, () => {
  console.log(`静态站点已启动: http://localhost:${PORT}${BASE_PATH === '/' ? '' : BASE_PATH}`)
  console.log(`dist 目录: ${DIST_DIR}`)
})


