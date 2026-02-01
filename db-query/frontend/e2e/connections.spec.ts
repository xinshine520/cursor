import { test, expect } from './fixtures';

test.describe('Connection Management', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.setupMocks();
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should display connection form', async ({ page }) => {
    await page.getByText(/娣诲姞鏁版嵁搴撹繛鎺?i).scrollIntoViewIfNeeded();
    await expect(page.getByText(/娣诲姞鏁版嵁搴撹繛鎺?i)).toBeVisible();
    await expect(page.getByLabel(/杩炴帴鍚嶇О/i)).toBeVisible();
    await expect(page.getByLabel(/PostgreSQL 杩炴帴 URL/i)).toBeVisible();
  });

  test('should validate connection form', async ({ page }) => {
    const nameInput = page.getByLabel(/杩炴帴鍚嶇О/i);
    const urlInput = page.getByLabel(/PostgreSQL 杩炴帴 URL/i);
    const submitButton = page.getByRole('button', { name: /杩炴帴/i });
    await nameInput.fill('Test');
    await submitButton.click();
    const urlRequired = await urlInput.evaluate((el: HTMLInputElement) => el.required);
    expect(urlRequired).toBeTruthy();
  });

  test('should display connection list', async ({ page }) => {
    await page.waitForTimeout(1000);
    await expect(page.getByText('Test Connection')).toBeVisible({ timeout: 5000 });
  });

  test('should select connection', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectionCard = page.locator('text=Test Connection').first();
    await expect(connectionCard).toBeVisible({ timeout: 5000 });
    await connectionCard.click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Active|娲诲姩/i)).toBeVisible({ timeout: 2000 });
  });
});
