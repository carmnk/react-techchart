import { chartPeriods, getDateUnits } from "../utils/DateTime";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";

type DateStatIdxs = {
  yearIdx: number;
  monthIdx: number;
  weekIdx: number;
  dayIdx: number;
  hourIdx: number | undefined;
  minuteIdx: number | undefined;
};

export const getTickPeriod = (
  date: Date,
  dateStat: T.ChartData["dateStat"],
  chartPeriod: T.ChartPeriod,
  optPeriod: T.ChartPeriod
): T.PeriodName | null => {
  if (!chartPeriod || !optPeriod || !dateStat) return null;

  const { name: optPeriodName, multiply: optMultiply } = optPeriod;
  const numericDate = getDateUnits(date);
  const { minute, hour, day, week, month, year } = numericDate;
  const yearIdx = dateStat.years.findIndex((val) => val.year === year);
  const monthIdx = dateStat.years?.[yearIdx]?.months?.findIndex((val) => val.month === month);
  const weekIdx = dateStat.years?.[yearIdx]?.months?.[monthIdx]?.weeks?.findIndex((val) => val.week === week);
  const dayIdx = dateStat.years?.[yearIdx]?.months?.[monthIdx]?.weeks?.[weekIdx]?.days?.findIndex((v) => v.day === day);
  const dayStat = dateStat.years?.[yearIdx]?.months?.[monthIdx]?.weeks?.[weekIdx]?.days?.[dayIdx];
  if (yearIdx === -1 || monthIdx === -1 || weekIdx === -1 || dayIdx === -1 || !dayStat) return null;

  const isIntradayData = chartPeriod.period < chartPeriods?.[2]?.range?.[0];
  const isIntraHourData = chartPeriod.period < chartPeriods?.[1]?.range?.[0];
  const hourIdx = isIntradayData ? dayStat?.hours.findIndex((val) => val.hour === hour) : undefined;
  const minuteIdx =
    isIntradayData &&
    !isNullish(hourIdx) &&
    dayStat?.hours?.[hourIdx]?.minutes.findIndex((val) => val.minute === minute) !== -1
      ? dayStat?.hours?.[hourIdx]?.minutes.findIndex((val) => val.minute === minute)
      : undefined;
  if ((isIntradayData && isNullish(hourIdx)) || (isIntraHourData && isNullish(minuteIdx))) return null;
  // chartperiod (period of chartdata) is optimal period @multiply=1 -> every tick is a new period on xaxis
  if (chartPeriod.name === optPeriodName && optMultiply === 1) return optPeriodName;

  const statIdxs: DateStatIdxs = { yearIdx, monthIdx, weekIdx, dayIdx, hourIdx, minuteIdx };
  const isNewIntraday = !hourIdx && !minuteIdx; // hourIdx, minuteIdx === 0 or undefined
  const monthMultiplys = optPeriodName === "months" ? (optMultiply as 1 | 2 | 3 | 6) : 1;
  const weekMultiplys = optPeriodName === "weeks" ? (optMultiply as 1 | 2) : 1;
  const dayMultiplys = optPeriodName === "days" ? optMultiply : 1;
  const hourMultiplys = optPeriodName === "hours" ? optMultiply : 1;

  return isNewYear(numericDate, dateStat, statIdxs) && !hourIdx && !minuteIdx
    ? "years"
    : optPeriodName !== "years" && isNewMonth(numericDate, dateStat, statIdxs, monthMultiplys) && isNewIntraday
    ? "months"
    : !["years", "months"].includes(optPeriodName) &&
      isNewIsoWeek(numericDate, dateStat, statIdxs, weekMultiplys) &&
      isNewIntraday
    ? "weeks"
    : !["years", "months", "weeks"].includes(optPeriodName) &&
      isNewDay(numericDate, dateStat, statIdxs, dayMultiplys as 1 | 2) &&
      isNewIntraday
    ? "days"
    : !["years", "months", "weeks", "days"].includes(optPeriodName) &&
      isNewHour(numericDate, dateStat, statIdxs, hourMultiplys as 1 | 2 | 4 | 12) &&
      !minuteIdx
    ? "hours"
    : optPeriodName === "minutes" && isNewMinute(numericDate, dateStat, statIdxs, optMultiply as 1 | 2 | 4 | 12)
    ? "minutes"
    : null;
};

const isNewYear = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs
  //periodMultiply: 1 = 1
) => {
  const { day, week, month } = numericDate;
  const { yearIdx } = statIdxs;
  if (!dateStat) return false;
  const firstMonthStat = dateStat.years?.[yearIdx]?.months?.[0];
  if (
    firstMonthStat.weeks[0].days[0].day === day &&
    firstMonthStat.weeks[0].week === week &&
    firstMonthStat.month === month
  )
    return true;
  return false;
};

