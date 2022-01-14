import * as T from "../Types";
import { isNullish } from "../utils/Basics";
import { getAppliedPriceKeys, getPriceToApply } from "./utils";

export const iKAMA = (
  erPeriod?: number,
  fastEmaPeriod?: number,
  slowEmaPeriod?: number,
  applyOn?: number | "open" | "high" | "low" | "close"
) => ({
  ...KAMA,
  params: KAMA.params.map((param) =>
    param.name === "erPeriod" && !isNullish(erPeriod)
      ? { ...param, val: erPeriod }
      : param.name === "fastEmaPeriod" && !isNullish(fastEmaPeriod)
      ? { ...param, val: fastEmaPeriod }
      : param.name === "slowEmaPeriod" && !isNullish(slowEmaPeriod)
      ? { ...param, val: slowEmaPeriod }
      : param.name === "applyOn" && !isNullish(fastEmaPeriod)
      ? { ...param, val: applyOn }
      : param
  ),
});

export const KAMA: T.IndicatorModel = {
  name: "KAMA",
  category: "Average",
  params: [
    { name: "erPeriod", val: 21 },
    { name: "fastEmaPeriod", val: 2 },
    { name: "slowEmaPeriod", val: 30 },
    { name: "applyOn", val: 0 },
  ],
  default: {
    params: [
      { name: "erPeriod", val: 21, type: "number" },
      { name: "fastEmaPeriod", val: 2, type: "number" },
      { name: "slowEmaPeriod", val: 30, type: "number" },
      { name: "applyOn", val: 0, type: "applyOn" },
    ],
    newSubchart: false,
  },
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: {
    dataseries: T.Dataset[];
    prev: T.IndicatorDataSeries;
    erPeriod?: number;
    fastEmaPeriod?: number;
    slowEmaPeriod?: number;
    applyOn?: number | "open" | "high" | "low" | "close";
  }): T.IndicatorDataSeries => {
    const { dataseries: srcChartData, prev, erPeriod = 20, fastEmaPeriod = 2, slowEmaPeriod = 30, applyOn } = params;
    const indicatorData: T.IndicatorDataSeries = [...prev];
    const { chartPriceKey, indPriceIdx } = getAppliedPriceKeys(applyOn);

    srcChartData.slice(prev?.length ?? 0).forEach((srcDataset, srcDatasetIdx) => {
      const idx = srcDatasetIdx + (prev?.length ?? 0);
      const defaultDataset = {
        prices: [null as number | null],
        date: srcDataset.date,
      };
      if (idx < erPeriod - 1 + 1) {
        indicatorData.push(defaultDataset);
        return;
      }
      const dataset = srcChartData[idx];
      const price = getPriceToApply(dataset, chartPriceKey, indPriceIdx);
      if (!price) {
        indicatorData.push(defaultDataset);
        return;
      }
      const change = Math.abs(
        price - (getPriceToApply(srcChartData?.[idx - erPeriod + 1], chartPriceKey, indPriceIdx) ?? price)
      );
      const volatility = (
        srcChartData
          .slice(idx - erPeriod, idx + 1)
          .map((val, idx, arr) => {
            if (idx === 0) return null;

            const price0 = getPriceToApply(val, chartPriceKey, indPriceIdx);
            const price1 = getPriceToApply(arr[idx - 1], chartPriceKey, indPriceIdx);
            return !isNullish(price0) && !isNullish(price1) ? Math.abs(price0 - price1) : null;
          })
          .filter((val) => val !== null) as number[]
      ).reduce((acc, cur) => acc + cur, 0);
      const ER = volatility !== 0 ? change / volatility : 0;
      const slowConst = 2.0 / (slowEmaPeriod + 1);
      const fastConst = 2.0 / (fastEmaPeriod + 1);
      const SC = Math.pow(ER * (fastConst - slowConst) + slowConst, 2);
      const lastKama =
        indicatorData?.[idx - 1]?.prices?.[0] ?? getPriceToApply(srcChartData?.[idx - 1], chartPriceKey, indPriceIdx);
      const kama = isNullish(lastKama) ? price : lastKama + SC * (price - lastKama);
      indicatorData.push({ prices: [kama], date: srcDataset.date });
    });
    return indicatorData;
  },
};
