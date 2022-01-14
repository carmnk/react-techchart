import React from "react";
import dequal from "lodash/isEqual";
import { Circle, Line } from "react-konva";
import { mdiSetLeft } from "@mdi/js";
import * as T from "../Types";

export type CTrendlineProps = {
  subcharts: T.ChartState["subcharts"];
  subchartIdx: number;
  // yaxisIdx: number;
  // toolIdx: number;
  xy: [number, number][];
  drawPixXy?: [number, number][];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  style: T.ToolState["style"];
  mode?: "line" | "trendline" | "infiniteLine";
};

export const CTrendlineComponent = (props: CTrendlineProps) => {
  const { style, mode, subcharts, subchartIdx, calcXaxis, xy: toolXy, drawPixXy, yToPix: yToPixGen } = props;
  // const { xaxis } = calc;
  const { bottom: subchartBottom, top: subchartTop } = subcharts[subchartIdx];

  if ((toolXy.length !== 2 && drawPixXy?.length !== 2) || !yToPixGen || !calcXaxis.xToPix) return null;
  const xToPix = calcXaxis.xToPix;
  const yToPix = (y: number) => yToPixGen(y, subchartIdx, 0);

  const PixXy =
    toolXy.length === 2
      ? toolXy.map((xy) => [xToPix(xy[0]), yToPix(xy[1])])
      : drawPixXy?.length === 2
      ? drawPixXy
      : null;
  if (!PixXy || PixXy.length !== 2) return null;
  const strokeColor = style?.strokeColor ? style.strokeColor : "red";
  const anchorColor = style?.anchorColor ? style.anchorColor : "#333";
  const modeInt = ["line", "trendline", "infiniteLine"].includes(mode ?? "") ? mode : "trendline";
  const sortedPixXy = PixXy[0][0] > PixXy[1][0] ? [PixXy[1], PixXy[0]] : PixXy;
  const adjustedPixXy = [[...sortedPixXy[0]], [...sortedPixXy[1]]];

  if ((modeInt === "trendline" || mode === "infiniteLine") && !dequal(adjustedPixXy[0], adjustedPixXy[1])) {
    const dx = adjustedPixXy[1][0] - adjustedPixXy[0][0];
    const dy = adjustedPixXy[1][1] - adjustedPixXy[0][1];
    const slope = dy / dx;
    const pixYTarget = dy < 0 ? subchartTop : subchartBottom;
    const b = adjustedPixXy[0][1] - slope * adjustedPixXy[0][0];
    const pixXTarget = (pixYTarget - b) / slope;
    adjustedPixXy[1][0] = pixXTarget;
    adjustedPixXy[1][1] = pixYTarget;
    if (mode === "infiniteLine") {
      const pixYSrc = dy < 0 ? subchartBottom : subchartTop;
      const pixXSrc = (pixYSrc - b) / slope;
      adjustedPixXy[0][0] = pixXSrc;
      adjustedPixXy[0][1] = pixYSrc;
    }
  }
  return (
    <React.Fragment>
      <Line
        listening={false}
        draggable={false}
        x={0}
        y={0}
        points={adjustedPixXy.flat()}
        stroke={strokeColor}
        strokeWidth={1}
      />
      <Circle x={sortedPixXy[0][0]} y={sortedPixXy[0][1]} radius={5} fill={anchorColor} />
      <Circle x={sortedPixXy[1][0]} y={sortedPixXy[1][1]} radius={5} fill={anchorColor} />
    </React.Fragment>
  );
};

export const CTrendline = React.memo(CTrendlineComponent);

export const TrendLine: T.ToolModel = {
  name: "Trendline",
  type: "trendline",
  nPoints: 2,
  category: "lines",
  params: [{ name: "mode", val: "trendline", vals: ["line", "trendline", "infiniteLine"], type: "select" }],
  default: { params: [{ icon: mdiSetLeft }] },
  component: CTrendline,
};
export default TrendLine;
