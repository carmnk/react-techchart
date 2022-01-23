import dequal from "lodash/isEqual";
import { calculatePointer } from "../Calc/CalcPointer";
import { calculateSubcharts, getYaxisMethods } from "../Calc/CalcSubcharts";
import { calculateXaxis } from "../Calc/CalcXaxis";
import { resizeContainer, resizeSubchart, editToolPosition, drawTool } from "./CalcInteractions";
import { snapToolsByXy } from "../utils/Utils";
import * as T from "../../Types";
import { defaultCalcPointer } from "../Defaults";

export const interactionsUpdate = (
  current: T.ChartState,
  params: T.ReducerAction<"updateInteractionState">["params"]
) => {
  const { Interactions, RtData, disablePointerEvents } = params;
  const { isRtOutOfRange, rtData } = RtData;
  const newState = current;
  const { action: chartAction } = getAction(Interactions, newState, isRtOutOfRange, disablePointerEvents);
  // pre-calc updates
  if (chartAction?.containerResize?.active)
    newState.subcharts = resizeContainer(Interactions.containerSize.height, newState);
  if (chartAction?.pointer?.type === "resizeSubchart")
    newState.subcharts = resizeSubchart(chartAction, newState.subcharts, Interactions.pointer.drag);
  // calcs
  const calcXaxis = chartAction?.shallUpdateXaxis
    ? calculateXaxis(newState, Interactions, chartAction)
    : newState.calc.xaxis;
  const calcSubcharts =
    chartAction?.shallUpdateCalcSubcharts || chartAction.isRtOutOfRange
      ? calculateSubcharts(newState, calcXaxis, rtData)
      : newState.calc.subcharts;
  const yaxisMethods =
    (chartAction?.shallUpdateCalcSubcharts || chartAction.isRtOutOfRange) && calcSubcharts
      ? getYaxisMethods(newState.subcharts, calcSubcharts)
      : {};
  const calc = { ...newState.calc, xaxis: calcXaxis, subcharts: calcSubcharts, ...yaxisMethods } as any;
  const calcPointer = disablePointerEvents
    ? defaultCalcPointer
    : (chartAction?.pointerMove && calculatePointer(newState, Interactions.pointer, calc)) ||
      (Interactions?.pointer?.isHovering !== newState.calc.pointer.isHovering && {
        ...newState.calc.pointer,
        isHovering: Interactions?.pointer?.isHovering,
      }) ||
      newState.calc.pointer;
  // post-calc-updates (wheeling is allowed during tool drawing or editing)
  newState.subcharts =
    chartAction?.pointer?.type === "editTool" && chartAction?.pointer?.shallUpdate
      ? editToolPosition(Interactions, calc, newState.subcharts, chartAction)
      : newState.subcharts;
  const { subcharts: finalizedSubcharts, draw } =
    chartAction?.pointer?.type === "drawTool"
      ? drawTool(Interactions, calc, newState)
      : { subcharts: newState.subcharts, draw: newState.draw };
  // only update containerSize if Interactions.containerSize values (ref!) has changed!
  const containerSize = !dequal(current.containerSize, Interactions.containerSize)
    ? { containerSize: Interactions.containerSize }
    : {};
  return {
    ...current,
    ...containerSize,
    subcharts: finalizedSubcharts,
    draw,
    calc: {
      ...current.calc,
      xaxis: calcXaxis,
      subcharts: calcSubcharts,
      pointer: calcPointer,
      ...yaxisMethods,
      action: chartAction,
    },
  };
};

const snapSubchartByBottom = (
  pixXy: [number, number] | undefined,
  subcharts: T.ChartState["subcharts"],
  snapTolPix?: number
): number | null => {
  if (!pixXy) return null;
  const snapTolPixInt = snapTolPix ?? 10;
  const activeSubchart = subcharts.find(
    (val) => pixXy[1] >= val.bottom - snapTolPixInt && pixXy[1] < val.bottom + snapTolPixInt
  );
  if (!activeSubchart) return null;
  const activeIdx = subcharts.indexOf(activeSubchart);
  if (activeIdx === -1) return null;
  return activeIdx;
};

