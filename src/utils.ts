import { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

export const getMonth = (date: Date) => {
  const month = date.getMonth();
  const monthDays = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return monthDays[month];
};

export const getScreenShot = async (
  page: Page,
  date: Date,
  folderName: string,
) => {
  const now = new Date();
  const screenshotDir = path.join(
    __dirname,
    '..',
    'assets',
    'screenshots',
    folderName,
  );

  const timestamp = date.toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(screenshotDir, `${timestamp}.png`);

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  await page.screenshot({
    path: screenshotPath,
  });

  console.info(`Screenshot saved at: ${screenshotPath}`);
};

export const getScreenshotDir = (date: Date) =>
  `${date.getFullYear()}-${getMonth(
    date,
  )}${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;

export const notify = async (text: string): Promise<Response> => {
  const url = 'https://api.line.me/v2/bot/message/push';
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const targetId = process.env.LINE_USER_OR_GROUP_ID;
  const payload = {
    to: targetId,
    messages: [
      {
        type: 'text',
        text,
      },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelSecret}`,
    },
    body: JSON.stringify(payload),
  });

  return res;
};

export const printLog = (msg: string, type: 'error' | 'info'): void => {
  const message = `[${new Date().toLocaleString()}] ${msg}`;
  const logFilePath = path.join(__dirname, '..', 'assets', 'logs.txt');
  fs.appendFileSync(logFilePath, message + '\n', 'utf8');
  switch (type) {
    case 'error':
      console.error(message);
      break;
    case 'info':
      console.info(message);
      break;
    default:
      console.log(message);
      break;
  }
};

export const removeOldScreenshots = (remainingFolders: number = 5) => {
  // Only keep the most recent 5 folders
  const screenshotDir = path.join(__dirname, '..', 'assets', 'screenshots');
  const folders = fs
    .readdirSync(screenshotDir)
    .filter((file) => fs.statSync(path.join(screenshotDir, file)).isDirectory())
    .sort((a, b) => {
      const aTime = fs.statSync(path.join(screenshotDir, a)).mtime;
      const bTime = fs.statSync(path.join(screenshotDir, b)).mtime;
      return bTime.getTime() - aTime.getTime();
    })
    .slice(remainingFolders);
  // Remove the old folders
  folders.forEach((folder) => {
    const folderPath = path.join(screenshotDir, folder);
    fs.rmSync(folderPath, { recursive: true, force: true });
    console.info(`Removed old folder: ${folderPath}`);
  });
};
