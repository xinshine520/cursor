import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 交互式示例：点击按钮、填写表单并截图
 */
async function interactiveDemo() {
  console.log('🚀 启动浏览器...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800, // 减慢操作速度
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 1. 导航到首页
    console.log('📱 访问首页...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // 2. 点击 "SQL 查询" 链接
    console.log('🔗 点击 "SQL 查询" 链接...');
    await page.getByRole('link', { name: /SQL 查询/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 3. 填写自然语言查询
    console.log('✍️  填写自然语言查询...');
    const nlqInput = page.getByPlaceholder(/描述您想要查询的内容/i);
    await nlqInput.waitFor({ state: 'visible', timeout: 5000 });
    await nlqInput.fill('查询所有 tickets 表记录');
    await page.waitForTimeout(500);
    
    // 4. 点击 "生成 SQL" 按钮
    console.log('⚡ 点击 "生成 SQL" 按钮...');
    const generateButton = page.getByRole('button', { name: /生成 SQL/i });
    await generateButton.click();
    
    // 5. 等待 SQL 生成
    console.log('⏳ 等待 SQL 生成...');
    await page.waitForSelector('text=/SELECT/i', { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // 6. 截图（SQL 生成后的状态）
    const projectRoot = path.resolve(__dirname, '..', '..');
    const imagesDir = path.join(projectRoot, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const screenshotPath = path.join(imagesDir, `interactive-demo-${timestamp}.png`);
    
    console.log('📸 正在截图...');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    console.log(`✅ 截图已保存到: ${screenshotPath}`);
    
    // 7. 保持浏览器打开以便查看
    console.log('⏸️  保持浏览器打开 5 秒...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 发生错误:', error);
    
    // 即使出错也截图
    try {
      const page = await browser.newPage();
      const projectRoot = path.resolve(__dirname, '..', '..');
      const imagesDir = path.join(projectRoot, 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const errorScreenshotPath = path.join(imagesDir, `error-${Date.now()}.png`);
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 错误截图已保存到: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('无法保存错误截图:', screenshotError);
    }
    
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 浏览器已关闭');
  }
}

// 运行示例
interactiveDemo()
  .then(() => {
    console.log('✨ 交互式示例执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 交互式示例执行失败:', error);
    process.exit(1);
  });
