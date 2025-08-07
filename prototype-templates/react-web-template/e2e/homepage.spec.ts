import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/PROJECT_NAME_PLACEHOLDER/)
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'A modern web application built with Next.js')
  })

  test('should display hero section with correct content', async ({ page }) => {
    // Check hero heading
    const heroHeading = page.getByRole('heading', { name: /Build amazing things faster/i })
    await expect(heroHeading).toBeVisible()

    // Check hero description
    const heroDescription = page.getByText(/This template includes everything you need/i)
    await expect(heroDescription).toBeVisible()

    // Check CTA buttons
    const getStartedButton = page.getByRole('link', { name: /Get Started/i })
    const githubButton = page.getByRole('link', { name: /View on GitHub/i })
    
    await expect(getStartedButton).toBeVisible()
    await expect(githubButton).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    const featuresHeading = page.getByRole('heading', { name: /Everything you need/i })
    await expect(featuresHeading).toBeVisible()

    // Check feature cards
    await expect(page.getByText('Lightning Fast')).toBeVisible()
    await expect(page.getByText('Type Safe')).toBeVisible()
    await expect(page.getByText('Production Ready')).toBeVisible()
  })

  test('should navigate to dashboard when clicking Get Started', async ({ page }) => {
    const getStartedButton = page.getByRole('link', { name: /Get Started/i })
    await getStartedButton.click()
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    const heroHeading = page.getByRole('heading', { name: /Build amazing things faster/i })
    await expect(heroHeading).toBeVisible()
    
    const featuresSection = page.getByText('Everything you need')
    await expect(featuresSection).toBeVisible()
  })

  test('should have accessible navigation', async ({ page }) => {
    // Check that interactive elements are focusable
    const getStartedButton = page.getByRole('link', { name: /Get Started/i })
    await getStartedButton.focus()
    await expect(getStartedButton).toBeFocused()
    
    const githubButton = page.getByRole('link', { name: /View on GitHub/i })
    await githubButton.focus()
    await expect(githubButton).toBeFocused()
  })
})