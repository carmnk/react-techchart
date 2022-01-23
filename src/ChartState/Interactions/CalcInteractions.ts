import { resizeSubcharts } from "../Factory/SubchartFactory";
import { setStateProp, addStateProp } from "../../utils/React";
import { defaultTools } from "../../Tools/DefaultTools";
import { getSubchartIdxByPixXy, purePixToX, purePixToY } from "../utils/Utils";
import { defaultDrawState } from "../Defaults";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";

export const resizeContainer = (newContainerHeight: number, ChartState: T.ChartState): T.ChartState["subcharts"] => {
  const { subcharts, theme } = ChartState;
  const newCanvasHeight = newContainerHeight - 1 - theme.xaxis.heightXAxis;
  return resizeSubcharts({
    subchartsHeight: newCanvasHeight,
    subcharts,
  });
};

export const resizeSubchart = (
  action: T.Action,
  subcharts: T.ChartState["subcharts"],
  drag: T.PointerState["drag"]
): T.ChartState["subcharts"] => {
  if (action?.pointer?.type !== "resizeSubchart") return subcharts;
  const dragAction = action.pointer as T.DragAction<"resizeSubchart">;
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
            .map((sub) => ({ ...sub, bottom: sub.bottom + deltaBottom }))
            .map((sub, sIdx, arr) => (sIdx === 0 ? sub : { ...sub, top: arr[sIdx - 1].bottom })),
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

export const editToolPosition = (
  Interactions: T.ChartInteractions,
  calc: T.ChartState["calc"],
  subcharts: T.ChartState["subcharts"],
  action: T.Action
): T.ChartState["subcharts"] => {
  const actionDrag = action?.pointer as T.DragAction<"editTool">;
  if (actionDrag?.type !== "editTool") return subcharts;
  const pointer = Interactions.pointer;
  const { subchartIdx, yaxisIdx } = actionDrag;
  const subchart = subcharts[subchartIdx];
  const { subcharts: calcSubcharts, pointer: calcPointer } = calc;
  const calcYaxis = calcSubcharts[subchartIdx].yaxis[yaxisIdx];
  const hasSnappedY = calcPointer.move.snapDatasets.length > 0 && !!calcPointer.move.snapDatasets[0].ySnap;
  const newX = calcPointer.move.x ?? calcPointer.move.xUnlimited;
  const newY = hasSnappedY
    ? parseFloat(calcPointer.move.snapDatasets[0].ySnap ?? "")
    : purePixToY(pointer.drag.xy[1], subchart.bottom, calcYaxis.decimals, calcYaxis.translatedY, calcYaxis.heightPerPt);
  const { toolIdx, toolPtIdx } = actionDrag;
  return setStateProp(subcharts, [subchartIdx, "yaxis", yaxisIdx, "tools", toolIdx, "xy", toolPtIdx], [newX, newY]);
};

const addToolAnchor = (
  drawToolType: "hline" | "vline" | "trendline" | undefined,
  draw: T.ChartState["draw"],
  xy: [number, number]
): T.ChartState["draw"] => {
  if (!drawToolType || !draw || !xy) return defaultDrawState;
  return { ...draw, xy: [...draw.xy, xy] };
};

const addTool = (
  subcharts: T.ChartState["subcharts"],
  subchartIdx: number,
  draw: T.ChartState["draw"],
  theme: T.ChartState["theme"]
): T.ChartState["subcharts"] => {
  const xy = draw.xy;
  const params = defaultTools.find((val) => val.type === draw.type)?.params ?? [];
  return addStateProp(subcharts, [subchartIdx, "yaxis", 0, "tools"], {
    xy: xy,
    type: draw.type,
    style: theme.draw,
    params,
  });
};

export const drawTool = (
  Interactions: T.ChartInteractions,
  calc: T.ChartState["calc"],
  ChartState: T.ChartState
): { subcharts: T.ChartState["subcharts"]; draw: T.ChartState["draw"] } => {
  const { draw, theme, subcharts } = ChartState;
  const dragEnd = Interactions.pointer.dragPointerUp;
  if (!dragEnd.isDragPointerUp) return { subcharts, draw };
  const drag = Interactions.pointer.drag;
  const nPoints = defaultTools.find((tool) => tool.type === draw.type)?.nPoints;
  const subchartIdx = getSubchartIdxByPixXy(drag.initial, subcharts);
  if (!draw.type || !nPoints || isNullish(subchartIdx)) return { draw: defaultDrawState, subcharts };
  const { subcharts: calcSubcharts, pointer: calcPointer, xaxis } = calc;
  const subchart = calcSubcharts?.[subchartIdx];
  const yaxis = subchart?.yaxis?.[0];
  if (!subchart || !yaxis) return { draw: defaultDrawState, subcharts };
  const pixX = calcPointer.move.pixXSnap ? calcPointer.move.pixXSnap : drag.xy[0];
  const pixY =
    calcPointer.move.snapDatasets.length > 0 && !!calcPointer.move.snapDatasets[0].pixYSnap
      ? calcPointer.move.snapDatasets[0].pixYSnap
      : drag.xy[1];
  const x = purePixToX(pixX, xaxis.totalTranslatedX, xaxis.scaledWidthPerTick);
  const { decimals, translatedY, heightPerPt } = yaxis;
  const y = purePixToY(pixY, subcharts[subchartIdx].bottom, decimals, translatedY, heightPerPt);
  const nDrawnPoint = draw.xy.length;
  return nDrawnPoint < nPoints - 1
    ? { draw: addToolAnchor(draw.type, draw, [x, y]), subcharts }
    : {
        draw: defaultDrawState,
        subcharts: addTool(subcharts, subchartIdx, addToolAnchor(draw.type, draw, [x, y]), theme),
      };
};

export const startDrawing = (current: T.ChartState, params: T.ReducerAction<"startDrawing">["params"]) => {
  const { type } = params;
  const nPoints = defaultTools.find((tool) => tool.type === type)?.nPoints;
  if (!nPoints || !type) {
    return { ...current, draw: defaultDrawState };
  } else {
    return {
      ...current,
      draw: { ...current.draw, isDrawing: true, xy: [], type: type },
    };
  }
};
