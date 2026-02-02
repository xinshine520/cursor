/**
 * Vite 配置 - 微信小程序优化版
 * 
 * 优化项：
 * 1. 代码压缩和混淆
 * 2. Tree Shaking
 * 3. 代码分割
 * 4. 移除 console 和 debugger
 * 5. CSS 压缩
 * 
 * 使用方法：
 * 1. 备份当前 vite.config.ts
 * 2. 重命名此文件为 vite.config.ts
 * 3. 运行 pnpm run build:mp-weixin
 */

import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [uni()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
    host: '0.0.0.0'
  },
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    assetsDir: 'static',
    
    // 代码压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        // 移除 debugger
        drop_debugger: true,
        // 移除特定函数调用
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // 移除未使用的代码
        dead_code: true,
        // 优化条件表达式
        conditionals: true,
        // 计算常量表达式
        evaluate: true,
        // 优化布尔值
        booleans: true,
      },
      mangle: {
        // 混淆变量名
        toplevel: true,
        // 保留类名
        keep_classnames: false,
        // 保留函数名
        keep_fnames: false,
      },
      format: {
        // 移除注释
        comments: false,
      }
    },
    
    // 禁用 source map（生产环境）
    sourcemap: false,
    
    // 代码分割配置
    rollupOptions: {
      output: {
        // 手动分块
        manualChunks: {
          // Vue 相关
          'vue-vendor': ['vue'],
          // Pinia 状态管理
          'pinia-vendor': ['pinia'],
          // Mock 数据（如果生产环境不需要，可以移除）
          // 'mock-data': ['./src/api/mockData.ts']
        },
        
        // 分块文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      
      // 外部依赖（如果有 CDN）
      external: [],
    },
    
    // 警告阈值（500KB）
    chunkSizeWarningLimit: 500,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 目标环境
    target: 'es2015',
    
    // 构建后清空输出目录
    emptyOutDir: true,
  },
  
  // CSS 配置
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/uni.scss";`
      }
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        // CSS 压缩
        require('cssnano')({
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
          }]
        })
      ]
    }
  },
  
  // 依赖优化
  optimizeDeps: {
    exclude: ['webpack'],
    include: ['vue', 'pinia']
  },
  
  // 环境变量
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PROD__: process.env.NODE_ENV === 'production'
  }
})
