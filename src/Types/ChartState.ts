import { ReducerTask, ReducerAction } from "./ChartStateReducer";
import { CalcSubchartState, CalcPointerState, CalcXaxisState } from "./ChartStateCalc";
import { ChartData, IndicatorData } from "./ChartStateData";
import { SubchartState } from "./ChartStateSubchart";
import { PointerState, ContainerSizeState } from "./ChartInteractions";
import { ChartStateProps, RealtimeDataTick } from "./ChartProps";

/** ChartState */

export type ChartState = {
  options: {
    isDarkMode: boolean;
    backgroundColor: string;
    borderColor: string;
    crosshair: {
      useCrosshair: boolean;
      strokeColor: string;
      xMarkerFontSize: number;
      xMarkerFontName: string;
      xMarkerTextColor: string;
      xMarkerStrokeColor: string;
      xMarkerBackgroundColor: string;
      yMarkerTextColor: string;
      yMarkerStrokeColor: string;
      yMarkerBackgroundColor: string;
      yMarkerFontSize: number;
      yMarkerFontName: string;
    };
    grid: { useGridX: boolean; useGridY: boolean; strokeColor: string; strokeStyle: string };
    yaxis: {
      widthYAxis: number;
      widthTickmarkLines: number;
      fillColor: string;
      strokeColor: string;
      fontColor: string;
      fontSize: number;
      fontName: string;
    };
    xaxis: {
      heightXAxis: number;
      heightTickMarkLines: number;
      fillColor: string;
      strokeColor: string;
      fontColor: string;
      fontSize: number;
      fontName: string;
    };
    draw: {
      strokeColor: string;
      anchorColor: string;
    };
  };
  calc: {
    subcharts: CalcSubchartState[];
    xaxis: CalcXaxisState;
    pointer: CalcPointerState;
    yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
    pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  };
  // darkMode: boolean;
  fullscreen: boolean;
  subCharts: SubchartState[];
  draw: {
    isDrawing: boolean;
    xy: [number, number][];
    type?: "hline" | "vline" | "trendline";
    params: { name: string; val: any; vals: any[] }[];
  };
  data: (ChartData | IndicatorData)[];
  pointer: PointerState;
  containerSize: ContainerSizeState;
};

/** Hook */
export type ChartStateDispatch<Action extends ReducerTask> = React.Dispatch<ReducerAction<Action>>;
export type ChartStateHook<Action extends ReducerTask = ReducerTask> = {
  ChartState: ChartState;
  Dispatch: ChartStateDispatch<ReducerTask>;
  ContainerRef: React.RefObject<HTMLDivElement>;
  settings: ChartStateProps["settings"];
  rtTicks: RealtimeDataTick[];
};
