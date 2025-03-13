import puppeteer, { Page } from 'puppeteer';
import { Props, ReservationPeriod, ReservationSlot } from './types';
import {
  notify,
  getMonth,
  getScreenShot,
  getScreenshotDir,
  printLog,
  removeOldScreenshots,
} from './utils';

const main = async (props: Props) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(props.url);
  await page.setViewport({ width: 1080, height: 1524 });
  /** NOTE: debug only: comment out if you want to see browser log */
  // page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
  const now = new Date();
  const date = new Date();
  date.setDate(date.getDate() + 1);
  let availableSlots: ReservationSlot[] = [];

  await page.waitForNetworkIdle();

  const reservationPeriodButton = await page.locator(
    `label[for="time-${props.reservationPeriod}`,
  );

  await reservationPeriodButton.click();
  await reservationPeriodButton.waitHandle();

  let isCalenderTableExist = true;
  while (isCalenderTableExist) {
    await getScreenShot(page, date, getScreenshotDir(now));
    await removeOldScreenshots(60);
    const newSlots = await getAvailability(page, date);
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

  if (availableSlots.length > 0) {
    try {
      const msg = `Reservation now available on ${availableSlots
        .map((it) => `${it.month} ${it.date}th (${it.day}) ${it.time}`)
        .join(', ')}! \nGo checkout: ${props.url}`;
      const res = await notify(msg);
      printLog(
        `Notification sent: ${res.status} ${res.statusText} : ${msg}`,
        'info',
      );
      // Wait for 30 minutes
      console.info(`Waiting for 30 minutes...`);
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
): Promise<ReservationSlot[]> => {
  // There are two <tables> in the page, one is with '.calender' selector & another is with '.calender.calender-bottom' selector
  // `.calender` <tables> has only one table row (tr) which contains 1 empty <th> and  7 <td>s. All tds with `.calender.header` selector -> `<td data-v-244797dc="" class="calender header">13<br data-v-244797dc="">木</td>` (13 is the date and 木 is the day of the week)
  //  '.calender.calender-bottom' <tables> has 3 (if launch time) or more <tr>. each <tr> contains one <th> which represents time slot (ex 12:00 or 14:00) and 7 <tds> -> <td `.calender` selector. The content format is like this: `<td data-v-244797dc="" class="calender">○</td>` in which ○ is the available date and × is the unavailable date.
  // We want to get the availability of the date and time in the second table and call notify function if any become available ( ○ ).

  // HEADER TABLE: get weekday info
  const calenderHeaderTable = await page.waitForSelector('table.calender');
  if (!calenderHeaderTable) {
    return [];
  }
  const calenderHeader = await calenderHeaderTable.evaluate((el) => {
    const tds = Array.from(el.querySelectorAll('td'));
    return tds
      .map((td, id) => {
        const date = td.innerText.split('\n')[0];
        const day = td.innerText.split('\n')[1];
        return { id: id + 1, date, day };
      })
      .filter((it) => !!it.date);
  });

  // CALENDER TABLE: get time slot & availability info
  const calenderTable = await page.waitForSelector('.calender.calender-bottom');

  if (!calenderTable) {
    return [];
  }
  const timeSlots = await calenderTable.evaluate((el) => {
    const trs = Array.from(el.querySelectorAll('tr'));
    const data = trs.map((tr) => {
      const time = tr.querySelector('th')?.innerText;
      if (!time) {
        return null;
      }
      const tds = Array.from(tr.querySelectorAll('td'));
      return tds
        .filter((td) => !!td.innerText)
        .map((td, id) => ({
          time,
          content: td.innerText,
          id: id + 1,
        }));
    });
    return data;
  });

  // CLASSIFY TIME SLOTS BY DATE: gather all info into ReservationSlot[] array
  const slots = timeSlots.map((slot) =>
    slot
      ?.filter((it) => !!it)
      .map((it) => ({
        time: it.time,
        content: it.content,
        month: getMonth(date),
        date: calenderHeader.find((header) => header.id === it.id)?.date ?? '',
        day: calenderHeader.find((header) => header.id === it.id)?.day ?? '',
      })),
  );
  const flattenSlots: ReservationSlot[] | undefined = slots.reduce(
    (acc, it) => {
      if (!it) {
        return acc;
      }
      return (acc ?? []).concat(it);
    },
    [],
  );

  const availableSlots = flattenSlots?.filter((it) => it.content === '○');
  await page.waitForNetworkIdle();
  return availableSlots ?? [];
};

const run = async (thread: () => Promise<void>, repeatInMinutes: number) => {
  while (true) {
    try {
      await thread();
    } catch (e) {
      printLog(`Unknown Error: ${e}`, 'error');
    }
    console.info(`Waiting for ${repeatInMinutes} minutes...`);
    await new Promise((resolve) =>
      setTimeout(resolve, repeatInMinutes * 60 * 1000),
    );
  }
};

run(
  async () =>
    main({
      reservationPeriod: ReservationPeriod.LAUNCH,
      url: 'https://booking.ebica.jp/webrsv/vacant/e014101001/28098?isfixshop=true',
    }),
  2,
);
