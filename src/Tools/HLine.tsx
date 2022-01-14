import React from "react";
import { Line, Circle } from "react-konva";
import { mdiSetLeft } from "@mdi/js";
import * as T from "../Types";

export type CHLineProps = {
  subcharts: T.ChartState["subcharts"];
  subchartIdx: number;
  xy: [number, number][];
  drawPixXy?: [number, number][];
  style: T.ToolState["style"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  containerSize: T.ChartState["containerSize"];
  mode?: "extendRight" | "extendLeft" | "extendLeftRight" | "*extendToSecondPoint";
};

const CHLineComponent = (props: CHLineProps) => {
  const {
    style,
    subcharts,
    subchartIdx,
    containerSize,
    calcXaxis,
    mode,
    xy: toolXy,
    drawPixXy,
    yToPix,
    // pixToY,
    // calcSubcharts,
  } = props;

  const { left: startPixX, width } = containerSize;
  const endPixX = startPixX + width;
  const { bottom, top } = subcharts[subchartIdx];

  const isDrawing = !!drawPixXy?.[0];
  if ((toolXy.length !== 1 && !isDrawing) || !yToPix || !calcXaxis.xToPix) return null;
  const PixXy =
    toolXy.length === 1
      ? [calcXaxis.xToPix(toolXy[0][0]), yToPix(toolXy[0][1], subchartIdx, 0)] // multiple yaxis
      : drawPixXy?.[0]
      ? drawPixXy[0]
      : null;

  if (!PixXy) return null;
  if (PixXy?.[1] < top || PixXy?.[1] > bottom) return null;

  const strokeColor = style?.strokeColor ? style.strokeColor : "red";
  const anchorColor = style?.anchorColor ? style.anchorColor : "#333";
  const modeInt = ["extendRight", "extendLeft", "extendLeftRight", "*extendToSecondPoint"].includes(mode ?? "")
    ? mode
    : "extendLeftRight";
  const pixXyAdjusted: [number, number][] = [
    [modeInt === "extendRight" ? PixXy[0] : startPixX, PixXy[1]],
    [modeInt === "extendLeft" ? PixXy[0] : endPixX, PixXy[1]],
  ];

  return (
    <React.Fragment>
      <Line
        listening={false}
        x={0}
        y={0}
        points={[pixXyAdjusted[0][0], pixXyAdjusted[0][1], pixXyAdjusted[1][0], pixXyAdjusted[1][1]]}
        stroke={strokeColor}
        strokeWidth={1}
      />
      <Circle x={PixXy[0]} y={pixXyAdjusted[0][1]} radius={5} fill={anchorColor} />
    </React.Fragment>
  );
};
export const CHLine = React.memo(CHLineComponent);

export const HLine: T.ToolModel = {
  name: "Horizontal Line",
  type: "hline",
  nPoints: 1,
  category: "lines",
  params: [
    {
      name: "mode",
      val: "extendLeftRight",
      vals: ["extendRight", "extendLeft", "extendLeftRight"], //, "*extendToSecondPoint"],
      type: "select" as const,
    },
  ],
  default: { params: [{ icon: mdiSetLeft }] },
  component: CHLine,
};
export default HLine;
