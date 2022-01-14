import countBy from "lodash/countBy";
import uniqBy from "lodash/uniqBy";
import { chartPeriods, getUnitOfDate } from "../utils/DateTime";
import { getMaxDataSeriesDecimals } from "../utils/Utils";
import { isNullish } from "../../utils/Basics";
import { setStateProp } from "../../utils/React";
import { getIndicatorsDependantIndicatorDatas, recalcIndicatorData } from "./IndicatorDataFactory";
import * as T from "../../Types";

export const createChartData = (chartData: T.ChartDataset[], chartName: string, id: string): T.ChartData | null => {
  const { decimals, isDescending, ...meta } = getGraphMetaData(chartData);
  if (isDescending) chartData.reverse();
  const dateStat = isNullish(meta?.chartPeriod) ? null : getDateStat(chartData, meta?.chartPeriod);
  if (isNullish(dateStat)) return null;
  return {
    id,
    data: chartData,
    meta,
    dateStat,
    type: "chart" as const,
    name: chartName,
    decimals,
  };
};

export const updateChartData = (chartData: T.ChartData, newDataSeries: T.ChartDataset[]): T.ChartData | null => {
  const chartPeriod = chartData.meta.chartPeriod;
  if (!chartPeriod) return chartData;
  return {
    ...chartData,
    data: [...chartData.data, ...newDataSeries],
    dateStat: getDateStat(newDataSeries, chartPeriod, chartData.dateStat),
  };
};

export const updateChartDataAndDeps = (
  current: T.ChartState,
  dataId: string,
  newDatasets: T.ChartDataset[]
): T.ChartState => {
  const data = current.data;
  const datIdx = data.findIndex((dat) => dat.id === dataId);
  const dataGraph = data?.[datIdx];
  if (dataGraph?.type !== "chart" || !newDatasets || newDatasets.length === 0) return current;
  const updatedGraph = updateChartData(dataGraph, newDatasets);
  const depIndicators = getIndicatorsDependantIndicatorDatas(data, dataId);
  const dataCopy = [...(setStateProp(current.data, [datIdx], updatedGraph) as T.ChartState["data"])];
  depIndicators.forEach((id) => {
    const dataIdx = dataCopy.findIndex((dat) => dat.id === id);
    const indicatorData = dataCopy?.[dataIdx];
    if (indicatorData?.type !== "indicator") return;
    const updatedIndData = recalcIndicatorData(dataCopy, id, undefined, indicatorData.data);
    if (updatedIndData) dataCopy[dataIdx] = updatedIndData;
  });
  return { ...current, data: dataCopy };
};

const getChartPeriod = (dataPeriod: number): T.ChartPeriod | null => {
  const matchConstPeriod = chartPeriods.find(
    (constPeriod) =>
      dataPeriod === constPeriod.period || (dataPeriod >= constPeriod.range[0] && dataPeriod <= constPeriod.range[1])
  );
  if (!matchConstPeriod) return null;
  const { scaleMultiplys, range, ...rawChartPeriod } = matchConstPeriod;
  const multiply = Math.round(dataPeriod / matchConstPeriod.period);
  const chartPeriod = { ...rawChartPeriod, multiply };
  return chartPeriod;
};

const guessChartDataSeriesPeriod = (dataSeries: T.ChartDataSeries) => {
  const getDeltaT = (dataPoint1: T.ChartDataset, dataPoint0: T.ChartDataset) =>
    !dataPoint1?.date || !dataPoint0?.date ? 0 : dataPoint1.date.valueOf() - dataPoint0.date.valueOf();
  const deltaPeriods = dataSeries.slice(1).map((dataset, dIdx) => getDeltaT(dataSeries[dIdx + 1], dataSeries[dIdx]));
  const deltaPeriodOcc = countBy(deltaPeriods);
  const deltaPeriodsStat = Object.entries(deltaPeriodOcc).map(([key, val]) => ({ dT: parseInt(key, 10), amt: val }));
  const deltaPeriodAmts = deltaPeriodsStat.map((period) => period.amt);
  const periodMaxOccured = deltaPeriodAmts.indexOf(Math.max(...deltaPeriodAmts));
  const dataPeriod = Math.abs(deltaPeriodsStat[periodMaxOccured].dT);
  const dataPeriodConfidence = deltaPeriodsStat[periodMaxOccured].amt / dataSeries.length;
  const chartPeriod = getChartPeriod(dataPeriod);
  const isDescending = deltaPeriodsStat[periodMaxOccured].dT < 0;
  return { dataPeriod, dataPeriodConfidence, chartPeriod, isDescending };
};

