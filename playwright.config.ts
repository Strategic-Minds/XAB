import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'https://xab-system.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium-headless', use: { browserName: 'chromium', headless: true } },
    { name: 'mobile-chrome', use: { browserName: 'chromium', headless: true, viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
