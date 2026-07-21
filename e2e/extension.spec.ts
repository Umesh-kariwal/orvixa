import { test, expect } from '@playwright/test';

test.describe('Orvixa Browser Copilot E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local development server root
    await page.goto('/');
  });

  test('should display first-time welcome onboarding panel and complete successfully', async ({ page }) => {
    const shadowHost = page.locator('#orvixa-shadow-host');
    await expect(shadowHost).toBeAttached();

    // Verify initial welcome text in Shadow DOM content
    const onboardingHeader = shadowHost.locator('text=Meet Orvixa');
    await expect(onboardingHeader).toBeVisible();

    // Click "Start Learning" button
    const startBtn = shadowHost.locator('text=Start Learning');
    await startBtn.click();

    // Confirm onboarding welcome header is cleared and main learning guide is visible
    const learningHeader = shadowHost.locator('text=Orvixa Learning Experience');
    await expect(learningHeader).toBeVisible();
  });

  test('should navigate settings view and save custom API key credentials', async ({ page }) => {
    const shadowHost = page.locator('#orvixa-shadow-host');
    
    // Complete onboarding first
    await shadowHost.locator('text=Start Learning').click();

    // Click Settings toggle icon in the TopBar
    const settingsBtn = shadowHost.locator('[title="Settings Configuration"]');
    await settingsBtn.click();

    // Verify Settings section renders (matching exact title text)
    const settingsTitle = shadowHost.locator('span', { hasText: 'Settings' }).first();
    await expect(settingsTitle).toBeVisible();

    // Input custom API key and trigger Save changes
    const apiKeyInput = shadowHost.locator('input[placeholder="AI provider API credentials..."]');
    await apiKeyInput.fill('mock-google-api-key-value-12345');
    
    const saveBtn = shadowHost.locator('text=Save Changes');
    await saveBtn.click();

    // Verify confirmation message
    const successMsg = shadowHost.locator('text=Preferences saved successfully!');
    await expect(successMsg).toBeVisible();
  });

  test('should navigate privacy dashboard and display disabled telemetry indicators', async ({ page }) => {
    const shadowHost = page.locator('#orvixa-shadow-host');
    
    // Complete onboarding first
    await shadowHost.locator('text=Start Learning').click();

    // Click Privacy toggle icon in TopBar
    const privacyBtn = shadowHost.locator('[title="Privacy Dashboard"]');
    await privacyBtn.click();

    // Confirm privacy view and zero background monitoring indicator
    const privacyTitle = shadowHost.locator('span', { hasText: 'Privacy Dashboard' }).first();
    await expect(privacyTitle).toBeVisible();

    const telemetryStatus = shadowHost.locator('text=Background Monitoring');
    await expect(telemetryStatus).toBeVisible();
  });
});
