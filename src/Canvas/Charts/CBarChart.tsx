import React from "react";
import { Line } from "react-konva";
import * as T from "../../Types";
// import { useReactiveInfo2 } from "../../utils/React";

export type CBarChartProps = {
  subCharts: T.ChartState["subCharts"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  // yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  // pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
  indSeriesIdx?: number;
  rtTicks?: T.PixDataset[];
};
export const CBarChartComponent = (props: CBarChartProps) => {
  const { subCharts, subchartIdx, yaxisIdx, graphIdx, calcXaxis, calcSubcharts, indSeriesIdx, rtTicks } = props;
  // const { xaxis } = calc;
  const graph = subCharts[subchartIdx].yaxis[yaxisIdx].graphs[graphIdx];
  const calcYaxis = calcSubcharts?.[subchartIdx]?.yaxis?.[yaxisIdx];
  const calcGraph = calcYaxis?.graphs?.[graphIdx];
  const curTicks = React.useMemo(
    () => (rtTicks ? rtTicks : calcGraph?.curTicks ? calcGraph.curTicks : []),
    [calcGraph?.curTicks, rtTicks]
  );

  // console.log(curTicks, curTicks.length);
  // const info = useReactiveInfo2([subCharts, calcXaxis, calcSubcharts, subchartIdx, yaxisIdx, graphIdx]);
  if (!curTicks || curTicks.length === 0) return null;

  // console.log("barchart renders", info);
  return (
    <React.Fragment>
      {curTicks
        .map((pixDataset, tIdx) => {
          if (!T.isIndicatorPixDataset(pixDataset)) return null;
          const pixY = pixDataset.pixY;
          const yPix0 = calcYaxis?.pixY0;
          const yPix1 = pixY?.pixPrices[indSeriesIdx ?? 0] ?? yPix0;
          const xPix = pixDataset.pixX + calcXaxis.pixXStart;
          return (
            <Line
              key={`barchart-${subchartIdx}-${yaxisIdx}-${graphIdx}-line-${tIdx}`}
              points={[xPix + 0.5, yPix0 + 0.5, xPix + 0.5, yPix1 + 0.5]}
              listening={false}
              x={0}
              y={0}
              stroke={T.isIndicatorGraph(graph) ? graph.style.strokeColor[indSeriesIdx ?? 0] : graph.style.strokeColor}
              strokeWidth={1}
            />
          );
        })
        .filter((val) => val !== null)}
    </React.Fragment>
  );
};

export const CBarChart =  React.memo(CBarChartComponent);
