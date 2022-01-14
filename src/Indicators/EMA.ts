import * as T from "../Types";
import { isNullish } from "../utils";
import { getAppliedPriceKeys, getPriceToApply } from "./utils";

export const iEMA = (period?: number, applyOn?: number | "open" | "high" | "low" | "close") => ({
  ...EMA,
  params: EMA.params.map((param) =>
    param.name === "period" && !isNullish(period)
      ? { ...param, val: period }
      : param.name === "applyOn" && !isNullish(applyOn)
      ? { ...param, val: applyOn }
      : param
  ),
});

export const EMA: T.IndicatorModel = {
  name: "EMA",
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
    applyOn?: number | "open" | "high" | "low" | "close";
    period?: number;
  }): T.IndicatorDataSeries => {
    const { dataseries: srcChartData, prev, period = 20, applyOn } = params;
    const { chartPriceKey, indPriceIdx } = getAppliedPriceKeys(applyOn);

    const indicatorData: T.IndicatorDataSeries = prev ? prev : [];
    for (let i = indicatorData?.length ?? 0; i < srcChartData.length; i++) {
      if (i < period - 1) {
        indicatorData.push({ prices: [null], date: srcChartData[i].date });
        continue;
      } else if (i === period - 1) {
        let initSMA = 0;
        for (let j = 0; j < period; j++) {
          const dataset = srcChartData[j];
          const price = getPriceToApply(dataset, chartPriceKey, indPriceIdx);
          initSMA += price;
        }
        initSMA /= period;
        indicatorData.push({ prices: [initSMA], date: srcChartData[i].date });
      } else {
        const multiplier = 2 / (period + 1);
        const dataset = srcChartData[i];
        const price = getPriceToApply(dataset, chartPriceKey, indPriceIdx);
        const ema =
          (price - (indicatorData?.[i - 1]?.prices?.[0] ?? 0)) * multiplier +
          (indicatorData?.[i - 1]?.prices?.[0] ?? 0);
        indicatorData.push({ prices: [ema], date: srcChartData[i].date });
      }
    }
    return indicatorData;
  },
};
