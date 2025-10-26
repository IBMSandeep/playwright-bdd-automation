import { Given, When, Then, BeforeAll, AfterAll, Before, After, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { initBrowser, closeBrowser, getPage } from '../../utils/playwright';
import { ENV } from '../../utils/env';
import * as fs from 'fs';
import * as path from 'path';
import { PassThrough } from 'stream';

let loginPage: LoginPage;
let inventoryPage: InventoryPage;

// Step definitions
Given('Initiate required instances to execute the test', async function() {
  const page = await initBrowser();
  loginPage = new LoginPage(page);
  inventoryPage = new InventoryPage(page);
});

Given('I am on the login page', async function() {
  await loginPage.navigateToLoginPage();
  
  // Take screenshot and attach to report
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
});

Then('the page title should be {string}', async function(expectedTitle: string) {
  const actualTitle = await loginPage.getPageTitle();
  expect(actualTitle).toBe(expectedTitle);
});

Then('the login logo should be displayed', async function() {
  const isLogoDisplayed = await loginPage.isLogoDisplayed();
  expect(isLogoDisplayed).toBe(true);
  
  // Take screenshot of the logo
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
});

When('I login with valid credentials', async function() {
  await loginPage.login(ENV.STANDARD_USER, ENV.PASSWORD);
  
  // Take screenshot after login
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
});

When('I login with username {string} and password {string}', async function(username: string, password: string) {
  await loginPage.login(username, password);
  
  // Take screenshot after login attempt
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
});

Then('I should be redirected to the inventory page', async function() {
  const isOnInventoryPage = await inventoryPage.isOnInventoryPage();
  expect(isOnInventoryPage).toBe(true);
  
  // Take screenshot of inventory page
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
});

Then('I should see an error message {string}', async function(expectedErrorMessage: string) {
  const isErrorDisplayed = await loginPage.isErrorMessageDisplayed();
  expect(isErrorDisplayed).toBe(true);
  
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage).toBe(expectedErrorMessage);
  
  // Take screenshot showing error message
  const screenshot = await getPage().screenshot();
  this.attach(screenshot, 'image/png');
}); 