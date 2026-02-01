import { test, expect } from './fixtures';

test.describe('HomePage', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.setupMocks();
    await page.goto('/');
  });

  test('should display page title and navigation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /鏁版嵁鏌ヨ宸ュ叿/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /杩炴帴绠＄悊/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /SQL 鏌ヨ/i })).toBeVisible();
  });

  test('should display connections section', async ({ page }) => {
    await expect(page.getByText(/杩炴帴绠＄悊/i)).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Test Connection')).toBeVisible({ timeout: 5000 });
  });

  test('should display schema explorer', async ({ page }) => {
    await expect(page.getByText(/鏋舵瀯娴忚鍣?i)).toBeVisible();
  });

  test('should display add connection form', async ({ page }) => {
    await page.getByText(/娣诲姞鏁版嵁搴撹繛鎺?i).scrollIntoViewIfNeeded();
    await expect(page.getByText(/娣诲姞鏁版嵁搴撹繛鎺?i)).toBeVisible();
    await expect(page.getByLabel(/杩炴帴鍚嶇О/i)).toBeVisible();
    await expect(page.getByLabel(/PostgreSQL 杩炴帴 URL/i)).toBeVisible();
  });

  test('should switch language', async ({ page }) => {
    const langSelect = page.locator('select').filter({ hasText: /涓枃|English/ });
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('en');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /Data Query Tool/i })).toBeVisible();
    await langSelect.selectOption('zh');
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /鏁版嵁鏌ヨ宸ュ叿/i })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeButton = page.getByRole('button').filter({ hasText: /鈽€锔弢馃寵/ });
    await expect(themeButton).toBeVisible();
    const initialTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await themeButton.click();
    await page.waitForTimeout(300);
    const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(newTheme).not.toBe(initialTheme);
  });
});
