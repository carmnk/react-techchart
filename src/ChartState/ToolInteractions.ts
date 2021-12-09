import { setStateProp, addStateProp } from "../utils/React";
import * as T from "../Types";
import { defaultTools } from "../Tools/DefaultTools";
import { getSubchartIdxByPixXy, purePixToX, purePixToY } from "./utils/Utils";
import { defaultDrawState } from "./Defaults";
import { isNullish } from "../utils/Basics";

export const editToolPosition = (
  PreState: T.ChartInteractions,
  subcharts: T.ChartState["subCharts"],
  action: T.Action
): T.ChartState["subCharts"] => {
  const pointer = PreState.pointer;
  const calc = PreState.calc;
  const calcPointer = calc.pointer;
  if (action?.drag?.type !== "editTool") return subcharts;
  const actionDrag = action?.drag as T.DragAction<"editTool">;
  const { subchartIdx, yaxisIdx } = actionDrag;
  const subchart = subcharts[subchartIdx];
  const calcYaxis = calc.subcharts[subchartIdx].yaxis[yaxisIdx];
  const hasSnappedY = calcPointer.move.snapDatasets.length > 0 && !!calcPointer.move.snapDatasets[0].ySnap;
  const newX = calcPointer.move.x ?? calcPointer.move.xUnlimited;
  const newY = hasSnappedY
    ? parseFloat(calcPointer.move.snapDatasets![0]!.ySnap ?? "")
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
  subcharts: T.ChartState["subCharts"],
  subchartIdx: number,
  draw: T.ChartState["draw"],
  style: T.ChartState["options"]
): T.ChartState["subCharts"] => {
  const xy = draw.xy;
  const params = defaultTools.find((val) => val.type === draw.type)?.params ?? [];
  return addStateProp(subcharts, [subchartIdx, "yaxis", 0, "tools"], {
    xy: xy,
    type: draw.type,
    style: style.draw,
    params,
  });
};

export const drawTool = (
  PreState: T.ChartInteractions,
  subcharts: T.ChartState["subCharts"],
  draw: T.ChartState["draw"],
  style: T.ChartState["options"]
): { subcharts: T.ChartState["subCharts"]; draw: T.ChartState["draw"] } => {
  const DragEndState = PreState.pointer.dragPointerUp;
  if (!DragEndState.isDragPointerUp) return { subcharts, draw };
  const calc = PreState.calc;
  const { pointer: calcPointer, xaxis } = calc;
  const pointer = PreState.pointer;
  const drawElementType = draw.type;
  const nPoints = defaultTools.find((tool) => tool.type === drawElementType)?.nPoints;
  const subchartIdx = getSubchartIdxByPixXy(pointer.drag.initial, subcharts);
  if (!drawElementType || !nPoints || isNullish(subchartIdx)) return { draw: defaultDrawState, subcharts };
  const subchart = calc.subcharts?.[subchartIdx];
  const yaxis = subchart?.yaxis?.[0];
  if (!subchart || !yaxis) return { draw: defaultDrawState, subcharts };
  const pixX = calcPointer.move.pixXSnap ? calcPointer.move.pixXSnap : pointer.drag.xy[0];
  const pixY =
    calcPointer.move.snapDatasets.length > 0 && !!calcPointer.move.snapDatasets[0].pixYSnap
      ? calcPointer.move.snapDatasets[0].pixYSnap
      : pointer.drag.xy[1]; //not better move?
  const x = purePixToX(pixX, xaxis.totalTranslatedX, xaxis.scaledWidthPerTick);
  const { decimals, translatedY, heightPerPt } = yaxis;
  const y = purePixToY(pixY, subcharts[subchartIdx].bottom, decimals, translatedY, heightPerPt);
  const nDrawnPoint = draw.xy.length;
  return nDrawnPoint < nPoints - 1
    ? { draw: addToolAnchor(draw.type, draw, [x, y]), subcharts }
    : {
        draw: defaultDrawState,
        subcharts: addTool(subcharts, subchartIdx, addToolAnchor(draw.type, draw, [x, y]), style),
      };
};
