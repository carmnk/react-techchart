import * as T from "../Types";

export const iATR: T.IndicatorModel = {
  name: "ATR",
  category: "Volatility",
  params: [{ name: "period", val: 14 }],
  default: { params: [{ name: "period", val: 14 }], newSubchart: true },
  graphTypes: [{ type: "line" }],
  indicatorFnType: "chartSeries",
  indicatorFn: (params: {
    chartData: T.ChartDataset[];
    prevData: T.IndicatorDataSeries;
    period?: number;
    //applyOn: "open" | "close" | "high" | "low" = "close"
  }) => {
    const { chartData: srcChartData, prevData, period = 20 } = params;
    const indicatorData: T.IndicatorDataset[] = prevData ? prevData : [];
    for (let i = 0 + prevData?.length ?? 0; i < srcChartData.length; i++) {
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
        } else {
          const dc = Math.abs(dataset.close - dataset1.close);
          singleAtr = dc;
        }
        singleValAcc += singleAtr;
      }
      indicatorData.push({ prices: [singleValAcc / period], date: srcChartData[i].date });
    }
    return indicatorData;
  },
};
