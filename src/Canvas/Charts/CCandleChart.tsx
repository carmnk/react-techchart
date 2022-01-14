import React from "react";
import { Line, Rect } from "react-konva";
import * as T from "../../Types";

export type CCandleChartProps = {
  subcharts: T.ChartState["subcharts"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  subchartIdx?: number;
  yaxisIdx?: number;
  graphIdx?: number;
  rtTicks?: T.PixDataset[];
};

export const CCandleChartComponent = (props: CCandleChartProps) => {
  const { subcharts, calcXaxis, calcSubcharts, subchartIdx = 0, yaxisIdx = 0, graphIdx = 0, rtTicks } = props;
  const yaxis = subcharts?.[subchartIdx]?.yaxis?.[yaxisIdx];
  const graph = yaxis?.graphs[graphIdx];
  const graphCalc = calcSubcharts?.[subchartIdx]?.yaxis?.[yaxisIdx]?.graphs?.[graphIdx];
  const curTicks = React.useMemo(
    () => (rtTicks ? rtTicks.slice(1) : graphCalc?.curTicks ? graphCalc.curTicks : []),
    [graphCalc?.curTicks, rtTicks]
  );
  const dxHalfCandle = React.useMemo(
    () => (calcXaxis?.scaledWidthPerTick > 2 ? Math.floor(0.35 * (calcXaxis.scaledWidthPerTick - 1)) : 0),
    [calcXaxis.scaledWidthPerTick]
  );
  if (!graph || !T.isChartGraph(graph) || !curTicks) return null;

  return (
    <React.Fragment>
      {curTicks.map((pixDataset, tIdx) => {
        const xPix = pixDataset.pixX + calcXaxis.pixXStart;
        if (!T.isCandleChartPixDataset(pixDataset)) return null;
        const pixY = pixDataset.pixY;
        const { pixOpen, pixHigh, pixLow, pixClose } = pixY;
        const maxWidth = dxHalfCandle * 2;

        return (
          <React.Fragment key={`candle-${tIdx}`}>
            <Line // candle wick
              listening={false}
              x={0}
              y={0}
              points={[xPix + 0.5, pixHigh + 0.5, xPix + 0.5, pixLow + 0.5]}
              stroke={graph.style.candleWickStrokeColor}
              strokeWidth={1}
            />
            {pixClose !== pixOpen ? (
              dxHalfCandle !== 0 ? (
                <Rect // candle body
                  listening={false}
                  draggable={false}
                  x={xPix + 0.5 - dxHalfCandle}
                  y={pixOpen + 0.5}
                  width={maxWidth}
                  height={pixClose - pixOpen}
                  stroke={graph.style.candleStrokeColor}
                  fill={pixClose < pixOpen ? graph.style.candleUpColor : graph.style.candleDownColor}
                  strokeWidth={1}
                />
              ) : (
                <Line // candle body - if dxHalfcandle === 0, only redraw candle wick from open to close in resp. colors
                  listening={false}
                  draggable={false}
                  x={0}
                  y={0}
                  points={[xPix + 0.5, pixOpen + 0.5, xPix + 0.5, pixClose + 0.5]}
                  stroke={pixClose < pixOpen ? graph.style.candleUpColor : graph.style.candleDownColor}
                  strokeWidth={1}
                />
              )
            ) : (
              <Line // candle body - if open = close -> horizontal line
                listening={false}
                draggable={false}
                x={0}
                y={0}
                points={[xPix + 0.5 - dxHalfCandle, pixClose + 0.5, xPix + 0.5 + dxHalfCandle, pixClose + 0.5]}
                stroke={graph.style.candleStrokeColor}
                strokeWidth={1}
              />
            )}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export const CCandleChart = React.memo(CCandleChartComponent);
