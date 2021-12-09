import * as T from "../Types";

export const iEMA: T.IndicatorModel = {
  name: "EMA",
  category: "Average",
  params: [
    { name: "period", val: 10 },
    { name: "dataSeriesKey", val: undefined as any },
  ],
  default: {
    params: [
      { name: "period", val: 10 },
      { name: "dataSeriesKey", val: undefined as any },
    ],
    newSubchart: false,
  },
  // type: "line",
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: {
    chartData: T.Dataset[];
    prevData: T.IndicatorDataSeries;
    dataSeriesKey?: number | "open" | "high" | "low" | "close";
    period?: number;
    // applyOn: "open" | "close" | "high" | "low" = "close"
  }): T.IndicatorDataSeries => {
    const { chartData: srcChartData, prevData, period = 20, dataSeriesKey } = params;
    const chartPriceKey = typeof dataSeriesKey === "string" ? dataSeriesKey : "close";
    const indPriceIdx = typeof dataSeriesKey === "number" ? dataSeriesKey : 0;
    const getPrice = (dataset: T.Dataset) => {
        return T.isLineChartDataset(dataset)
        ? chartPriceKey in dataset
          ? (dataset[chartPriceKey as keyof typeof dataset] as number)
          : dataset["close"]
        : T.isIndicatorDataset(dataset)
        ? dataset.prices?.[indPriceIdx] || 0
        : 0;
    };
    const indicatorData: T.IndicatorDataSeries = prevData ? prevData : [];
    for (let i = indicatorData?.length ?? 0; i < srcChartData.length; i++) {
      if (i < period - 1) {
        indicatorData.push({ prices: [null], date: srcChartData[i].date });
        continue;
      } else if (i === period - 1) {
        let initSMA = 0;
        for (let j = 0; j < period; j++) {
          const dataset = srcChartData[j];
          const price = getPrice(dataset);
          initSMA += price;
        }
        initSMA /= period;
        indicatorData.push({ prices: [initSMA], date: srcChartData[i].date });
      } else {
        const multiplier = 2 / (period + 1);
        const dataset = srcChartData[i];
        const price = getPrice(dataset);
        const ema =
          (price - (indicatorData[i - 1].prices[0] as number)) * multiplier +
          (indicatorData[i - 1].prices[0] as number);
        indicatorData.push({ prices: [ema], date: srcChartData[i].date });
      }
    }
    return indicatorData;
  },
};
