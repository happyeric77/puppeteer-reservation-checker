import puppeteer, { Page } from 'puppeteer';
import {
  Availability,
  Props,
  ReservationPeriod,
  WeeklyAvailability,
} from './types';
import {
  notify,
  getMonth,
  getScreenShot,
  getScreenshotDir,
  printLog,
} from './utils';

const main = async (props: Props) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(props.url);
  await page.setViewport({ width: 1080, height: 1524 });
  /** NOTE: debug only: comment out if you want to see browser log */
  // page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  const now = new Date();
  const date = new Date();
  date.setDate(date.getDate() + 1); // Start from tomorrow
  let availability = Availability.Unavailable;
  let weeklyAvailabilities: WeeklyAvailability[] = [];

  await page.waitForNetworkIdle();

  const reservationPeriodButton = await page.locator(
    `label[for="time-${props.reservationPeriod}`,
  );

  await reservationPeriodButton.click();
  await reservationPeriodButton.waitHandle();

  while (availability !== Availability.Unknown) {
    await getScreenShot(page, date, getScreenshotDir(now));
    availability = await getAvailability(page, date);

    weeklyAvailabilities.push({
      week: `${getMonth(date)}-${date.getDate()}`,
      available: availability === Availability.Available,
    });
    date.setDate(date.getDate() + 7);
  }

  if (!!weeklyAvailabilities.find((it) => it.available)) {
    try {
      const msg = `Reservation now available! Go checkout: ${props.url}`;
      const res = await notify(msg);
      printLog(
        `Notification sent: ${res.status} ${res.statusText} : ${msg}`,
        'info',
      );
      // Wait for 30 minutes
      await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));
    } catch (e) {
      printLog(`Error sending notification: ${e}`, 'error');
    }
  } else {
    printLog(`No reservation available`, 'info');
  }

  await browser.close();
};

const getAvailability = async (
  page: Page,
  date: Date,
): Promise<Availability> => {
  await page.waitForFunction(
    ({ date }) => {
      const d = new Date(date);
      return Array.from(document.querySelectorAll('td')).some((td) => {
        return td.innerText.includes(d.getDate().toString());
      });
    },
    {},
    { date },
  );

  const cal = await page.locator('.calender.calender-bottom').waitHandle();
  try {
    await cal.waitForSelector('td');
  } catch (e) {
    console.warn('End of page reached');
    return Availability.Unknown;
  }

  const calTable = await cal.evaluate((el) => el.children[0].innerHTML);

  const buttons = await page.$$('.weeklybutton');
  if (buttons.length > 1) {
    await buttons[1].click();
  }
  await page.waitForNetworkIdle();
  return calTable.includes('○')
    ? Availability.Available
    : calTable.includes('×')
    ? Availability.Unavailable
    : Availability.Unknown;
};

const run = async (thread: () => Promise<void>) => {
  while (true) {
    try {
      await thread();
    } catch (e) {
      printLog(`Unknown Error: ${e}`, 'error');
    }
    console.info('Waiting for 15 minutes...');
    await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
  }
};

run(async () =>
  main({
    reservationPeriod: ReservationPeriod.LAUNCH,
    url: 'https://booking.ebica.jp/webrsv/vacant/e014101001/28098?isfixshop=true',
  }),
);
