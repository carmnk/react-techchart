import { format, getDate, getHours, getISOWeek, getMinutes, getMonth, getYear } from "date-fns";
import * as T from "../../Types";

const minuteMs = 60000;
const hourMs = minuteMs * 60;
const dayMs = hourMs * 24;
const weekMs = dayMs * 7;
const monthMs = dayMs * 31;
const yearMs = dayMs * 365;

export const chartPeriods: T.ConstPeriods = [
  { name: "minutes", period: minuteMs, scaleMultiplys: [2, 5, 15, 30], range: [minuteMs, 30 * minuteMs] },
  { name: "hours", period: hourMs, scaleMultiplys: [2, 4, 12], range: [hourMs, 12 * hourMs] },
  { name: "days", period: dayMs, scaleMultiplys: [2], range: [dayMs, dayMs] }, // special threatment! --> multiply=2 @range ?
  { name: "weeks", period: weekMs, scaleMultiplys: [2], range: [3 * dayMs, 11 * dayMs] }, // only 1 and 2 wheras 2 means 1/2 month
  { name: "months", period: monthMs, scaleMultiplys: [2, 3, 6], range: [28 * dayMs, 31 * dayMs] }, // months have 28-31 days :/
  { name: "years", period: yearMs, scaleMultiplys: [], range: [365 * dayMs, 366 * dayMs] },
];

export const getDateString = (date: Date, period: T.PeriodName): string => {
  switch (period) {
    case "minutes":
      return format(date, "HH:mm");
    case "hours":
      return format(date, "HH:00");
    case "days":
      return format(date, "dd");
    case "weeks":
      return format(date, "dd");
    case "months":
      return format(date, "MMM");
    case "years":
      return format(date, "yyyy");
    default:
      return "";
  }
}; 

export const getUnitOfDate = (date: Date, period: T.PeriodName): number => {
  switch (period) {
    case "minutes":
      return getMinutes(date); 
    case "hours":
      return getHours(date);
    case "days":
      return getDate(date);
    case "weeks":
      return getISOWeek(date);
    case "months":
      return getMonth(date);
    case "years":
      return getYear(date);
    default:
      return 0; 
  }
};
export const getDateUnits = (date: Date): T.NumericDate => ({
  minute: getUnitOfDate(date, "minutes"),
  hour: getUnitOfDate(date, "hours"),
  day: getUnitOfDate(date, "days"),
  week: getUnitOfDate(date, "weeks"),
  month: getUnitOfDate(date, "months"),
  year: getUnitOfDate(date, "years"),
});
