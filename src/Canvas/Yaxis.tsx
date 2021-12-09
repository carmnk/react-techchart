import React from "react";
import { Line } from "react-konva";
import * as T from "../Types";
import { CText } from "./CText";

export type YaxisProps = {
  subcharts: T.ChartState["subCharts"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  style: T.ChartState["options"];
  containerSize: T.ChartState["containerSize"];
};
export const YaxisComponent = (props: YaxisProps) => {
  const { subcharts, calcSubcharts, style, containerSize } = props;
  const { widthTickmarkLines } = style.yaxis;

  // console.log("Yaxis renders")
  return (
    <React.Fragment>
      {subcharts.map((subchart, subchartIdx) => {
        return subchart.yaxis.map((singleYaxis, yIdx) => {
          const calcYaxis = calcSubcharts?.[subchartIdx]?.yaxis?.[yIdx];
          const yAxisTicks = calcYaxis?.drawTicks ?? [];
          return yAxisTicks.map((yaxisTick, yaxisTickIdx) => {
            return (
              <React.Fragment key={`yaxis-ticks-${yaxisTickIdx}`}>
                <Line
                  name={`y-tickmark-${yaxisTickIdx}`}
                  listening={false}
                  x={containerSize.width - 1 + 0.5 - style.yaxis.widthTickmarkLines} //- widthYAxis
                  y={yaxisTick.pixY + 0.5}
                  points={[0, 0, widthTickmarkLines, 0]}
                  stroke={style.yaxis.strokeColor}
                  strokeWidth={1}
                />
                {style.grid.useGridY ? (
                  <Line
                    name={`y-gridline-${yaxisTickIdx}`}
                    listening={false}
                    x={0 + 0.5}
                    y={yaxisTick.pixY + 0.5}
                    points={[0, 0, containerSize.width - 1 + 0.5, 0]}
                    stroke={style.grid.strokeColor}
                    strokeWidth={1}
                  />
                ) : null}
                <CText
                  text={yaxisTick.label}
                  halign="right"
                  valign="middle"
                  fontColor={style.yaxis.fontColor}
                  fontName={style.yaxis.fontName}
                  fontSize={style.yaxis.fontSize}
                  x={containerSize.width - 1 - style.yaxis.widthTickmarkLines + 0.5}
                  y={yaxisTick.pixY}
                />
              </React.Fragment>
            );
          });
        });
      })}
    </React.Fragment>
  );
};

export const Yaxis = React.memo(YaxisComponent);
