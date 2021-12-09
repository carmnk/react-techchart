import * as T from "../Types";

export const iVolume: T.IndicatorModel = {
  name: "Volume",
  category: "Volume",
  params: [],
  default: { params: [], newSubchart: true, decimals: 0 },
  // type: "bars",
  graphTypes: [{ type: "bars" }],
  // nSeries: 1,
  indicatorFnType: "chartSeries",
  indicatorFn: (params: { chartData: T.ChartDataset[] }) => {
    const { chartData: srcChartData } = params;
    const indicatorData: T.IndicatorDataset[] = [];
    for (let i = 0; i < srcChartData.length; i++) {
      const dataset = srcChartData[i];
      if (T.isVolumeDataset(dataset)) {
        indicatorData.push({ prices: [dataset.volume], date: dataset.date });
      } else {
        indicatorData.push({ prices: [0], date: dataset.date });
      }
    }
    return indicatorData;
  },
};
