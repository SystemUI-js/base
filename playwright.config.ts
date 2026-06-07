import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 配置：仅 Chromium，使用 Vite dev server (9073)
 * 与 Vitest 并存，专注真实浏览器拖拽等 E2E 场景
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:9073',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:9073',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
