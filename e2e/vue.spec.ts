import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('situation-page')).not.toContainText('三维态势展示')
  await expect(page.getByTestId('situation-map')).toBeVisible()
  await expect(page.getByTestId('legend-panel')).not.toContainText('目标类型图标')
  await expect(page.getByTestId('legend-panel')).not.toContainText('8 类')
  await expect(page.getByTestId('legend-panel')).toContainText('III类设备')
  await expect(page.getByTestId('situation-toolbar')).toBeVisible()
})
