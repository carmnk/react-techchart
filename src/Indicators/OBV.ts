import * as T from "../Types";

export const iOBV = () => OBV;

export const OBV: T.IndicatorModel = {
  name: "OBV",
  category: "Volume",
  graphTypes: [{ type: "line" }],
  params: [],
  default: { params: [], newSubchart: true, decimals: 0 },
  indicatorFnType: "chartSeries",
  indicatorFn: (params: { dataseries: T.ChartDataSeries; prev: T.IndicatorDataSeries }) => {
    const { dataseries: srcChartData, prev } = params;
    const indicatorData: T.IndicatorDataset[] = prev ? prev : [];
    for (let i = indicatorData?.length; i < srcChartData.length; i++) {
      const dataset = srcChartData[i];
      if (i === 0 && T.isVolumeDataset(dataset)) {
        indicatorData.push({ prices: [dataset.volume], date: dataset.date });
        continue;
      }
      const dataset1 = srcChartData[i - 1];
      const lastObv = indicatorData?.[i - 1];
      if (!T.isVolumeDataset(dataset) || !T.isVolumeDataset(dataset1)) {
        indicatorData.push({ prices: [null], date: srcChartData[i].date });
        continue;
      }
      const lastObvVal = lastObv?.prices?.[0] ?? 0;
      const obv = lastObvVal + Math.sign(dataset.close - dataset1.close) * dataset.volume;
      indicatorData.push({ prices: [obv], date: srcChartData[i].date });
    }
    return indicatorData;
  },
};
