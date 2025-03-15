import { Page } from 'puppeteer';
import { ReservationState } from '../types';
import { getMonth } from './date';

export const getReservationStates = async (
  page: Page,
  date: Date,
): Promise<ReservationState[]> => {
  // There are two <tables> in the page, one is with '.calender' selector & another is with '.calender.calender-bottom' selector
  // `.calender` <tables> has only one table row (tr) which contains 1 empty <th> and  7 <td>s. All tds with `.calender.header` selector -> `<td data-v-244797dc="" class="calender header">13<br data-v-244797dc="">木</td>` (13 is the date and 木 is the day of the week)
  //  '.calender.calender-bottom' <tables> has 3 (if launch time) or more <tr>. each <tr> contains one <th> which represents time slot (ex 12:00 or 14:00) and 7 <tds> -> <td `.calender` selector. The state format is like this: `<td data-v-244797dc="" class="calender">○</td>` in which ○ is the available date and × is the unavailable date.
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
          state: td.innerText,
          id: id + 1,
        }));
    });
    return data;
  });

  // CLASSIFY TIME SLOTS BY DATE: gather all info into ReservationState[] array
  const slots = timeSlots.map((slot) =>
    slot
      ?.filter((it) => !!it)
      .map((it) => ({
        time: it.time,
        state: it.state,
        month: getMonth(date),
        date: calenderHeader.find((header) => header.id === it.id)?.date ?? '',
        day: calenderHeader.find((header) => header.id === it.id)?.day ?? '',
      })),
  );
  const flattenSlots: ReservationState[] | undefined = slots.reduce(
    (acc, it) => {
      if (!it) {
        return acc;
      }
      return (acc ?? []).concat(it);
    },
    [],
  );

  const availableSlots = flattenSlots?.filter((it) => it.state === '○');
  await page.waitForNetworkIdle();
  return availableSlots ?? [];
};
