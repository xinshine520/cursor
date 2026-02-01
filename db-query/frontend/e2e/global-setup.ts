import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Optional: Setup test environment
  // For example, seed test data, start services, etc.
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Check if backend is running
  try {
    await page.goto('http://localhost:8000/health', { timeout: 5000 });
    console.log('✅ Backend server is running');
  } catch (error) {
    console.warn('⚠️  Backend server is not running. Some tests may fail.');
    console.warn('   Start backend with: cd backend && uv run uvicorn src.main:app --reload --port 8000');
  }
  
  await browser.close();
}

export default globalSetup;