const getGraphMetaData = (
  dataSeries: T.ChartDataset[]
): T.ChartData["meta"] & { decimals: number; isDescending: boolean } => {
  const { dataPeriod, dataPeriodConfidence, chartPeriod, isDescending } = guessChartDataSeriesPeriod(dataSeries);
  const decimals = getMaxDataSeriesDecimals(dataSeries);
  return {
    dataPeriod: dataPeriod,
    chartPeriod: chartPeriod,
    dataPeriodConfidence,
    type: "candlechart", // currently only candlechart data OHLC
    decimals,
    isDescending,
  };
};

export const getDateStat = (
  data: T.DataSeries,
  chartPeriod: T.ChartPeriod,
  prevDateStat?: T.ChartData["dateStat"]
): T.ChartData["dateStat"] => {
  const periodNames = chartPeriods.map((chartPeriod) => chartPeriod.name);
  const periodNamesToCheck = periodNames.slice(periodNames.findIndex((period) => period === chartPeriod.name));
  const periodsToCheck = periodNamesToCheck.map((period) => period.slice(0, period.length - 1) as keyof T.NumericDate);
  // relevant periods resp. date units for each dataset
  const dataPeriods = data.map((dataset) => {
    const onePeriodStat: { [index in keyof T.NumericDate]?: number } = {};
    periodsToCheck.forEach((period, pIdx) => {
      onePeriodStat[period] = getUnitOfDate(dataset.date, periodNamesToCheck[pIdx]);
    });
    return onePeriodStat;
  });
  // filter dataPeriods (see context above) by higher periods (resp. date units) to avoid duplicates (e.g. jan-01 might occure multiple times)
  const filterDataPeriods = (filterDate: Partial<T.NumericDate> | null, periodName: T.PeriodName) => {
    return isNullish(filterDate) || periodName === "years"
      ? dataPeriods
      : dataPeriods.filter(
          (datPeriods) =>
            datPeriods.year === filterDate?.year &&
            (datPeriods.month === filterDate?.month || ["months"].includes(periodName)) &&
            (datPeriods.week === filterDate?.week || ["months", "weeks"].includes(periodName)) &&
            (datPeriods.day === filterDate?.day || ["months", "weeks", "days"].includes(periodName)) &&
            (datPeriods.hour === filterDate?.hour || periodName !== "minutes")
        );
  };
  // get tree-structure of ChartDates acc. to DateStat
  const getDateTree = (periodName: T.PeriodName, recursionDate?: Partial<T.NumericDate>): any => {
    const date = recursionDate ? recursionDate : null;
    const filteredPeriods = filterDataPeriods(date, periodName);
    return periodName === "minutes"
      ? {
          minutes: uniqBy(filteredPeriods, (val) => `${val.minute}`).map((periods) => ({
            minute: periods.minute,
          })),
        }
      : periodName === "hours"
      ? {
          hours: uniqBy(filteredPeriods, (val) => `${val.hour}`).map((periods) => ({
            hour: periods.hour,
            minutes: "minute" in periods ? getDateTree("minutes", periods).minutes : [],
          })),
        }
      : periodName === "days"
      ? {
          days: uniqBy(filteredPeriods, (val) => `${(val.year, val.month, val.week, val.day)}`).map((periods) => ({
            day: periods.day,
            hours: "hour" in periods ? getDateTree("hours", periods).hours : [],
          })),
        }
      : periodName === "weeks"
      ? {
          weeks: uniqBy(filteredPeriods, (val) => `${(val.year, val.month, val.week)}`).map((periods) => ({
            week: periods.week,
            days: "day" in periods ? getDateTree("days", periods).days : [],
          })),
        }
      : periodName === "months"
      ? {
          months: uniqBy(filteredPeriods, (val) => `${(val.year, val.month)}`).map((periods) => ({
            month: periods.month,
            weeks: "week" in periods ? getDateTree("weeks", periods).weeks : [],
          })),
        }
      : periodName === "years"
      ? {
          years: uniqBy(dataPeriods, "year").map((periods) => ({
            year: periods.year,
            months: "month" in periods ? getDateTree("months", periods).months : [],
          })),
        }
      : null;
  };

  const dateStat = dataPeriods.reduce<T.ChartDateStat["accAmt"] & { lastData: Partial<T.NumericDate> | null }>(
    (acc, cur) => ({
      years: !acc.lastData ? 1 : acc.lastData.year !== cur.year ? acc.years + 1 : acc.years,
      months: !acc.lastData ? ("month" in cur ? 1 : 0) : acc.lastData.month !== cur.month ? acc.months + 1 : acc.months,
      weeks: !acc.lastData ? ("week" in cur ? 1 : 0) : acc.lastData.week !== cur.week ? acc.weeks + 1 : acc.weeks,
      days: !acc.lastData ? ("day" in cur ? 1 : 0) : acc.lastData.day !== cur.day ? acc.days + 1 : acc.days,
      hours: !acc.lastData ? ("hour" in cur ? 1 : 0) : acc.lastData.hour !== cur.hour ? acc.hours + 1 : acc.hours,
      minutes: !acc.lastData
        ? "minute" in cur
          ? 1
          : 0
        : acc.lastData.minute !== cur.minute
        ? acc.minutes + 1
        : acc.minutes,
      lastData: cur,
    }),
    prevDateStat
      ? prevDateStat.accAmt
      : {
          years: 0,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          lastData: null,
        }
  );
  const { ...accAmt } = dateStat;
  const dateTree = getDateTree("years")?.years as T.ChartDateStat["years"];

  function mergeDeep(prev: T.PeriodStat, newStat: T.PeriodStat): T.PeriodStat {
    const lastPrev = prev?.[prev.length - 1] ?? null;
    const firstNew = newStat?.[0] ?? null;
    if (!lastPrev || !firstNew) return [...prev, ...newStat] as T.PeriodStat;
    const linkProp =
      "year" in lastPrev
        ? "year"
        : "month" in lastPrev
        ? "month"
        : "week" in lastPrev
        ? "week"
        : "day" in lastPrev
        ? "day"
        : "hour" in lastPrev
        ? "hour"
        : "minute" in lastPrev
        ? "minute"
        : null;
    const subProp =
      "year" in lastPrev && "months" in lastPrev && "months" in firstNew
        ? { year: lastPrev.year, months: mergeDeep(lastPrev.months, firstNew.months) }
        : "month" in lastPrev && "weeks" in lastPrev && "weeks" in firstNew
        ? { month: lastPrev.month, weeks: mergeDeep(lastPrev.weeks, firstNew.weeks) }
        : "week" in lastPrev && "days" in lastPrev && "days" in firstNew
        ? { week: lastPrev.week, days: mergeDeep(lastPrev.days, firstNew.days) }
        : "day" in lastPrev && "hours" in lastPrev && "hours" in firstNew
        ? { day: lastPrev.day, hours: mergeDeep(lastPrev.hours, firstNew.hours) }
        : "hour" in lastPrev && "minutes" in lastPrev && "minutes" in firstNew
        ? { hour: lastPrev.hour, minutes: mergeDeep(lastPrev.minutes, firstNew.minutes) }
        : null;
    const lastPrevVal = linkProp && linkProp in lastPrev ? ((lastPrev as any)[linkProp] as number) : null;
    const firstNewVal = linkProp && linkProp in firstNew ? ((firstNew as any)[linkProp] as number) : null;
    return lastPrevVal === firstNewVal && !isNullish(lastPrevVal) && !isNullish(firstNewVal) && linkProp && subProp
      ? [...prev.slice(0, prev.length - 1), subProp as any, ...newStat.slice(1)]
      : [...prev, ...newStat];
  }
  return {
    years: prevDateStat ? (mergeDeep(prevDateStat.years, dateTree) as T.ChartDateStat["years"]) : dateTree,
    accAmt,
  };
};
