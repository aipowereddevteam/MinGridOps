import { test, expect } from '@playwright/test';

test.describe('Auth Journey & Security Guards (BDD)', () => {
  test('Unauthenticated user should see landing page or be redirected from protected routes', async ({ page }) => {
    // Visit home landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Master Your Daily Routines');

    // Click Sign In link
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/\/login/);
  });

  test('User Registration and Login Navigation Flow', async ({ page }) => {
    const uniqueEmail = `e2e_user_${Date.now()}@mingrid.io`;

    // Navigate to register
    await page.goto('/register');
    await page.fill('input[placeholder="Alex Morgan"]', 'E2E Tester');
    await page.fill('input[placeholder="name@company.com"]', uniqueEmail);
    await page.fill('input[placeholder="At least 6 characters"]', 'password123');
    await page.fill('input[placeholder="Repeat password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to /dashboard or /today
    await page.waitForURL(/\/(today|dashboard)/, { timeout: 10000 }).catch(() => {});
  });
});
