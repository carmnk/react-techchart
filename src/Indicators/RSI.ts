import * as T from "../Types";
import { isNullish } from "../utils/Basics";

export const createIRSI = (params: { period: number }) => ({
  ...iRSI,
  params: iRSI.params.map((param) =>
    param.name === "period" && !isNullish(params?.period) ? { ...param, val: params.period } : param
  ),
});
export const iRSI: T.IndicatorModel = {
  name: "RSI",
  category: "Oszillator",
  params: [{ name: "period", val: 14 }],
  default: {
    params: [{ name: "period", val: 14 }],
    newSubchart: true,
    decimals: 2,
    fixedYScale: [0, 100],
    graphProps: [{ name: "areaTresholds", val: { lower: 25, upper: 75 } }],
  },
  graphTypes: [{ type: "line" }],
  indicatorFnType: "chartSeries",

  indicatorFn: (params: {
    chartData: T.ChartDataset[];
    prevData: T.IndicatorDataSeries;
    period?: number;
    // applyOn: "open" | "close" | "high" | "low" = "close"
  }) => {
    const { chartData: srcChartData, prevData, period = 14 } = params;
    const indicatorData: T.IndicatorDataset[] = prevData ? prevData : [];
    for (let i = prevData.length; i < srcChartData.length; i++) {
      if (i === 0) {
        indicatorData.push({ prices: [null, null, null], date: srcChartData[i].date });
        continue;
      }
      const dataset = srcChartData[i];
      const dataset1 = srcChartData[i - 1];
      const dClose = dataset.close - dataset1.close;
      const up = dClose > 0 ? dClose : 0;
      const dwn = dClose < 0 ? -dClose : 0;
      const w = 1 / period;
      const lastUpSmoothed = indicatorData?.[indicatorData?.length - 1]?.prices?.[1];
      const lastDwnSmoothed = indicatorData?.[indicatorData?.length - 1]?.prices?.[2];
      if (i < period || isNullish(lastUpSmoothed) || isNullish(lastDwnSmoothed)) {
        indicatorData.push({ prices: [null, up, dwn], date: srcChartData[i].date });
        continue;
      }
      const upSmoothed = up * w + (1 - w) * lastUpSmoothed;
      const dwnSmoothed = dwn * w + (1 - w) * lastDwnSmoothed;
      const rsi = dwnSmoothed === 0 ? 100 : 100 - 100 / (1 + upSmoothed / dwnSmoothed);
      indicatorData.push({ prices: [rsi, upSmoothed, dwnSmoothed], date: srcChartData[i].date });
    }
    return indicatorData;
  },
};
