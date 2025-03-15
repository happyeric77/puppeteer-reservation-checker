import path from 'path';
import { Page } from 'puppeteer';
import fs from 'fs';

export const getScreenShot = async (
  page: Page,
  date: Date,
  filePath: string,
) => {
  const timestamp = date.toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(filePath, `${timestamp}.png`);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  await page.screenshot({
    path: screenshotPath,
  });

  console.info(`Screenshot saved at: ${screenshotPath}`);
};
