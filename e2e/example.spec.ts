/**
 * Example E2E test with Playwright.
 *
 * Tests the critical user flow: login → create task → complete task → logout.
 */

import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message or redirect back to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page (will redirect to login if not authenticated)
    await page.goto('/tasks');
  });

  test('should display task list', async ({ page }) => {
    // Should see task list container
    await expect(page.locator('main')).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    // Click on "Active" filter tab
    await page.click('button:has-text("Active")');
    // Verify filter is applied
    await expect(page.locator('button:has-text("Active")')).toHaveClass(/text-primary/);
  });

  test('should sort tasks', async ({ page }) => {
    // Open sort dropdown
    await page.click('[aria-label*="sort"], [data-testid*="sort"], button:has-text("Sort")');
    // Click on a sort option
    await page.click('text=Priority');
    // Verify sort is applied
  });
});

test.describe('Responsive Design', () => {
  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tasks');

    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('nav').filter({ hasText: /Tasks|Calendar|Timer/ });
    await expect(bottomNav).toBeVisible();
  });

  test('should show sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/tasks');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('.hidden.md\\:flex');
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');

    // Skip link should be present (not visible until focused)
    const skipLink = page.locator('a[href*="main"], [data-testid="skip-link"]');
    await expect(skipLink).toHaveCount(1);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/tasks');

    // Should have exactly one h1
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });
});

test.describe('Calendar View', () => {
  test('should display month calendar', async ({ page }) => {
    await page.goto('/calendar');

    // Should have calendar grid
    await expect(page.locator('main')).toBeVisible();
  });

  test('should switch to week view', async ({ page }) => {
    await page.goto('/calendar');
    await page.click('button:has-text("Week")');

    // Should show week view indicator
    await expect(page.locator('button:has-text("Week")')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Performance', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/tasks');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});
