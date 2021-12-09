import { ChartDataSeries, DataSeries, IndicatorDataSeries } from "./ChartStateData";

// indicator model
export type IndicatorCategoryType = "Average" | "Oszillator" | "Volatility" | "Volume";

export type ChartSeriesIndicatorFn = (params: {
  chartData: ChartDataSeries;
  prevData: IndicatorDataSeries;
  [key: string]: any;
}) => IndicatorDataSeries;
export type DataSeriesIndicatorFn = (params: {
  chartData: DataSeries;
  prevData: IndicatorDataSeries;
  dataSeriesKey?: number | "open" | "high" | "low" | "close";
  // ...other: any[]
  [key: string]: any;
}) => IndicatorDataSeries;
export type IndicatorFn = ChartSeriesIndicatorFn | DataSeriesIndicatorFn; //| UniversalIndicatorFn;
export type IndicatorFnType = "chartSeries" | "dataSeries"; // | "universal";

export type IndicatorModel<T extends IndicatorFnType = IndicatorFnType> = {
  name: string;
  category: IndicatorCategoryType;
  params: { name: string; val: number }[];
  // type: "line" | "bars";
  // graphProps?: { name: string; val: number }[];
  graphTypes: { type: "line" | "bars"; name?: string }[];
  default: {
    params: { name: string; val: number }[];
    graphProps?: { name: string; val: any }[];
    newSubchart: boolean;
    fixedYScale?: [number, number]; //
    decimals?: number; //
  };
  indicatorFn: T extends "chartSeries"
    ? ChartSeriesIndicatorFn
    : T extends "dataSeries"
    ? DataSeriesIndicatorFn
    : // : T extends "universal"
      // ? UniversalIndicatorFn
      null;
  indicatorFnType: T;
};
