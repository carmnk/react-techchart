import React from "react";
import { Line } from "react-konva";
import * as T from "../Types";
import { CText } from "./CText";

export type YaxisProps = {
  subcharts: T.ChartState["subcharts"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  theme: T.ChartState["theme"];
  containerSize: T.ChartState["containerSize"];
};
export const YaxisComponent = (props: YaxisProps) => {
  const { subcharts, calcSubcharts, theme, containerSize } = props;
  const { widthTickmarkLines } = theme.yaxis;

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
                  x={containerSize.width - 1 + 0.5 - theme.yaxis.widthTickmarkLines} //- widthYAxis
                  y={yaxisTick.pixY + 0.5}
                  points={[0, 0, widthTickmarkLines, 0]}
                  stroke={theme.yaxis.strokeColor}
                  strokeWidth={1}
                />
                {theme.grid.useGridY ? (
                  <Line
                    name={`y-gridline-${yaxisTickIdx}`}
                    listening={false}
                    x={0 + 0.5}
                    y={yaxisTick.pixY + 0.5}
                    points={[0, 0, containerSize.width - 1 + 0.5, 0]}
                    stroke={theme.grid.strokeColor}
                    strokeWidth={1}
                  />
                ) : null}
                <CText
                  text={yaxisTick.label}
                  halign="right"
                  valign="middle"
                  fontColor={theme.yaxis.fontColor}
                  fontName={theme.yaxis.fontName}
                  fontSize={theme.yaxis.fontSize}
                  x={containerSize.width - 1 - theme.yaxis.widthTickmarkLines + 0.5}
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
