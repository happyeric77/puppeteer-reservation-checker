import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';

const getWeekDay = (date: Date) => {
  const weekDay = date.getDay(); // 0-6 代表 Sun-Sat
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekDays[weekDay];
};

enum ReservationPeriod {
  ALL = '0',
  LAUNCH = '1',
}
type Props = {
  ReservationPeriod: ReservationPeriod;
};
(async ({ ReservationPeriod }: Props) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL.
  await page.goto(
    'https://booking.ebica.jp/webrsv/vacant/e014101001/28098?isfixshop=true',
  );
  await page.setViewport({ width: 1080, height: 1524 });

  await page.locator(`label[for="time-${ReservationPeriod}"]`).click();
  const cal = await page.locator('.calender.calender-bottom').waitHandle();
  await cal.waitForSelector('tr');
  await page.waitForFunction(() => {
    const today = new Date();

    return Array.from(document.querySelectorAll('td')).some((td) =>
      td.innerText.includes(today.getDate().toString()),
    );
  });

  await page.screenshot({ path: './assets/screenshot.png' });
  const calTable = await cal.evaluate((el) => el.children[0].innerHTML);
  console.log({ calTable, yes: calTable.includes('○') });

  const buttons = await page.$$('.weeklybutton');

  if (buttons.length > 1) {
    await buttons[1].click(); // 點擊第二個按鈕（index 1）
    await page.waitForFunction(() => {
      const today = new Date();
      const todayNextWeek = new Date(); // 這邊要保留為 Date 物件
      todayNextWeek.setDate(today.getDate() + 7); // 修改 Date 物件，而不是取代它
      return Array.from(document.querySelectorAll('td')).some((td) =>
        td.innerText.includes(todayNextWeek.getDate().toString()),
      );
    });
    await page.screenshot({ path: `./assets/screenshot1.png` });

    await page.locator(`label[for="time-${ReservationPeriod}`).click();
    const cal = await page.locator('.calender.calender-bottom').waitHandle();
    await cal.waitForSelector('tr');
    const calTable = await cal.evaluate((el) => el.children[0].innerHTML);
    console.log({ calTable, yes: calTable.includes('○') });
  } else {
    throw new Error('No enough elements found');
  }

  await browser.close();
})({ ReservationPeriod: ReservationPeriod.LAUNCH });
