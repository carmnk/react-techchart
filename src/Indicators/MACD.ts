import * as T from "../Types";
import { isNullish } from "../utils/Basics";
import { iEMA } from "./EMA";

export const iMACD: T.IndicatorModel = {
  name: "MACD",
  category: "Oszillator",
  params: [
    { name: "period short", val: 12 },
    { name: "period long", val: 26 },
    { name: "signal period", val: 9 },
  ],
  default: {
    params: [
      { name: "period short", val: 12 },
      { name: "period long", val: 26 },
      { name: "signal period", val: 9 },
    ],
    newSubchart: true,
    // decimals: 0,
  },
  // type: "line",
  graphTypes: [
    { type: "line", name: "MACD" },
    { type: "line", name: "Signal" },
    { type: "bars", name: "Histogram" },
  ], // { type: "line" }, { type: "line" }],
  indicatorFnType: "chartSeries",
  indicatorFn: (params: {
    chartData: T.ChartDataset[];
    prevData: T.IndicatorDataSeries;
    periodEmaShort?: number;
    periodEmaLong?: number;
    periodSignal?: number;
    // applyOn: "open" | "close" | "high" | "low" = "close"
  }): T.IndicatorDataSeries => {
    const { chartData: srcChartData, prevData, periodEmaShort = 12, periodEmaLong = 26, periodSignal = 9 } = params;
    const emaFn = iEMA.indicatorFn as T.DataSeriesIndicatorFn;

    const prevCalcData = prevData
      ? {
          macd: prevData.map((indDataset, indIdx) => ({ ...indDataset, prices: [indDataset?.prices?.[0]] })),
          signal: prevData.map((indDataset, indIdx) => ({ ...indDataset, prices: [indDataset?.prices?.[1]] })),
          emaShort: prevData.map((indDataset) => ({ ...indDataset, prices: [indDataset?.prices?.[3]] })),
          emaLong: prevData.map((indDataset, indIdx) => ({ ...indDataset, prices: [indDataset?.prices?.[4]] })),
        }
      : null;

    const emaShort = emaFn({ chartData: srcChartData, prevData: prevCalcData?.emaShort ?? [], period: periodEmaShort }); // FUTURE: use prevData but first return all calc dataseries and hide calcs
    const emaLong = emaFn({ chartData: srcChartData, prevData: prevCalcData?.emaLong ?? [], period: periodEmaLong });

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
    const signal = emaFn({ chartData: macd, prevData: prevCalcData?.signal ?? [], period: periodSignal });
    const macdComplete = [
      ...prevData,
      ...macd.slice(prevData?.length ?? 0).map((macdVal, newIdx) => {
        const idx = newIdx + prevData?.length ?? 0;
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
