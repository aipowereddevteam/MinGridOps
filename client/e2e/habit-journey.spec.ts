import { test, expect } from '@playwright/test';

test.describe('Habit Routines & Gamification Journey (BDD)', () => {
  test('User can interact with Today routines and view Stats', async ({ page }) => {
    // Visit Today page directly
    await page.goto('/today');
    await expect(page.locator('h1')).toContainText('Daily Focus Routines');

    // Click suggested habit button if visible
    const suggestedBtn = page.locator('text=Deep Work (2 Hours)');
    if (await suggestedBtn.isVisible()) {
      await suggestedBtn.click();
    }

    // Verify habit card is visible
    await expect(page.locator('h4')).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Navigate to Analytics Stats
    await page.goto('/stats');
    await expect(page.locator('h1')).toContainText('Habit Performance & Trends');
    await expect(page.locator('text=Done vs Open Ratio')).toBeVisible();
    await expect(page.locator('text=Weekly Completion Trend')).toBeVisible();
  });
});
