import * as T from "../Types";

export const iVolume = () => Volume;
export const Volume: T.IndicatorModel = {
  name: "Volume",
  category: "Volume",
  params: [],
  default: { params: [], newSubchart: true, decimals: 0 },
  graphTypes: [{ type: "bars" }],
  indicatorFnType: "chartSeries",
  indicatorFn: (params: { dataseries: T.ChartDataset[] }) => {
    const { dataseries: srcChartData } = params;
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