const getDragAction = (PreState: T.ChartInteractions, ChartState: T.ChartState): T.DragAction | null => {
  const { containerSize, stateControl, pointer } = PreState;
  const { shallUpdate: interactiveUpdates } = stateControl;
  const { width: canvasWidth, height: containerHeight } = containerSize;
  const { isDrawing } = ChartState.draw;
  const { xaxis, action: prevAction } = ChartState.calc;
  const xaxisHeight = ChartState.theme.xaxis.heightXAxis;
  const prevDragAction = prevAction?.pointer;
  if (prevDragAction?.type === "pinchScale" || prevDragAction?.end) return null;
  const canvasHeight = containerHeight - xaxisHeight;
  const { last: isDragEnd, isDragging, first: isDragStart } = pointer.drag;
  const shallUpdateDragAction =
    (!!pointer.drag?.delta?.[0] || !!pointer.drag?.delta?.[1]) &&
    !pointer.drag?.first &&
    interactiveUpdates.includes("drag");
  const doContinuePrevAction =
    ["drawTool", "editTool", "resizeSubchart"].includes(prevDragAction?.type ?? "") ||
    (["translate", "scale"].includes(prevDragAction?.type ?? "") && !pointer.drag.last);
  if (doContinuePrevAction && prevDragAction)
    return {
      ...(prevDragAction as any),
      shallUpdate: shallUpdateDragAction,
      start: false,
      end: isDragEnd,
    };
  if (isDragging && isDrawing)
    return { type: "drawTool" as const, start: true, end: false, shallUpdate: true } as T.DragAction<"drawTool">;
  if (isDragging && !isDrawing) {
    const dragInitXy = pointer.drag.initial;
    const resizeSubchartIdx = snapSubchartByBottom(dragInitXy, ChartState.subcharts);
    const isResizeSubchartAction = resizeSubchartIdx !== null && resizeSubchartIdx !== ChartState.subcharts.length - 1;
    if (isResizeSubchartAction)
      return {
        type: "resizeSubchart" as const,
        start: isDragStart,
        end: isDragEnd,
        subchartIdx: resizeSubchartIdx,
        bottomInitY: ChartState.subcharts[resizeSubchartIdx].bottom,
        shallUpdate: true,
      };
    const selTools = snapToolsByXy(dragInitXy, ChartState.subcharts, xaxis, ChartState.calc); //only initially -> tool xy is changed by editing but dragInitXy isnt adjusted!
    if (selTools.length > 0) {
      const { subchartIdx, yaxisIdx, toolIdx, toolPtIdx } = selTools[0];
      const toolInitXy = ChartState.subcharts[subchartIdx].yaxis[yaxisIdx].tools[toolIdx].xy[toolPtIdx];
      return {
        type: "editTool" as const,
        start: isDragStart,
        end: isDragEnd,
        subchartIdx,
        yaxisIdx,
        toolIdx,
        toolPtIdx,
        toolInitXy,
        shallUpdate: true,
      };
    }
    const isTranslateAction =
      dragInitXy[0] >= 0 && dragInitXy[0] < 0 + canvasWidth && dragInitXy[1] >= 0 && dragInitXy[1] < 0 + canvasHeight;
    if (isTranslateAction)
      return {
        type: "translate" as const,
        start: isDragStart,
        end: isDragEnd,
        shallUpdate: true,
      } as T.DragAction<"translate">;
    const isPointerScaleAction =
      dragInitXy[0] >= 0 && dragInitXy[0] < 0 + canvasWidth && dragInitXy[1] >= 0 + canvasHeight;
    if (isPointerScaleAction) {
      return {
        type: "scale" as const,
        start: isDragStart,
        end: isDragEnd,
        initScaledWidthPerTick: xaxis.scaledWidthPerTick,
        initTranslatedX: xaxis.totalTranslatedX,
        shallUpdate: true,
      };
    }
    return null;
  }
  return null;
};

const getAction = (
  PreState: T.ChartInteractions,
  ChartState: T.ChartState,
  isRtOutOfRange: boolean,
  disablePointerEvents?: boolean
): { action: T.Action } => {
  const { xaxis, action: prevAction } = ChartState.calc;
  const { stateControl, pointer } = PreState;
  const { shallUpdate: interactiveUpdates } = stateControl;
  const containerResize = {
    active: interactiveUpdates.includes("containerResize"), //&& ChartState.subcharts.length > 0,
  };
  const deps = interactiveUpdates.includes("deps");
  if (disablePointerEvents)
    return {
      action: {
        pointer: null,
        wheel: null,
        pointerMove: false,
        isRtOutOfRange,
        containerResize,
        deps,
        shallUpdateXaxis: deps,
        shallUpdateCalcSubcharts: deps || containerResize.active,
      },
    };
  const wheelDeltaY = pointer.wheel?.delta[1];
  const isWheeling = !!pointer.wheel?.isWheeling && interactiveUpdates.includes("wheel") && !!wheelDeltaY;
  const wheel = isWheeling ? { wheelDeltaY, type: "wheelScale" as const } : null;
  const pinch =
    prevAction?.pointer?.type === "pinchScale" && PreState.pointer.pinch.isPinching
      ? prevAction.pointer
      : interactiveUpdates.includes("pinch") && PreState.pointer.pinch.isPinching
      ? {
          type: "pinchScale" as const,
          initScaledWidthPerTick: xaxis.scaledWidthPerTick,
          initTranslatedX: xaxis.totalTranslatedX,
        }
      : null;
  const pointerAction = pinch ? pinch : getDragAction(PreState, ChartState);

  const shallUpdateCalcSubcharts =
    (["scale", "translate"].includes(pointerAction?.type ?? "") && (pointerAction as T.DragAction)?.shallUpdate) ||
    pointerAction?.type === "resizeSubchart" ||
    containerResize.active ||
    deps ||
    !!pinch ||
    !!wheel;
  const shallUpdateXaxis =
    (!!wheel ||
      deps ||
      !!pinch ||
      ((pointerAction as T.DragAction)?.shallUpdate &&
        (pointerAction?.type === "translate" || pointerAction?.type === "scale"))) ??
    false;
  const action = {
    pointer: pointerAction,
    wheel,
    containerResize,
    deps,
    shallUpdateCalcSubcharts,
    shallUpdateXaxis,
    pointerMove: stateControl.shallUpdate.includes("pointerMove") && pointer?.move?.isMoving,
    isRtOutOfRange,
  };
  return {
    action,
  };
};
