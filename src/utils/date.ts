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

export const formatDateForDir = (date: Date) =>
  `${date.getFullYear()}-${getMonth(
    date,
  )}${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
