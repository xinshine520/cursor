import { test, expect } from './fixtures';

test.describe('Schema Explorer', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.setupMocks();
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should display schema explorer', async ({ page }) => {
    await expect(page.getByText(/鏋舵瀯娴忚鍣?i)).toBeVisible();
  });

  test('should load schema when connection is selected', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectionCard = page.locator('text=Test Connection').first();
    await expect(connectionCard).toBeVisible({ timeout: 5000 });
    await connectionCard.click();
    await expect(page.getByText(/琛ㄥ拰瑙嗗浘|Tables & Views/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/users/i)).toBeVisible({ timeout: 5000 });
  });

  test('should search tables', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectionCard = page.locator('text=Test Connection').first();
    await expect(connectionCard).toBeVisible({ timeout: 5000 });
    await connectionCard.click();
    await page.waitForTimeout(2000);
    const searchInput = page.getByPlaceholder(/鎼滅储琛?i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill('user');
    await page.waitForTimeout(500);
    await expect(page.getByText(/users/i)).toBeVisible();
  });
});