const isNewMonth = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs,
  periodMultiply: 1 | 2 | 3 | 6 = 1
) => {
  const { day, week } = numericDate;
  const { yearIdx, monthIdx } = statIdxs;

  if ((monthIdx + 1) % periodMultiply !== 0 || yearIdx === -1 || monthIdx === -1 || !dateStat) return false;
  if (
    dateStat.years[yearIdx].months[monthIdx].weeks[0].days[0].day === day &&
    dateStat.years[yearIdx].months[monthIdx].weeks[0].week === week
  )
    return true;
  return false;
};

const isNewIsoWeek = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs,
  periodMultiply: 1 | 2 = 1
) => {
  const { day, week } = numericDate;
  const { yearIdx, monthIdx, weekIdx } = statIdxs;
  if (!dateStat) return false;
  if (
    dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days[0].day === day &&
    dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].week === week
  ) {
    if (periodMultiply === 2) {
      let daysInMonth = 0;
      dateStat.years[yearIdx].months[monthIdx].weeks.forEach((val) => (daysInMonth += val.days.length));
      let curDays = 0;
      let opt = 0;
      let optWeekIdx = 0;
      const optimalDaysTarget = Math.round(daysInMonth / 2);
      for (let i = 0; i < dateStat.years[yearIdx].months[monthIdx].weeks.length; i++) {
        const weekInMonth = dateStat.years[yearIdx].months[monthIdx].weeks[i];
        if (Math.abs(curDays + weekInMonth.days.length - optimalDaysTarget) < Math.abs(opt - optimalDaysTarget)) {
          opt = curDays + weekInMonth.days.length;
          optWeekIdx = i + 1;
        }
        curDays += weekInMonth.days.length;
      }
      if (weekIdx === optWeekIdx) return true;
      return false;
    } else if (periodMultiply === 1) {
      if (weekIdx === 1 && dateStat.years[yearIdx].months[monthIdx].weeks[0].days.length < 3) return false;
      if (
        weekIdx === dateStat.years[yearIdx].months[monthIdx].weeks.length - 1 &&
        dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length < 3
      )
        return false;
      return true;
    }
  }
  return false;
};

const isNewDay = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs,
  periodMultiply: 1 | 2 = 1
) => {
  const { day } = numericDate;
  const { yearIdx, monthIdx, weekIdx, dayIdx } = statIdxs;
  if (!dateStat) return false;
  const dayStat = dateStat.years?.[yearIdx]?.months?.[monthIdx]?.weeks?.[weekIdx]?.days?.[dayIdx];
  if (dayIdx === -1 || weekIdx === -1 || monthIdx === -1 || yearIdx === -1 || !dayStat) return false;
  // const { multiply: optPeriodMultiply, name: optPeriodName } = optPeriod;

  if (dayStat.day === day && periodMultiply === 1) {
    return true;
  }
  if (dayStat.day === day && periodMultiply === 2) {
    if (dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length <= 3) return false; // weeks with up to 3 days are not diveded
    if (
      (dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length === 4 && (dayIdx === 0 || dayIdx === 2)) ||
      (dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length === 5 && (dayIdx === 0 || dayIdx === 2)) ||
      (dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length === 6 &&
        (dayIdx === 0 || dayIdx === 2 || dayIdx === 4)) ||
      (dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days.length === 7 &&
        (dayIdx === 0 || dayIdx === 2 || dayIdx === 5))
    )
      return true;
  }
  return false;
};

const isNewHour = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs,
  periodMultiply: 1 | 2 | 4 | 12 = 1
) => {
  const { hour } = numericDate;
  const { yearIdx, monthIdx, weekIdx, dayIdx, hourIdx } = statIdxs;
  if (!dateStat) return false;
  const dayStat = dateStat.years?.[yearIdx]?.months?.[monthIdx]?.weeks?.[weekIdx]?.days?.[dayIdx];
  const hourStat = isNullish(hourIdx) ? null : dayStat?.hours?.[hourIdx];
  if (
    dayIdx === -1 ||
    weekIdx === -1 ||
    monthIdx === -1 ||
    yearIdx === -1 ||
    hourIdx === -1 ||
    !hourStat ||
    isNullish(hourIdx)
  )
    return false;

  if (hourIdx % periodMultiply !== 0) return false;
  if (hourStat.hour === hour) return true; //
  return false;
};

const isNewMinute = (
  numericDate: T.NumericDate,
  dateStat: T.ChartData["dateStat"],
  statIdxs: DateStatIdxs,
  periodMultiply: 1 | 2 | 4 | 12 = 1
) => {
  const { minute } = numericDate;
  const { yearIdx, monthIdx, weekIdx, dayIdx, hourIdx, minuteIdx } = statIdxs;
  if (!dateStat) return false;
  const dayStat = dateStat.years[yearIdx].months[monthIdx].weeks[weekIdx].days[dayIdx];
  if (yearIdx === -1 || monthIdx === -1 || weekIdx === -1 || dayIdx === -1) return false;
  if (isNullish(hourIdx) || hourIdx === -1 || isNullish(minuteIdx) || minuteIdx === -1) return false;
  const minuteStat = dayStat.hours[hourIdx].minutes[minuteIdx];
  if (minuteIdx % periodMultiply !== 0) return false;
  if (minuteStat.minute === minute) return true;
  return false;
};
