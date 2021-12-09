import * as T from "../Types";
import { isNullish } from "../utils/Basics";

export const iKAMA: T.IndicatorModel = {
  name: "KAMA",
  category: "Average",
  params: [
    { name: "erPeriod", val: 21 },
    { name: "fastEmaPeriod", val: 2 },
    { name: "slowEmaPeriod", val: 30 },
  ],
  default: {
    params: [
      { name: "erPeriod", val: 21 },
      { name: "fastEmaPeriod", val: 2 },
      { name: "slowEmaPeriod", val: 30 },
    ],
    newSubchart: false,
  },
  // type: "line",
  graphTypes: [{ type: "line" }],
  indicatorFnType: "dataSeries",
  indicatorFn: (params: {
    chartData: T.Dataset[];
    prevData: T.IndicatorDataSeries;
    erPeriod?: number;
    fastEmaPeriod?: number;
    slowEmaPeriod?: number;
  }): T.IndicatorDataSeries => {
    const {
      chartData: srcChartData,
      prevData,
      erPeriod = 20,
      fastEmaPeriod = 2,
      slowEmaPeriod = 30,
    } = params;
    const indicatorData: T.IndicatorDataSeries = [...prevData];

    srcChartData
      .slice(prevData?.length ?? 0)
      .forEach((srcDataset, srcDatasetIdx) => {
        const idx = srcDatasetIdx + (prevData?.length ?? 0);
        const defaultDataset = {
          prices: [null as number | null],
          date: srcDataset.date,
        };
        if (idx < erPeriod - 1 + 1) {
          indicatorData.push(defaultDataset);
          return;
        }
        const dataset = srcChartData[idx];
        const getDatasetPrice = (
          dataset: T.Dataset | null | undefined
        ): number | null =>
          isNullish(dataset)
            ? null
            : T.isLineChartDataset(dataset)
            ? dataset.close
            : T.isIndicatorDataset(dataset)
            ? dataset.prices?.[0]
            : null;
        const price = getDatasetPrice(dataset);
        if (!price) {
          indicatorData.push(defaultDataset);
          return;
        }
        const change = Math.abs(
          price - (getDatasetPrice(srcChartData?.[idx - erPeriod + 1]) ?? price)
        );
        const volatility = (
          srcChartData
            .slice(idx - erPeriod, idx + 1)
            .map((val, idx, arr) => {
              if (idx === 0) return null;

              const price0 = getDatasetPrice(val);
              const price1 = getDatasetPrice(arr[idx - 1]);
              return !isNullish(price0) && !isNullish(price1)
                ? Math.abs(price0 - price1)
                : null;
            })
            .filter((val) => val !== null) as number[]
        ).reduce((acc, cur, idx) => acc + cur, 0);
        const ER = volatility !== 0 ? change / volatility : 0;
        const slowConst = 2.0 / (slowEmaPeriod + 1);
        const fastConst = 2.0 / (fastEmaPeriod + 1);
        const SC = Math.pow(ER * (fastConst - slowConst) + slowConst, 2);
        const lastKama =
          indicatorData?.[idx - 1]?.prices?.[0] ??
          getDatasetPrice(srcChartData?.[idx - 1]);
        const kama = isNullish(lastKama)
          ? price
          : lastKama + SC * (price - lastKama);
        indicatorData.push({ prices: [kama], date: srcDataset.date });
      });
    return indicatorData;
  },
};
