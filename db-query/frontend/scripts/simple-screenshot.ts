import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 简单示例：打开浏览器，访问网页并截图
 */
async function simpleDemo() {
  console.log('🚀 启动浏览器...');
  
  // 启动浏览器（headless: false 表示显示浏览器窗口）
  const browser = await chromium.launch({ 
    headless: false,      // 显示浏览器窗口
    slowMo: 500,         // 减慢操作速度，方便观察
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('📱 导航到 http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ 等待页面加载完成...');
    await page.waitForTimeout(2000);
    
    // 确保 images 目录存在
    const projectRoot = path.resolve(__dirname, '..', '..');
    const imagesDir = path.join(projectRoot, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`📁 创建目录: ${imagesDir}`);
    }
    
    // 截图
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const screenshotPath = path.join(imagesDir, `simple-screenshot-${timestamp}.png`);
    
    console.log('📸 正在截图...');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true  // 截取整个页面
    });
    
    console.log(`✅ 截图已保存到: ${screenshotPath}`);
    
    // 保持浏览器打开 3 秒，方便查看
    console.log('⏸️  保持浏览器打开 3 秒...');
    await page.waitForTimeout(3000);
    
  } finally {
    await browser.close();
    console.log('🔒 浏览器已关闭');
  }
}

// 运行示例
simpleDemo()
  .then(() => {
    console.log('✨ 示例执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 示例执行失败:', error);
    process.exit(1);
  });
