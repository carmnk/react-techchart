import React from "react";
import { Circle, Line } from "react-konva";
import { mdiSetLeft } from "@mdi/js";
import * as T from "../Types";

export type CVLineProps = {
  subcharts: T.ChartState["subcharts"];
  subchartIdx: number;
  xy: [number, number][];
  drawPixXy?: [number, number][];
  style: T.ToolState["style"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  mode?: "extendUp" | "extendDown" | "extendUpDown" | "*extendToSecondPoint";
};

export const CVLineComponent = (props: CVLineProps) => {
  const { style, subcharts, subchartIdx, mode, calcXaxis, xy: toolXy, drawPixXy, yToPix } = props;
  const { top: subchartTop } = subcharts[subchartIdx];
  const isDrawing = !!drawPixXy?.[0];

  if ((toolXy.length !== 1 && !isDrawing) || !yToPix || !calcXaxis.xToPix) return null;
  const PixXy =
    toolXy.length === 1
      ? [calcXaxis.xToPix(toolXy[0][0]), yToPix(toolXy[0][1], subchartIdx, 0)]
      : drawPixXy?.[0]
      ? drawPixXy[0]
      : null;
  if (!PixXy) return null;

  const strokeColor = style?.strokeColor ? style.strokeColor : "red";
  const anchorColor = style?.anchorColor ? style.anchorColor : "#333";
  const modeInt = ["extendUp", "extendDown", "extendUpDown", "*extendToSecondPoint"].includes(mode ?? "")
    ? mode
    : "extendUpDown";
  const lowestBottom = subcharts?.[Math.max(subcharts.length - 1, 0)]?.bottom;
  // if vline should end at current subchart -> use subchartBottom instead of lowestBottom -> maybe mode?
  const pixXyAdjusted: [number, number][] = [
    [PixXy[0], modeInt === "extendDown" ? PixXy[1] : subchartTop],
    [PixXy[0], modeInt === "extendUp" ? PixXy[1] : lowestBottom],
  ];

  return (
    <React.Fragment>
      <Line listening={false} x={0} y={0} points={pixXyAdjusted.flat()} stroke={strokeColor} strokeWidth={1} />
      <Circle x={PixXy[0]} y={PixXy[1]} radius={5} fill={anchorColor} />
    </React.Fragment>
  );
};

export const CVLine = React.memo(CVLineComponent);

export const VLine: T.ToolModel = {
  name: "Vertical Line",
  type: "vline",
  nPoints: 1,
  category: "lines",
  params: [
    {
      name: "mode",
      val: "extendUpDown",
      vals: ["extendUp", "extendDown", "extendUpDown"], // "*extendToSecondPoint"],
      type: "select",
    },
  ],
  default: { params: [{ icon: mdiSetLeft }] },
  component: CVLine,
};
