import { test, chromium } from '@playwright/test';
import path from 'path';

test.describe('Orvixa Runtime Trace Verification', () => {
  test('should trace context pipeline from host DOM to Gemini request', async () => {
    const extensionPath = path.resolve(process.cwd(), './dist');
    console.log('Loading extension from:', extensionPath);

    // Launch persistent context with extension loaded
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--headless=new`, // Run headless with extension support
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    const page = await context.newPage();

    // Listen to console events (Log everything)
    page.on('console', (msg) => {
      console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`);
    });

    // Mock Google Search response
    await context.route('https://www.google.com/search?q=Agniveer+Practice+Questions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Agniveer Practice Questions - Google Search</title>
          </head>
          <body>
            <h1>Agniveer Practice Questions</h1>
            <div id="content">
              <p>Welcome to the quantitative aptitude practice test for Agniveer GD examination.</p>
              <div>
                <p>Question 1: What is the square root of 625?</p>
                <ul>
                  <li>A) 15</li>
                  <li>B) 25</li>
                  <li>C) 35</li>
                  <li>D) 45</li>
                </ul>
              </div>
              <div>
                <p>Question 2: If a train runs at 60 km/h, how much distance does it cover in 3 hours?</p>
                <ul>
                  <li>A) 120 km</li>
                  <li>B) 150 km</li>
                  <li>C) 180 km</li>
                  <li>D) 200 km</li>
                </ul>
              </div>
              <p>Practice these quantitative aptitude questions to score high in the upcoming Agniveer GD exam.</p>
            </div>
          </body>
          </html>
        `,
      });
    });

    // Mock FastAPI backend AI stream endpoint to avoid connection refused errors
    await context.route('**/stream/intent', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'data: {"event": "token", "token_text": "AI Copilot Response"}\n\ndata: {"event": "final"}\n\n',
      });
    });

    console.log('Navigating to mocked Google Search...');
    await page.goto('https://www.google.com/search?q=Agniveer+Practice+Questions');

    // Wait for extension root to mount
    console.log('Waiting for Orvixa extension root div...');
    const extensionRoot = page.locator('#orvixa-extension-root');
    await extensionRoot.waitFor({ state: 'attached', timeout: 15000 });

    // Wait for the iframe inside shadow host to mount and load
    console.log('Waiting for Orvixa copilot iframe...');
    const iframeLocator = page.locator('iframe#orvixa-copilot-iframe');
    await iframeLocator.waitFor({ state: 'attached', timeout: 15000 });

    // Switch to frame context
    const frame = page.frame({ url: /chrome-extension:\/\/.*index\.html/ });
    if (!frame) {
      throw new Error('Could not resolve extension iframe frame context');
    }

    console.log('Extension iframe resolved. Triggering toggle to open the panel...');
    
    // Evaluate parent window to post the toggle message directly
    await page.evaluate(() => {
      const iframe = document.getElementById('orvixa-copilot-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.style.width = '35%';
        iframe.contentWindow?.postMessage({ source: 'orvixa-content', action: 'toggle' }, '*');
      }
    });

    // Wait for panelState to become READY and render onboarding or learning view
    console.log('Waiting for pane layout to load...');
    
    // Complete onboarding first if displayed
    const startLearningBtn = frame.locator('text=Start Learning');
    await startLearningBtn.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Onboarding view visible. Clicking Start Learning...');
    await startLearningBtn.click();

    // Wait for BottomBar scan button to be visible
    console.log('Waiting for Scan Screen button...');
    const scanBtn = frame.locator('button[title*="Analyze Screen"]');
    await scanBtn.waitFor({ state: 'visible', timeout: 15000 });

    // Click the Scan Screen button
    console.log('Clicking Scan Screen button to trigger executeAction...');
    await scanBtn.click();

    // Wait for explanation streaming or completion (conversation history grows)
    console.log('Waiting for assistant learning message stream to complete...');
    const assistantBubble = frame.locator('text=AI Copilot');
    await assistantBubble.first().waitFor({ state: 'visible', timeout: 30000 });

    // Wait a brief moment to ensure all logs flush
    await page.waitForTimeout(5000);

    console.log('E2E test run finished.');
    await context.close();
  });
});
