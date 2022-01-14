import { IndicatorModel } from "../IndicatorModel";
import { ChartPeriod, NumericDate } from "../utils/periods";
import { ChartDataSeries, IndicatorDataSeries } from "../utils/dataseries";

// ChartState Data Model (ChartState.data)
export type Data = ChartData | IndicatorData;

export type ChartData = {
  id: string;
  name: string;
  type: "chart";
  data: ChartDataSeries;
  decimals: number;
  dateStat: ChartDateStat | null;
  meta: {
    chartPeriod: ChartPeriod | null;
    dataPeriod: number;
    dataPeriodConfidence: number;
    type: "candlechart" | "linechart";
  };
};

export type IndicatorData = {
  id: string;
  name: string;
  fullName: string;
  type: "indicator";
  data: IndicatorDataSeries;
  decimals: number;
  indicator: IndicatorModel;
  indSrcId: string;
};

export type ChartDateStat = {
  years: {
    year: number;
    months: {
      month: number;
      weeks: { week: number; days: { day: number; hours: { hour: number; minutes: { minute: number }[] }[] }[] }[];
    }[];
  }[];
  accAmt: {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    lastData: Partial<NumericDate> | null;
  };
};

export type MinuteStat = { minute: number }[];
export type HourStat = { hour: number; minutes: MinuteStat }[];
export type DayStat = { day: number; hours: HourStat }[];
export type WeekStat = { week: number; days: DayStat }[];
export type MonthStat = { month: number; weeks: WeekStat }[];
export type YearStat = { year: number; months: MonthStat }[];
export type PeriodStat = YearStat | MonthStat | WeekStat | DayStat | HourStat | MinuteStat;
