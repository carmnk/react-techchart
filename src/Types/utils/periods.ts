export type PeriodUnit = "minute" | "hour" | "day" | "week" | "month" | "year";
export type PeriodName = "minutes" | "hours" | "days" | "weeks" | "months" | "years";

/** Type of Periods const */
type ConstPeriod<T = PeriodName> = {
  name: T;
  period: number;
  scaleMultiplys: number[];
  range: number[];
};

export type ConstPeriods = [
  ConstPeriod<"minutes">,
  ConstPeriod<"hours">,
  ConstPeriod<"days">,
  ConstPeriod<"weeks">,
  ConstPeriod<"months">,
  ConstPeriod<"years">
];

/** Chart Period Type */
export type ChartPeriod<T = PeriodName> = {
  name: T;
  period: number;
  multiply: number;
};

export type NumericDate = {
  minute: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
};
