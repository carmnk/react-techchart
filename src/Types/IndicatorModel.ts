import { ChartDataSeries, DataSeries, IndicatorDataSeries } from "./utils/dataseries";

// indicator model
export type IndicatorCategoryType = "Average" | "Oszillator" | "Volatility" | "Volume" | "Other";

export type ChartSeriesIndicatorFn = (params: {
  dataseries: ChartDataSeries;
  prev: IndicatorDataSeries;
  applyOn?: "open" | "high" | "low" | "close";
  [key: string]: any;
}) => IndicatorDataSeries;

export type DataSeriesIndicatorFn = (params: {
  dataseries: DataSeries;
  prev: IndicatorDataSeries;
  applyOn?: number | "open" | "high" | "low" | "close";
  [key: string]: any;
}) => IndicatorDataSeries;

export type IndicatorFn = ChartSeriesIndicatorFn | DataSeriesIndicatorFn;
export type IndicatorFnType = "chartSeries" | "dataSeries";

export type IndicatorParameter = {
  name: string;
  val: number | string;
};

export type IndicatorParameterType = "number" | "select" | "applyOn";

export type IndicatorParameterDefinition<T = IndicatorParameterType> = T extends "select"
  ? IndicatorParameter & { type: T; options: (string | number)[] }
  : IndicatorParameter & { type: T };

export type IndicatorModel<T extends IndicatorFnType = IndicatorFnType> = {
  name: string;
  category: IndicatorCategoryType;
  params: IndicatorParameter[];
  // each line/bar-series (see type IndicatorDataset.prices[]) that is supposed to be drawn must be defined with graphTypes
  // -> the following can be used as buffers (IndicatorDataset.prices[i] where i>= graphTypes.length)
  graphTypes: { type: "line" | "bars"; name?: string }[];
  default: {
    params: IndicatorParameterDefinition[];
    // graphProps?: { name: string; val: any }[]; // only in RSI previously considered for areas, not yet implemented will probably change
    newSubchart: boolean;
    fixedYScale?: [number, number]; //
    decimals?: number; //
  };
  indicatorFn: T extends "chartSeries" ? ChartSeriesIndicatorFn : T extends "dataSeries" ? DataSeriesIndicatorFn : null;
  indicatorFnType: T;
};
