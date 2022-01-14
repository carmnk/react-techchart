import React from "react";
import * as T from "../Types";
import { isNullish } from "../utils/Basics";
import { defaultTools } from "./DefaultTools";

export type DrawToolProps = {
  subcharts: T.ChartState["subcharts"];
  containerSize: T.ChartState["containerSize"];
  draw: T.ChartState["draw"];
  // pointer: T.ChartState["pointer"];
  calc: T.ChartState["calc"];
  drawTheme: T.ChartState["theme"]["draw"];
};

export const DrawTool = (props: DrawToolProps) => {
  const { subcharts, draw, calc, containerSize, drawTheme } = props;
  const { pointer: calcPointer, subcharts: calcSubcharts, xaxis: calcXaxis, yToPix, pixToY } = calc;
  const { xToPix } = calcXaxis;

  const drawElementType = (draw.isDrawing && draw.type) || null;
  const drawElementModel = defaultTools.find((defTool) => defTool.type === drawElementType);
  const DrawTool = drawElementModel?.component;
  const additionalDrawToolProps: { [key: string]: any } = {};
  drawElementModel?.params?.forEach((param: any) => {
    additionalDrawToolProps[param.name] = param.val;
  });
  //   const calc = ChartState.calc;

  const pixYSnap = calcPointer?.move.snapDatasets?.[0]?.pixYSnap;
  const subchartIdx = calcPointer.move.subchartIdx;
  const drawPixXy: [number, number][] = React.useMemo(
    () =>
      !isNullish(subchartIdx)
        ? [
            ...draw.xy.map((xy) =>
              xToPix && yToPix ? ([xToPix(xy[0]), yToPix(xy[1], subchartIdx, 0)] as [number, number]) : xy
            ),
            [
              calcPointer.move.x && xToPix ? xToPix?.(calcPointer.move.x) : calcPointer.move.pixX, //pointer.move.xy[0],
              pixYSnap ? pixYSnap : calcPointer.move.pixY,
            ],
          ]
        : [],
    [calcPointer.move.x, draw.xy, pixYSnap, calcPointer.move.pixX, calcPointer.move.pixY, subchartIdx, xToPix, yToPix]
  );

  return (
    (draw.isDrawing && DrawTool && !isNullish(subchartIdx) && (
      <DrawTool
        subcharts={subcharts}
        subchartIdx={subchartIdx}
        xy={draw.xy}
        drawPixXy={drawPixXy}
        containerSize={containerSize}
        calcXaxis={calcXaxis}
        calcSubcharts={calcSubcharts}
        yToPix={yToPix}
        pixToY={pixToY}
        style={drawTheme}
        {...additionalDrawToolProps}
      />
    )) ||
    null
  );
};
