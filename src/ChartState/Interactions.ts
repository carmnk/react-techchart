import * as T from "../Types";
import { resizeSubcharts } from "./Reducer/SubchartFactory";
import { snapToolsByXy } from "./utils/Utils";

const snapSubchartByBottom = (
  pixXy: [number, number] | undefined,
  subcharts: T.ChartState["subCharts"],
  snapTolPix?: number
): number | null => {
  if (!pixXy) return null;
  const snapTolPixInt = snapTolPix ?? 10;
  const activeSubchart = subcharts.find(
    (val) =>
      pixXy[1] >= val.bottom - snapTolPixInt &&
      pixXy[1] < val.bottom + snapTolPixInt
  );
  if (!activeSubchart) return null;
  const activeIdx = subcharts.indexOf(activeSubchart);
  if (activeIdx === -1) return null;
  return activeIdx;
};

const getDragAction = (
  PreState: T.ChartInteractions,
  subcharts: T.SubchartState[],
  isDrawing: boolean,
  xaxisHeight: number
): T.DragAction | null => {
  const { calc, containerSize, stateControl, pointer } = PreState;
  const { xaxis } = calc;
  const { shallUpdate: interactiveUpdates, prevAction } = stateControl;
  const { width: canvasWidth, height: containerHeight } = containerSize;
  const prevDragAction = prevAction?.drag;
  const canvasHeight = containerHeight - xaxisHeight;
  const isDragStart = pointer.drag.first;
  const isDragEnd = pointer.drag.last;

  const isDragging = pointer.drag.isDragging;

  const shallUpdateDragAction =
    (!!pointer.drag?.delta?.[0] || !!pointer.drag?.delta?.[1]) &&
    !pointer.drag?.first &&
    interactiveUpdates.includes("drag");
  const doContinuePrevAction =
    ["drawTool", "editTool", "resizeSubchart"].includes(
      prevDragAction?.type ?? ""
    ) ||
    (["translate", "scale"].includes(prevDragAction?.type ?? "") &&
      !pointer.drag.last);
  if (doContinuePrevAction && prevDragAction)
    return {
      ...prevDragAction,
      shallUpdate: shallUpdateDragAction,
      start: false,
      end: isDragEnd,
    };
  if (isDragging && isDrawing)
    return {
      type: "drawTool" as const,
      start: true,
      end: false,
      shallUpdate: true,
    } as T.DragAction<"drawTool">;
  if (isDragging && !isDrawing) {
    const dragInitXy = pointer.drag.initial;
    const resizeSubchartIdx = snapSubchartByBottom(dragInitXy, subcharts);
    const isResizeSubchartAction =
      resizeSubchartIdx !== null && resizeSubchartIdx !== subcharts.length - 1;
    if (isResizeSubchartAction)
      return {
        type: "resizeSubchart" as const,
        start: isDragStart,
        end: isDragEnd,
        subchartIdx: resizeSubchartIdx,
        bottomInitY: subcharts[resizeSubchartIdx].bottom,
        shallUpdate: true,
      };
    const selTools = snapToolsByXy(dragInitXy, subcharts, xaxis, calc); //only initially -> tool xy is changed by editing but dragInitXy isnt adjusted!
    if (selTools.length > 0) {
      const { subchartIdx, yaxisIdx, toolIdx, toolPtIdx } = selTools[0];
      const toolInitXy =
        subcharts[subchartIdx].yaxis[yaxisIdx].tools[toolIdx].xy[toolPtIdx];
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
      dragInitXy[0] >= 0 &&
      dragInitXy[0] < 0 + canvasWidth &&
      dragInitXy[1] >= 0 &&
      dragInitXy[1] < 0 + canvasHeight;
    if (isTranslateAction)
      return {
        type: "translate" as const,
        start: isDragStart,
        end: isDragEnd,
        shallUpdate: true,
      } as T.DragAction<"translate">;
    const isPointerScaleAction =
      dragInitXy[0] >= 0 &&
      dragInitXy[0] < 0 + canvasWidth &&
      dragInitXy[1] >= 0 + canvasHeight;
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

export const getAction = (
  PreState: T.ChartInteractions,
  subcharts: T.SubchartState[],
  isDrawing: boolean,
  xaxisHeight: number
): { action: T.Action; stateControl: T.ChartInteractions["stateControl"] } => {
  const { stateControl, pointer } = PreState;
  const {
    shallUpdate: interactiveUpdates,
    customEffectChartState,
    prevAction,
  } = stateControl;
  const xaxis = PreState.calc.xaxis;
  const finishDrawing = prevAction?.drag?.type === "drawTool" && !isDrawing;

  const wheelDeltaY = pointer.wheel?.delta[1];
  const isWheeling =
    !!pointer.wheel?.isWheeling &&
    interactiveUpdates.includes("wheel") &&
    !!wheelDeltaY;
  const wheel = isWheeling
    ? { wheelDeltaY, type: "wheelScale" as const }
    : null;
  const drag = getDragAction(PreState, subcharts, isDrawing, xaxisHeight);
  const containerResize =
    interactiveUpdates.includes("containerResize") && subcharts.length > 0;
  const pinch =
    !!prevAction?.pinch && PreState.pointer.pinch.isPinching
      ? prevAction.pinch
      : interactiveUpdates.includes("pinch") &&
        PreState.pointer.pinch.isPinching
      ? {
          type: "pinchScale" as const,
          initScaledWidthPerTick: xaxis.scaledWidthPerTick,
          initTranslatedX: xaxis.totalTranslatedX,
        }
      : null;
  const deps = interactiveUpdates.includes("deps");
  const updateEffect =
    (!pointer.drag.isDragging &&
      ["resizeSubchart", "editTool"].includes(drag?.type ?? "")) ||
    containerResize;
  const resetCustomDragActions =
    !pointer.drag.isDragging &&
    ["resizeSubchart", "editTool"].includes(drag?.type ?? "");

  const shallUpdateCalcSubcharts =
    (["scale", "translate"].includes(drag?.type ?? "") && drag?.shallUpdate) ||
    drag?.type === "resizeSubchart" ||
    containerResize ||
    deps ||
    !!wheel;
  const shallUpdateXaxis =
    (!!wheel ||
      deps ||
      !!pinch ||
      (drag?.shallUpdate &&
        (drag.type === "translate" || drag.type === "scale"))) ??
    false;
  const action = {
    drag,
    pinch,
    wheel,
    containerResize,
    deps,
    shallUpdateCalcSubcharts,
    shallUpdateXaxis,
  };
  return {
    action,
    stateControl: {
      ...stateControl,
      prevAction: {
        ...action,
        drag: resetCustomDragActions || finishDrawing ? null : drag,
      },
      customEffectChartState: updateEffect ? null : customEffectChartState,
    },
  };
};

export const resizeContainer = (
  newContainerHeight: number,
  subcharts: T.ChartState["subCharts"],
  style: T.ChartState["options"]
): T.ChartState["subCharts"] => {
  const newCanvasHeight = newContainerHeight - 1 - style.xaxis.heightXAxis;
  return resizeSubcharts({
    subchartsHeight: newCanvasHeight,
    subCharts: subcharts,
  });
};

export const resizeSubchart = (
  action: T.Action,
  subcharts: T.ChartState["subCharts"],
  drag: T.ChartState["pointer"]["drag"]
): T.ChartState["subCharts"] => {
  if (action?.drag?.type !== "resizeSubchart") return subcharts;
  const dragAction = action.drag as T.DragAction<"resizeSubchart">;
  const subchartIdx = dragAction.subchartIdx;
  const newBottom = Math.min(
    Math.max(
      dragAction.bottomInitY + drag.movementInitial[1],
      subcharts[subchartIdx].top + 10,
      subchartIdx === 0 ? 50 : 0
    ),
    subcharts[subchartIdx + 1].bottom - 10
  );
  const deltaBottom = newBottom - dragAction.bottomInitY;
  const result =
    !drag.ctrlKey || subchartIdx === 0
      ? [
          ...subcharts.slice(0, subchartIdx),
          { ...subcharts[subchartIdx], bottom: newBottom },
          { ...subcharts[subchartIdx + 1], top: newBottom },
          ...subcharts.slice(subchartIdx + 2),
        ]
      : [
          ...subcharts
            .slice(0, subchartIdx)
            .map((sub, sIdx) => ({ ...sub, bottom: sub.bottom + deltaBottom }))
            .map((sub, sIdx, arr) =>
              sIdx === 0 ? sub : { ...sub, top: arr[sIdx - 1].bottom }
            ),
          {
            ...subcharts[subchartIdx],
            bottom: newBottom,
            top: subcharts[subchartIdx].top + deltaBottom,
          },
          { ...subcharts[subchartIdx + 1], top: newBottom },
          ...subcharts.slice(subchartIdx + 2),
        ];
  return result;
};
