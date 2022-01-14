import * as T from "../Types";
import { isNullish } from "../utils";
import { getAppliedPriceKeys, getPriceToApply } from "./utils";

export const iSMA = (period?: number, applyOn?: number | "open" | "high" | "low" | "close") => ({
  ...SMA,
  params: SMA.params.map((param) =>
    param.name === "period" && !isNullish(period)
      ? { ...param, val: period }
      : param.name === "applyOn" && !isNullish(applyOn)
      ? { ...param, val: applyOn }
      : param
  ),
});

export const SMA: T.IndicatorModel = {
  name: "SMA",
  category: "Average",
  params: [
    { name: "period", val: 10 },
    { name: "applyOn", val: 0 },
  ],
  default: {
    params: [
      { name: "period", val: 10, type: "number" },
      { name: "applyOn", val: 0, type: "applyOn" },
    ],
    newSubchart: false,
  },
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: {
    dataseries: T.Dataset[];
    prev: T.IndicatorDataSeries;
    period?: number;
    applyOn?: number | "open" | "high" | "low" | "close";
  }): T.IndicatorDataSeries => {
    const { dataseries: srcChartData, prev, period = 20, applyOn } = params;
    const { chartPriceKey, indPriceIdx } = getAppliedPriceKeys(applyOn);

    const indicatorData: T.IndicatorDataSeries = [...prev];
    srcChartData.slice(prev?.length ?? 0).forEach((srcDataset, srcDatasetIdx) => {
      const accumulatedIdx = srcDatasetIdx + (prev?.length ?? 0);
      if (accumulatedIdx < period - 1) {
        indicatorData.push({ prices: [null], date: srcDataset.date });
        return;
      }
      let singleSmaAcc = 0;
      srcChartData.slice(accumulatedIdx - period + 1, accumulatedIdx + 1).forEach((selSrcDataset) => {
        const price = getPriceToApply(selSrcDataset, chartPriceKey, indPriceIdx);
        singleSmaAcc += price;
      });
      indicatorData.push({ prices: [singleSmaAcc / period], date: srcDataset.date });
    });
    return indicatorData;
  },
};
