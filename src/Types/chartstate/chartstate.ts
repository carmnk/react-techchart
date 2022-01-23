import type { AlertProps } from "@mui/material/Alert";
import { CalcState } from "./calc";
import { ChartData, IndicatorData } from "./data";
import { SubchartState } from "./subcharts";
import { PointerState, ContainerSizeState } from "./useChartInteractions";

export type ChartState = {
  theme: {
    name: string;
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
      initialWidthPerTick: number;
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
  fullscreen: boolean;
  draw: {
    isDrawing: boolean;
    xy: [number, number][];
    type?: "hline" | "vline" | "trendline";
    params: { name: string; val: any; vals: any[] }[];
  };
  subcharts: SubchartState[];
  data: (ChartData | IndicatorData)[];
  // pointer: PointerState;
  containerSize: ContainerSizeState;
  calc: CalcState;
  menu: {
    location: null;
    expandedSetting: [];
    disablePointerEvents: boolean;
    snackbars: { text: string; type: AlertProps["severity"] }[];
  };
};

export type ChartMemo = {
  customEffectChartState: CustomEffectChartState | null;
};

export type CustomEffectChartState = {
  subcharts: Omit<SubchartState, "top" | "bottom">[];
  draw: Omit<ChartState["draw"], "xy"> & { nPixXy: number };
};
