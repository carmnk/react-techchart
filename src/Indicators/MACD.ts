import * as T from "../Types";
import { isNullish } from "../utils/Basics";
import { EMA } from "./EMA";

export const iMACD = (periodShort?: number, periodLong?: number, periodSignal?: number) => ({
  ...MACD,
  params: MACD.params.map((param) =>
    param.name === "period short" && !isNullish(periodShort)
      ? { ...param, val: periodShort }
      : param.name === "period long" && !isNullish(periodLong)
      ? { ...param, val: periodLong }
      : param.name === "signal period" && !isNullish(periodSignal)
      ? { ...param, val: periodSignal }
      : param
  ),
});

export const MACD: T.IndicatorModel = {
  name: "MACD",
  category: "Oszillator",
  params: [
    { name: "period short", val: 12 },
    { name: "period long", val: 26 },
    { name: "signal period", val: 9 },
  ],
  default: {
    params: [
      { name: "period short", val: 12, type: "number" },
      { name: "period long", val: 26, type: "number" },
      { name: "signal period", val: 9, type: "number" },
    ],
    newSubchart: true,
  },
  graphTypes: [
    { type: "line", name: "MACD" },
    { type: "line", name: "Signal" },
    { type: "bars", name: "Histogram" },
  ],
  indicatorFnType: "chartSeries",
  indicatorFn: (params: {
    dataseries: T.ChartDataset[];
    prev: T.IndicatorDataSeries;
    periodEmaShort?: number;
    periodEmaLong?: number;
    periodSignal?: number;
    // applyOn: "open" | "close" | "high" | "low" = "close"
  }): T.IndicatorDataSeries => {
    const { dataseries: srcChartData, prev, periodEmaShort = 12, periodEmaLong = 26, periodSignal = 9 } = params;
    const emaFn = EMA.indicatorFn as T.DataSeriesIndicatorFn;
    const prevCalcData = prev
      ? {
          macd: prev.map((indDataset) => ({ ...indDataset, prices: [indDataset?.prices?.[0]] })),
          signal: prev.map((indDataset) => ({ ...indDataset, prices: [indDataset?.prices?.[1]] })),
          emaShort: prev.map((indDataset) => ({ ...indDataset, prices: [indDataset?.prices?.[3]] })),
          emaLong: prev.map((indDataset) => ({ ...indDataset, prices: [indDataset?.prices?.[4]] })),
        }
      : null;
    const emaShort = emaFn({ dataseries: srcChartData, prev: prevCalcData?.emaShort ?? [], period: periodEmaShort });
    const emaLong = emaFn({ dataseries: srcChartData, prev: prevCalcData?.emaLong ?? [], period: periodEmaLong });
    const macd: T.IndicatorDataSeries = [
      ...(prevCalcData?.macd ?? []),
      ...emaShort.slice(prevCalcData?.macd?.length ?? 0).map((emaShortDataset, newIdx) => {
        const idx = newIdx + (prevCalcData?.macd?.length ?? 0);
        const emaLongVal = emaLong[idx].prices[0];
        const emaShortVal = emaShortDataset.prices[0];
        const macdVal = isNullish(emaShortVal) || isNullish(emaLongVal) ? null : emaShortVal - emaLongVal;
        return { prices: [macdVal], date: srcChartData[idx].date, priceLabels: ["MACD"] };
      }),
    ];
    const signal = emaFn({ dataseries: macd, prev: prevCalcData?.signal ?? [], period: periodSignal });
    const macdComplete = [
      ...prev,
      ...macd.slice(prev?.length ?? 0).map((macdVal, newIdx) => {
        const idx = newIdx + prev?.length ?? 0;
        const macdValPrice = macdVal.prices[0];
        const signalVal = signal[idx].prices[0];
        const macdHistogramm = macdValPrice === null || signalVal === null ? null : macdValPrice - signalVal;
        const emaShortVal = emaShort[idx].prices[0];
        const emaLongVal = emaLong[idx].prices[0];
        return { ...macdVal, prices: [macdValPrice, signalVal, macdHistogramm, emaShortVal, emaLongVal] };
      }),
    ];
    return macdComplete;
  },
};
