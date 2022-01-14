import { Action } from "./useChartInteractions";
import { ChartPeriod } from "../utils/periods";
import { DataSeries, ChartDataset, IndicatorDataset, PixDataset } from "../utils/dataseries";

export type CalcState = {
  subcharts: CalcSubchartState[];
  xaxis: CalcXaxisState;
  pointer: CalcPointerState;
  yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  action?: Action;
};

export type CalcSubchartState = {
  yaxis: CalcYaxisState[];
};

export type CalcYaxisState = {
  graphs: (CalcGraphState | null)[];
  decimals: number;
  yMax: number;
  yMin: number;
  yMaxExact: number;
  yMinExact: number;
  optIntervalY: number;
  heightPerPt: number; // yaxis
  translatedY: number; // yaxis
  drawTicks: { pixY: number; label: string }[];
  pixY0: number;
};

export type CalcGraphState = {
  curData?: DataSeries;
  curTicks?: PixDataset[];
  yMax: number;
  yMaxExact: number;
  yMin: number;
  yMinExact: number;
  lastDataset: {
    x: number;
    pixX: number;
    data: ChartDataset | IndicatorDataset;
    dateString: string;
  } | null;
};

export type CalcXaxisState = {
  totalTranslatedX: number;
  scaledWidthPerTick: number;
  xStart: number;
  pixXStart: number;
  xEnd: number; // last index currently displayed
  xLast: number; // last index
  xUnlimited: number; // last index displayed without considering data end
  pixXEnd: number;
  initialWidthPerTick: number;
  curTicks: { x: number; dateString: string }[];
  optChartPeriod: ChartPeriod | null;
  xToPix?: (x: number, translatedX?: number) => number;
  pixToX?: (pixX: number, translatedX?: number) => number;
};

export type CalcPointerState = {
  isHovering: boolean;
  move: {
    pixX: number;
    pixY: number;
    pixXSnap: number; // 0 if not covered by data (not rt data)
    pixXUnlimSnap: number;
    x: number | null;
    xUnlimited: number;
    xDateString: string;
    subchartIdx: number | null;
    snapDatasets: {
      yaxisIdx: number;
      graphIdx: number;
      y: number;
      ySnap: string | null;
      pixYSnap: number | null;
      data: ChartDataset | IndicatorDataset;
      dateString: string;
    }[];
  };
  click: {
    clickedSubchartIdx: number | null;
  };
  // drag?: any;
};
