import puppeteer from 'puppeteer';
import { Props, ReservationPeriod, ReservationState } from './types';
import {
  notify,
  getScreenShot,
  printLog,
  getReservationStates,
  formatDateForDir,
  isEqual,
  removeFs,
} from './utils';
import path from 'path';

const logFilePath = path.join(__dirname, '..', 'assets', 'logs.txt');
const screenshotBaseDir = path.join(__dirname, '..', 'assets', 'screenshots');
let cachedData: ReservationState[] = [];
const main = async (props: Props) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const screenshotPath = path.join(
    screenshotBaseDir,
    formatDateForDir(new Date()),
  );

  await page.goto(props.url);
  await page.setViewport({ width: 1080, height: 1524 });
  /** NOTE: debug only: comment out if you want to see browser log */
  // page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  const now = new Date();
  const date = new Date();
  date.setDate(date.getDate() + 1);
  let availableSlots: ReservationState[] = [];

  await page.waitForNetworkIdle();

  const reservationPeriodButton = await page.locator(
    `label[for="time-${props.reservationPeriod}`,
  );

  await reservationPeriodButton.click();
  await reservationPeriodButton.waitHandle();

  let isCalenderTableExist = true;
  while (isCalenderTableExist) {
    await getScreenShot(page, date, screenshotPath);
    await removeFs(60, screenshotBaseDir);
    const newSlots = await getReservationStates(page, date);
    availableSlots = [...availableSlots, ...newSlots];

    // NEXT WEEK BUTTON - click the button to go to next week
    const buttons = await page.$$('.weeklybutton');
    if (buttons.length > 1) {
      await buttons[1].click();
    }
    date.setDate(date.getDate() + 7);
    await page.waitForNetworkIdle();

    // CHECK EXISTENCE OF CALENDAR TABLE - if not, break the loop
    const calenderTable = await page.waitForSelector(
      '.calender.calender-bottom',
    );
    const calenderTableTds = await calenderTable?.evaluate((el) => {
      const tds = Array.from(el.querySelectorAll('td'));
      return tds.map((td) => td.innerText);
    });
    isCalenderTableExist = calenderTableTds?.length === 0 ? false : true;
  }
  await browser.close();

  // CHECK WETHER EXISTING SLOT SOLD OUT
  if (cachedData.length > 0 && availableSlots.length === 0) {
    const msg = `The ${cachedData
      .map((it) => `${it.month} ${it.date}th (${it.day}) ${it.time}`)
      .join(', ')} are no longer available`;
    notify(msg);
    printLog(`Notification sent: ${msg}`, 'info', logFilePath);
  }

  // CHECK WETHER EXISTING SLOT STILL REMAINS AVAILABLE
  if (availableSlots.length > 0 && isEqual(availableSlots, cachedData)) {
    printLog(`No change in reservation data`, 'info', logFilePath);
    return;
  }

  if (availableSlots.length > 0) {
    try {
      const msg = `Reservation now available on ${availableSlots
        .map((it) => `${it.month} ${it.date}th (${it.day}) ${it.time}`)
        .join(', ')}! \nGo checkout: ${props.url}`;
      const res = await notify(msg);
      printLog(
        `Notification sent: ${res.status} ${res.statusText} : ${msg}`,
        'info',
        logFilePath,
      );
    } catch (e) {
      printLog(`Error sending notification: ${e}`, 'error', logFilePath);
    }
  } else {
    printLog(`No reservation available`, 'info', logFilePath);
  }

  // CACHE DATA: save available slots to cache
  cachedData = availableSlots;
};

const run = async (thread: () => Promise<void>, repeatInMinutes: number) => {
  while (true) {
    try {
      await thread();
    } catch (e) {
      printLog(`Unknown Error: ${e}`, 'error', logFilePath);
    }
    console.info(`Waiting for ${repeatInMinutes} minutes...`);
    await new Promise((resolve) =>
      setTimeout(resolve, repeatInMinutes * 60 * 1000),
    );
  }
};

run(
  async () =>
    await main({
      reservationPeriod: ReservationPeriod.LAUNCH,
      url: 'https://booking.ebica.jp/webrsv/vacant/e014101001/28098?isfixshop=true',
    }),
  2,
);
