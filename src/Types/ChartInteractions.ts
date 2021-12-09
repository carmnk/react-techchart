import { ChartStateProps } from "./ChartProps";
import { ChartState } from "./ChartState";
import { ChartDataSeries } from "./ChartStateData";
import { SubchartState } from "./ChartStateSubchart";


export type NEWChartInteractions = {
  pointer: PointerState;
  containerSize: ContainerSizeState;
  action: Action | null; 
  prev: NEWChartInteractions;
};

export type ChartInteractions = {
  pointer: PointerState;
  containerSize: ContainerSizeState;
  calc: ChartState["calc"];
  rtData?: ChartStateProps["rtData"];
  stateControl: {
    shallUpdate: ("drag" | "pointerMove" | "wheel" | "dragEnd" | "containerResize" | "deps" | "pinch")[];
    lastMainChartData: ChartDataSeries;
    prevAction: Action | null;
    customEffectChartState: CustomEffectChartState | null;
  };
};
export type ContainerSizeState = {
  top: number;
  left: number;
  width: number;
  height: number;
  init: boolean;
};
export type PointerState = {
  isHovering: boolean;
  move: { isMoving: boolean; xy: [number, number] };
  drag: {
    isDragging: boolean;
    xy: [number, number];
    initial: [number, number];
    delta: [number, number];
    first: boolean;
    last: boolean;
    movementInitial: [number, number];
    ctrlKey: boolean;
  };
  dragPointerUp: {
    isDragPointerUp: boolean;
    xy: [number, number];
  };
  wheel: { isWheeling: boolean; delta: [number, number] };
  pinch: {
    isPinching: boolean;
    movementInitial: [number, number];
    first: boolean;
    origin: [number, number];
  };
};
export type CustomEffectChartState = {
  subcharts: Omit<SubchartState, "top" | "bottom">[];
  draw: Omit<ChartState["draw"], "xy"> & { nPixXy: number };
};

export type Action = {
  drag: DragAction | null;
  wheel: { type: "wheelScale"; wheelDeltaY: number } | null;
  containerResize: boolean | null;
  pinch: PinchAction | null;
  deps: boolean;
  shallUpdateCalcSubcharts?: boolean;
  shallUpdateXaxis: boolean;
};
export type DragAction<T = "translate" | "scale" | "resizeSubchart" | "drawTool" | "editTool"> = {
  start: boolean;
  end: boolean; // unnecessary
  shallUpdate: boolean;
  type: T;
} & (T extends "resizeSubchart"
  ? { type: "resizeSubchart"; subchartIdx: number; bottomInitY: number }
  : T extends "editTool"
  ? {
      type: "editTool";
      subchartIdx: number;
      yaxisIdx: number;
      toolIdx: number;
      toolPtIdx: number;
      toolInitXy: [number, number];
    }
  : T extends "scale"
  ? {
      initScaledWidthPerTick: number;
      initTranslatedX: number;
    }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {});
export type WheelAction = {
  type: "wheelScale";
  wheelDeltaY: number;
};
export type PinchAction = {
  type: "pinchScale";
  initScaledWidthPerTick: number;
  initTranslatedX: number;
};