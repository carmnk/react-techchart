import * as T from "../Types";
import { isNullish } from "../utils";

export const iATR = (period?: number) => ({
  ...ATR,
  params: ATR.params.map((param) =>
    param.name === "period" && !isNullish(period) ? { ...param, val: period } : param
  ),
});

export const ATR: T.IndicatorModel = {
  name: "ATR",
  category: "Volatility",
  params: [{ name: "period", val: 14 }],
  default: {
    params: [{ name: "period", val: 14, type: "number" }],
    newSubchart: true,
  },
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: { dataseries: T.Dataset[]; prev: T.IndicatorDataSeries; period?: number }) => {
    const { dataseries: srcChartData, prev, period = 20 } = params;

    const indicatorData: T.IndicatorDataset[] = prev ? prev : [];
    for (let i = 0 + prev?.length ?? 0; i < srcChartData.length; i++) {
      if (i < period) {
        indicatorData.push({ prices: [null], date: srcChartData[i].date });
        continue;
      }
      let singleValAcc = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const dataset = srcChartData[j];
        const dataset1 = srcChartData[j - 1];
        let singleAtr = 0;
        if (T.isCandleChartDataset(dataset) && T.isCandleChartDataset(dataset1)) {
          const hl = dataset.high - dataset.low;
          const hc1 = Math.abs(dataset.high - dataset1.close);
          const lc1 = Math.abs(dataset.low - dataset1.close);
          singleAtr = Math.max(hl, hc1, lc1);
        } else if (T.isLineChartDataset(dataset) && T.isLineChartDataset(dataset1)) {
          const dc = Math.abs(dataset.close - dataset1.close);
          singleAtr = dc;
        } else if (T.isIndicatorDataset(dataset) && T.isIndicatorDataset(dataset1)) {
          const price = dataset.prices?.[0];
          const price1 = dataset1.prices?.[0];
          const dc = price !== null && price1 !== null ? Math.abs(price - price1) : 0;
          singleAtr = dc;
        }
        singleValAcc += singleAtr;
      }
      indicatorData.push({ prices: [singleValAcc / period], date: srcChartData[i].date });
    }
    return indicatorData;
  },
};
