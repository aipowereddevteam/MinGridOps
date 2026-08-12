import { test, expect } from '@playwright/test';

test.describe('Leaderboard & Community Rankings BDD Journey', () => {
  test('should navigate to /leaderboard and display podium headers', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('h1')).toContainText('Habit Champions Podium');
  });

  test('should render timeframe tab buttons', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.getByRole('button', { name: /today/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /month/i })).toBeVisible();
  });
});
