export type ReservationSlot = {
  time: string;
  content: string;
  month: string;
  date: string;
  day: string;
};

export enum ReservationPeriod {
  ALL = '0',
  LAUNCH = '1',
}
export type Props = {
  reservationPeriod: ReservationPeriod;
  url: string;
};
