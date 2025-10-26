import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env file found. Please create one at the root level.');
}

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://www.saucedemo.com',
  STANDARD_USER: process.env.STANDARD_USER || 'standard_user',
  LOCKED_OUT_USER: process.env.LOCKED_OUT_USER || 'locked_out_user',
  PASSWORD: process.env.PASSWORD || 'secret_sauce',
  HEADLESS: process.env.HEADLESS === 'true',
  BROWSER: (process.env.BROWSER || 'chromium') as 'chromium' | 'firefox' | 'webkit',
  SLOW_MO: parseInt(process.env.SLOW_MO || '0'),
  TIMEOUT: parseInt(process.env.TIMEOUT || '30000'),
}; 