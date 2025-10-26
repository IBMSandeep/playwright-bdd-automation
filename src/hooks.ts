import { Given, When, Then, BeforeAll, AfterAll, Before, After, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { initBrowser, closeBrowser, getPage } from './utils/playwright';
import { ENV } from './utils/env';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;

// Set default timeout to 10 seconds
setDefaultTimeout(10000);

// Hooks
BeforeAll({ timeout: 10000 }, async () => {
  // Create test-results/screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create test-results/videos directory if it doesn't exist
  const videosDir = path.join(process.cwd(), 'test-results', 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
});

AfterAll({ timeout: 60000 }, async () => {
  await closeBrowser();
});

Before({ timeout: 60000 }, async function () {
  console.log("Before All in The Hooks");
});

// Take a screenshot if a scenario fails
After({ timeout: 10000 }, async function (testCase: ITestCaseHookParameter) {
  const page = getPage();
  
  if (testCase?.result?.status === 'FAILED') {
    // Take screenshot for failed tests
    const screenshot = await page.screenshot({ 
      path: `test-results/screenshots/failure-${Date.now()}.png`,
      fullPage: true
    });
    this.attach(screenshot, 'image/png');
  } else {
    // Take screenshot for passed tests too
    const screenshot = await page.screenshot({ 
      path: `test-results/screenshots/success-${Date.now()}.png`,
      fullPage: true
    });
    this.attach(screenshot, 'image/png');
  }
});