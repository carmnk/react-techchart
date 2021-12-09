import React from "react";
import { Line } from "react-konva";
import * as T from "../Types";
import { CText } from "./CText";

export type XaxisProps = {
  calcXaxis: T.ChartState["calc"]["xaxis"];
  style: T.ChartState["options"];
  containerSize: T.ChartState["containerSize"];
};

export const XaxisComponent = (props: XaxisProps) => {
  const { calcXaxis, style, containerSize } = props;
  const { heightXAxis, heightTickMarkLines } = style.xaxis;

  // console.log("Xaxis renders");
  return (
    <React.Fragment>
      {calcXaxis.curTicks.map((xaxisTick, xaxisTickIdx) => {
        return (
          <React.Fragment key={`xaxis-ticks-${xaxisTickIdx}`}>
            <Line
              name={`x-tickmark-${xaxisTickIdx}`}
              listening={false}
              x={xaxisTick.x}
              y={containerSize.height - 1 - heightXAxis + 0.5}
              points={[0, 0, 0, heightTickMarkLines]}
              stroke={style.xaxis.strokeColor}
              strokeWidth={1}
            />
            {style.grid.useGridX ? (
              <Line
                name={`x-gridline-${xaxisTickIdx}`}
                listening={false}
                x={xaxisTick.x}
                y={0 + 0.5}
                points={[0, 0, 0, containerSize.height - 1 - heightXAxis + 0.5]}
                stroke={style.grid.strokeColor}
                strokeWidth={1}
              />
            ) : null}
            <CText
              text={xaxisTick.dateString}
              halign="center"
              valign="top"
              fontColor={style.xaxis.fontColor}
              fontName={style.xaxis.fontName}
              fontSize={style.xaxis.fontSize}
              x={xaxisTick.x + 0.5}
              y={containerSize.height - 1 - heightXAxis + heightTickMarkLines + 0.5 + 8} // additional 5px distance to end of tickmark
            />
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export const Xaxis = React.memo(XaxisComponent);
