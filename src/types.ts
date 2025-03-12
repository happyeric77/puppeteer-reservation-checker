export enum Availability {
  Available = 'available',
  Unavailable = 'unavailable',
  Unknown = 'unknown',
}

export type WeeklyAvailability = {
  week: string;
  available: boolean;
};

export enum ReservationPeriod {
  ALL = '0',
  LAUNCH = '1',
}
export type Props = {
  reservationPeriod: ReservationPeriod;
  url: string;
};
