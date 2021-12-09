import { ChartDataset } from ".";
import { ChartTheme, InputData } from "./ChartProps";
import { ChartState } from "./ChartState";
import { IndicatorData, IndicatorDataSeries } from "./ChartStateData";
import { DataSeries } from "./ChartStateData";

export type ReducerTask =
  | "addSubchart"
  | "swapSubcharts"
  | "addGraph"
  | "clearChart"
  | "draw"
  | "updateInteractionState"
  | "removeSubchart"
  | "removeGraph"
  | "removeTool"
  | "setGeneralProp"
  | "setGraphProp"
  | "setToolProp"
  | "addData"
  | "modifyIndicatorData"
  // | "toggleDarkMode"
  | "modifyChartData"
  | "setTheme"
  | "";

export type ReducerSetGeneralProps =
  | "backgroundColor"
  | "xAxisFillColor"
  | "xAxisStrokeColor"
  | "xAxisTextColor"
  | "yAxisStrokeColor"
  | "yAxisTextColor"
  | "gridStrokeColor"
  | "toggleGridX"
  | "toggleGridY"
  | "toggleFullscreen"
  // | "toggleDarkMode"
  | "toggleCrosshair"
  | "crosshairStrokeColor"
  | "crosshairXmarkerStrokeColor"
  | "crosshairXmarkerBackgroundColor"
  | "crosshairXmarkerTextColor"
  | "crosshairYmarkerStrokeColor"
  | "crosshairYmarkerBackgroundColor"
  | "crosshairYmarkerTextColor";

export type ReducerSetGraphProps =
  | "strokeColor"
  | "candleChartColor"
  | "candleUpColor"
  | "candleStrokeColor"
  | "candleWickStrokeColor"
  | "chartType"
  | "dataId";

export type ReducerSetToolProps = "strokeColor" | "anchorColor" | "hLineYlevel" | "toolParam";

export type ReducerAction<T extends ReducerTask = ReducerTask> = {
  task: T;
  params: T extends "setGeneralProp"
    ? {
        prop: ReducerSetGeneralProps;
        newValue: any;
      }
    : T extends "addData"
    ? {
        datas: InputData[];
      }
    : T extends "setGraphProp"
    ? {
        prop: ReducerSetGraphProps;
        subchartIdx: number;
        yaxisIdx: number;
        graphIdx: number;
        newValue: any;
      }
    : T extends "modifyIndicatorData"
    ? {
        dataId: string;
        newParam?: { paramIdx: number; newValue: any };
        newIndSrcId?: string;
        prevData?: IndicatorDataSeries;
      }
    : T extends "modifyChartData"
    ? {
        dataId: string;
        newDatasets: ChartDataset[];
      }
    : T extends "setToolProp"
    ? {
        prop: ReducerSetToolProps;
        subchartIdx: number;
        yaxisIdx: number;
        toolIdx: number;
        toolParamIdx?: number;
        newValue: any;
      }
    : T extends "addSubchart"
    ? {
        dataSeries: DataSeries;
        graphName: string;
        id: string;
        indicator?: IndicatorData["indicator"];
        reset?: boolean;
        indSrcId?: string;
      }
    : T extends "removeSubchart"
    ? {
        subchartIdx: number;
      }
    : T extends "addGraph"
    ? {
        dataSeries: DataSeries;
        graphName: string;
        subchartIdx: number;
        id: string;
        indicator?: IndicatorData["indicator"];
        indSrcId?: string;
        indSrcLineIdx?: number;
      }
    : T extends "removeGraph"
    ? {
        subchartIdx: number;
        yaxisIdx: number;
        graphIdx: number;
      }
    : T extends "swapSubcharts"
    ? { subchartIdx1: number; subchartIdx2: number }
    : T extends "removeTool"
    ? { subchartIdx: number; yaxisIdx: number; toolIdx: number }
    : T extends "draw"
    ? {
        type?: ChartState["draw"]["type"];
        xy?: [number, number];
        subchartIdx: number;
      }
    : T extends "updateInteractionState"
    ? {
        newState: ChartState;
      }
    : T extends "clearChart"
    ? {
        mode: "all" | "indicators" | "tools";
      }
    // : T extends "toggleDarkMode"
    // ? {}
    : T extends "setTheme"
    ? {
        theme: ChartTheme;
      }
    : any;
};

export const isSetGeneralPropAction = (action: ReducerAction): action is ReducerAction<"setGeneralProp"> =>
  action.task === "setGeneralProp";
export const isSetGraphPropAction = (action: ReducerAction): action is ReducerAction<"setGraphProp"> =>
  action.task === "setGraphProp";
export const isSetToolPropAction = (action: ReducerAction): action is ReducerAction<"setToolProp"> =>
  action.task === "setToolProp";
export const isAddSubchartAction = (action: ReducerAction): action is ReducerAction<"addSubchart"> =>
  action.task === "addSubchart";
export const isAddGraphAction = (action: ReducerAction): action is ReducerAction<"addGraph"> =>
  action.task === "addGraph";
export const isDrawAction = (action: ReducerAction): action is ReducerAction<"draw"> => action.task === "draw";
export const isRemoveSubchartAction = (action: ReducerAction): action is ReducerAction<"removeSubchart"> =>
  action.task === "removeSubchart";
export const isRemoveGraphAction = (action: ReducerAction): action is ReducerAction<"removeGraph"> =>
  action.task === "removeGraph";
export const isRemoveToolAction = (action: ReducerAction): action is ReducerAction<"removeTool"> =>
  action.task === "removeTool";
export const isUpdateInteractionState = (action: ReducerAction): action is ReducerAction<"updateInteractionState"> =>
  action.task === "updateInteractionState";
export const isClearChartAction = (action: ReducerAction): action is ReducerAction<"clearChart"> =>
  action.task === "clearChart";
export const isSwapSubchartsAction = (action: ReducerAction): action is ReducerAction<"swapSubcharts"> =>
  action.task === "swapSubcharts";
export const isAddDataAction = (action: ReducerAction): action is ReducerAction<"addData"> => action.task === "addData";
export const isModifyChartDataAction = (action: ReducerAction): action is ReducerAction<"modifyChartData"> =>
  action.task === "modifyChartData";
export const isModifyIndicatorDataAction = (action: ReducerAction): action is ReducerAction<"modifyIndicatorData"> =>
  action.task === "modifyIndicatorData";
// export const isToggleDarkModeAction = (action: ReducerAction): action is ReducerAction<"toggleDarkMode"> =>
//   action.task === "toggleDarkMode";
export const isSetThemeAction = (action: ReducerAction): action is ReducerAction<"setTheme"> =>
  action.task === "setTheme";
