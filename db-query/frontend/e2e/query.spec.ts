import { test, expect } from './fixtures';

test.describe('SQL Query Page', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.setupMocks();
    await page.goto('/query');
    await page.waitForTimeout(1000);
  });

  test('should display query page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /SQL 鏌ヨ/i })).toBeVisible();
    await expect(page.getByText(/缂栧啓鍜屾墽琛?SQL 鏌ヨ/i)).toBeVisible();
  });

  test('should display connection selector', async ({ page }) => {
    const connectionSelect = page.locator('select#connection-select');
    await expect(connectionSelect).toBeVisible();
  });

  test('should display natural language query input', async ({ page }) => {
    await expect(page.getByText(/鑷劧璇█鏌ヨ/i)).toBeVisible();
    const nlqInput = page.getByPlaceholder(/鎻忚堪鎮ㄦ兂瑕佹煡璇㈢殑鍐呭/i);
    await expect(nlqInput).toBeVisible();
    const generateButton = page.getByRole('button', { name: /鐢熸垚 SQL/i });
    await expect(generateButton).toBeVisible();
  });

  test('should generate SQL from natural language', async ({ page }) => {
    const nlqInput = page.getByPlaceholder(/鎻忚堪鎮ㄦ兂瑕佹煡璇㈢殑鍐呭/i);
    const generateButton = page.getByRole('button', { name: /鐢熸垚 SQL/i });
    await nlqInput.fill('鏌ヨ鏌愭煇琛ㄦ墍鏈夎褰?);
    await generateButton.click();
    await expect(page.getByText(/鐢熸垚鐨?SQL/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/SELECT \* FROM users/i)).toBeVisible({ timeout: 5000 });
  });
});
