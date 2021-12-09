import * as T from "../Types";

export const iSMA: T.IndicatorModel = {
  name: "SMA",
  category: "Average",
  params: [{ name: "period", val: 10 }],
  default: { params: [{ name: "period", val: 10 }], newSubchart: false },
  // type: "line",
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: {
    chartData: T.Dataset[];
    prevData: T.IndicatorDataSeries;
    period?: number;
    // applyOn?: "open" | "close" | "high" | "low";
  }): T.IndicatorDataSeries => {
    const { chartData: srcChartData, prevData, period = 20 } = params;

    const indicatorData: T.IndicatorDataSeries = [...prevData];
    srcChartData.slice(prevData?.length ?? 0).forEach((srcDataset, srcDatasetIdx) => {
      const accumulatedIdx = srcDatasetIdx + (prevData?.length ?? 0);

      if (accumulatedIdx < period - 1) {
        indicatorData.push({ prices: [null], date: srcDataset.date });
        return;
      }
      let singleSmaAcc = 0;
      srcChartData.slice(accumulatedIdx - period + 1, accumulatedIdx + 1).forEach((selSrcDataset, idx, arr) => {
        if (T.isLineChartDataset(selSrcDataset)) singleSmaAcc += selSrcDataset.close;
        else if (T.isIndicatorDataset(selSrcDataset))
          singleSmaAcc += selSrcDataset.prices[0] ? selSrcDataset.prices[0] : 0;
      });
      indicatorData.push({ prices: [singleSmaAcc / period], date: srcDataset.date });
    });
    return indicatorData;
  },
};
