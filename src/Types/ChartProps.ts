/** CChart Prop types */

import { ChartState, ChartStateHook } from "./ChartState";
import { ChartDataSeries, Dataset } from "./ChartStateData";
import { IndicatorModel, IndicatorFnType } from "./IndicatorModel";
import { ToolState, ChartGraphStateSpecifics } from "./ChartStateSubchart";
import { DeepPartial } from "./utils";
import { ChartStateDispatch, PixDataset, ReducerTask } from ".";

export type ChartStateProps = {
  // ContainerRef: React.RefObject<HTMLElement>;
  data: InputData[];
  rtData?: { data: ChartDataSeries; dataId: string }[];
  width?: number;
  height?: number;
  settings: {
    initialState?: DeepPartial<ChartState["options"]>;
    themes?: ChartTheme[];
    containerMode?: "static" | "responsive";
    additionalIndicators?: IndicatorModel[];
    disablePointerEvents?: boolean;
    maxUpdatesPerSec?: number;
    initWidthPerTick?: number;
    disableTheme?: boolean;
    appendElement?: React.ReactNode;
  };
};

// type of CChart props
export type CChartProps = {
  Controller: ChartStateHook;
};

export type ChartTheme = DeepPartial<ChartState["options"]> & {
  name: string;
  isDarkMode: boolean;
};

export type InputData = GenericInputData & (ChartInputData | IndicatorInputData);

export type GenericInputData = {
  graphProps?: {
    subchartIdx?: number;
    yaxisIdx?: number;
    graphIdx?: number;
  };
};

export type ChartInputData = {
  data: ChartDataSeries;
  name: string;
  type: "chart";
  id: string;
  graphProps?: {
    chartType?: ChartGraphStateSpecifics["chartType"];
    style?: DeepPartial<ChartGraphStateSpecifics["style"]>;
  };
};
export type IndicatorInputData<T extends IndicatorFnType = IndicatorFnType> = {
  name?: string;
  type: "indicator";
  id?: string; // or default id is assigned, but if indicator is needed as src for initialization of another indicator => id is necessary
  indSrcId?: string; // default -> mainchart id
  indicator: IndicatorModel<T>;
  graphProps?: {
    style?: {
      strokeColor: string[];
    };
  };
};

export type RealtimeDataCalc = {
  pix: PixDataset[] | null;
  data: (Dataset & { x: number })[];
  dataId: string;
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
};

export type RealtimeDataTick = {
  // pix: PixDataset[] | null;
  data: (Dataset & { x: number })[];
  dataId: string;
  // subchartIdx: number;
  // yaxisIdx: number;
  // graphIdx: number;
  ticks: PixDataset[] | null;
};
