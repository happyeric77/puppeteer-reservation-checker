export type ReservationState = {
  time: string;
  state: string; // '○' | '×' | '-'
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
