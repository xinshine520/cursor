import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Demo script: Open browser, navigate, interact, and take screenshot
 */
async function demoFlow() {
  let browser: Browser | null = null;
  
  try {
    // Launch browser (headed mode so you can see it)
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Set to true to run without visible browser
      slowMo: 500, // Slow down operations by 500ms for better visibility
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    
    const page = await context.newPage();
    
    // Navigate to homepage
    console.log('📱 Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Click on "SQL 查询" link
    console.log('🔗 Clicking "SQL 查询" link...');
    await page.getByRole('link', { name: /SQL 查询/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify we're on the query page
    await page.waitForSelector('h1:has-text("SQL 查询")', { timeout: 5000 });
    console.log('✅ Successfully navigated to SQL Query page');
    
    // Select connection if available
    const connectionSelect = page.locator('select#connection-select');
    if (await connectionSelect.isVisible()) {
      console.log('🔌 Selecting connection...');
      await connectionSelect.selectOption({ index: 1 }); // Select first available connection
      await page.waitForTimeout(500);
    }
    
    // Find and fill natural language query input
    console.log('✍️  Filling natural language query...');
    const nlqInput = page.getByPlaceholder(/描述您想要查询的内容/i);
    await nlqInput.waitFor({ state: 'visible', timeout: 5000 });
    await nlqInput.fill('查询所有 tickets 表记录');
    await page.waitForTimeout(500);
    
    // Click "生成 SQL" button
    console.log('⚡ Clicking "生成 SQL" button...');
    const generateButton = page.getByRole('button', { name: /生成 SQL/i });
    await generateButton.click();
    
    // Wait for SQL to be generated
    console.log('⏳ Waiting for SQL generation...');
    await page.waitForSelector('text=/生成的 SQL/i', { timeout: 15000 });
    await page.waitForSelector('text=/SELECT/i', { timeout: 5000 });
    console.log('✅ SQL generated successfully');
    
    // Wait a bit for the UI to stabilize
    await page.waitForTimeout(1000);
    
    // Click "使用此查询" button to copy SQL to editor (if available)
    const useQueryButton = page.getByRole('button', { name: /使用此查询/i });
    if (await useQueryButton.isVisible({ timeout: 2000 })) {
      console.log('📋 Clicking "使用此查询" to copy SQL to editor...');
      await useQueryButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Click "执行查询" button
    console.log('▶️  Clicking "执行查询" button...');
    const executeButton = page.getByRole('button', { name: /执行查询/i });
    await executeButton.waitFor({ state: 'visible', timeout: 5000 });
    await executeButton.click();
    
    // Wait for query results
    console.log('⏳ Waiting for query results...');
    await page.waitForSelector('text=/查询结果/i', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for table to render
    console.log('✅ Query executed successfully');
    
    // Ensure images directory exists
    const projectRoot = path.resolve(__dirname, '..', '..');
    const imagesDir = path.join(projectRoot, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`📁 Created directory: ${imagesDir}`);
    }
    
    // Take screenshot with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const screenshotPath = path.join(imagesDir, `query-results-${timestamp}.png`);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    
    console.log(`✅ Screenshot saved to: ${screenshotPath}`);
    
    // Verify screenshot was created
    if (fs.existsSync(screenshotPath)) {
      const stats = fs.statSync(screenshotPath);
      console.log(`📊 Screenshot size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
    
    // Keep browser open for a moment to see the result
    console.log('⏸️  Keeping browser open for 3 seconds...');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error occurred:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run the demo
demoFlow()
  .then(() => {
    console.log('✨ Demo completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  });
