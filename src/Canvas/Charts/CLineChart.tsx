import React from "react";
import { Line } from "react-konva";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";
// import { useReactiveInfo2 } from "../../utils/React";

export type CLineChartProps = {
  subCharts: T.ChartState["subCharts"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
  indSeriesIdx?: number;
  areaTresholds?: { lower: number; upper: number };
  rtTicks?: T.PixDataset[];
};

export const CLineChartComponent = (props: CLineChartProps) => {
  const {
    subCharts,
    subchartIdx,
    yaxisIdx,
    graphIdx,
    indSeriesIdx = 0,
    calcXaxis,
    calcSubcharts,
    // yToPix,
    // areaTresholds,
    rtTicks,
  } = props;
  // const { xaxis } = calc;

  const graph = subCharts[subchartIdx].yaxis[yaxisIdx].graphs[graphIdx];
  const calcGraph = calcSubcharts?.[subchartIdx]?.yaxis?.[yaxisIdx]?.graphs?.[graphIdx];
  const curTicks = rtTicks ? rtTicks : calcGraph?.curTicks;
  const graphVals: number[] = curTicks
    ? (curTicks
        .map((pixDataset) => {
          if (!pixDataset.pixY) return null;
          const pixPrice = T.isIndicatorPixDataset(pixDataset)
            ? pixDataset.pixY.pixPrices?.[indSeriesIdx]
            : T.isLineChartPixDataset(pixDataset)
            ? pixDataset.pixY.pixClose
            : null;
          if (isNullish(pixPrice)) return null;
          return [pixDataset.pixX, pixPrice];
        })
        .flat()
        .filter((val) => val !== null) as number[])
    : [];

  // console.log("indIDx", indSeriesIdx, "CT", curTicks, "GV", graphVals);

  // const pixUpperTresh = areaTresholds && yToPix && yToPix(areaTresholds.upper, subchartIdx, yaxisIdx);
  // const pixLwrTresh = areaTresholds && yToPix && yToPix(areaTresholds.lower, subchartIdx, yaxisIdx);
  // const getAreaVals = (tresh: number, isUpper: boolean) => {
  //   const sgn = isUpper ? 1 : -1;
  //   return calcGraph?.curData
  //     ? [
  //         0,
  //         yToPix?.(tresh, subchartIdx, yaxisIdx) ?? 0,
  //         ...(calcGraph.curData
  //           .map((dataset, dIdx) => {
  //             const tick = calcGraph?.curTicks?.[dIdx];
  //             const tickPixY = tick?.pixY;
  //             if (!tick || !tickPixY) return null;
  //             const lastDataset = calcGraph?.curData?.[dIdx - 1];

  //             return T.isLineChartDataset(dataset) && dataset.close > 0 && "pixClose" in tickPixY
  //               ? [tick.pixX, tickPixY.pixClose]
  //               : T.isIndicatorDataset(dataset) && "pixPrices" in tickPixY
  //               ? (() => {
  //                   const price = dataset.prices?.[indSeriesIdx];
  //                   const pixYPrice = tickPixY.pixPrices?.[indSeriesIdx];
  //                   if (isNullish(price) || isNullish(pixYPrice)) return null;

  //                   const y0 =
  //                     lastDataset && T.isIndicatorDataset(lastDataset) ? lastDataset?.prices?.[indSeriesIdx] : null;
  //                   const y1 = dataset.prices?.[indSeriesIdx];
  //                   if (
  //                     price * sgn > tresh * sgn &&
  //                     (!lastDataset ||
  //                       (lastDataset && T.isIndicatorDataset(lastDataset) && y0 && y0 * sgn > tresh * sgn))
  //                   ) {
  //                     return [tick.pixX, pixYPrice];
  //                   }
  //                   if (lastDataset && T.isIndicatorDataset(lastDataset)) {
  //                     if (isNullish(y0) || isNullish(y1)) return null;
  //                     const a = y1 - y0;
  //                     const b = y0;
  //                     const x1ex = (tresh - b) / a;
  //                     const price = dataset.prices?.[indSeriesIdx];
  //                     if (!price || !x1ex || isNaN(x1ex) || !isFinite(x1ex)) return null;

  //                     if (Math.abs(x1ex) > 1) return null;

  //                     return price * sgn <= tresh * sgn && y0 * sgn > tresh * sgn
  //                       ? [
  //                           tick.pixX + (x1ex - 1) * calcXaxis.scaledWidthPerTick,
  //                           yToPix?.(tresh, subchartIdx, yaxisIdx),
  //                           tick.pixX,
  //                           yToPix?.(tresh, subchartIdx, yaxisIdx), //pixYPrice,
  //                         ]
  //                       : price * sgn > tresh * sgn && y0 * sgn <= tresh * sgn
  //                       ? [
  //                           tick.pixX + (x1ex - 1) * calcXaxis.scaledWidthPerTick,
  //                           yToPix?.(tresh, subchartIdx, yaxisIdx),
  //                           tick.pixX,
  //                           pixYPrice,
  //                         ]
  //                       : price * sgn <= tresh * sgn && y0 * sgn <= tresh * sgn
  //                       ? [
  //                           tick.pixX + (x1ex - 1) * calcXaxis.scaledWidthPerTick,
  //                           yToPix?.(tresh, subchartIdx, yaxisIdx),
  //                         ]
  //                       : null;
  //                   }
  //                   return null;
  //                 })()
  //               : null;
  //           })
  //           .flat()
  //           .filter((val) => val !== null) as number[]),
  //         calcGraph?.curTicks?.[calcGraph?.curTicks?.length - 1 ?? 0].pixX ?? 0,
  //         yToPix?.(tresh, subchartIdx, yaxisIdx) ?? 0,
  //       ]
  //     : [];
  // };

  // const lowerAreaVals = areaTresholds?.lower ? getAreaVals(areaTresholds.lower, false) : null;
  // const upperAreaVals = areaTresholds?.upper ? getAreaVals(areaTresholds.upper, true) : null;

  // const info = useReactiveInfo2([subCharts, calcXaxis, calcSubcharts, subchartIdx, yaxisIdx, graphIdx]);
  // console.log("linechart renders", info);

  return graphVals?.length > 0 ? (
    <React.Fragment>
      {/* !isNullish(lowerAreaVals) && pixLwrTresh && (
        <React.Fragment>
           <Line
            listening={false}
            key={`sub${subchartIdx}_graph${graphIdx}-lwrArea`}
            x={calcXaxis.pixXStart}
            y={0}
            points={lowerAreaVals}
            closed
            fill="red"
          />
          <Line
            listening={false}
            key={`sub${subchartIdx}_graph${graphIdx}-lwrAreaLine`}
            x={0}
            y={0}
            points={[0, pixLwrTresh, calcXaxis.pixXEnd, pixLwrTresh]}
            strokeWidth={1}
            stroke={T.isIndicatorGraph(graph) ? graph.style.strokeColor[indSeriesIdx] : graph.style.strokeColor}
            dash={[8, 16]}
          /> 
        </React.Fragment>
      )*/}
      {/* !isNullish(upperAreaVals) && pixUpperTresh && (
        <React.Fragment>
           <Line
            listening={false}
            key={`sub${subchartIdx}_graph${graphIdx}-uprArea`}
            x={calcXaxis.pixXStart}
            y={0}
            points={upperAreaVals}
            closed
            fill="limegreen"
            // dash={[8, 16]}
          />
          <Line
            listening={false}
            key={`sub${subchartIdx}_graph${graphIdx}-uprAreaLine`}
            x={0}
            y={0}
            points={[0, pixUpperTresh, calcXaxis.pixXEnd, pixUpperTresh]}
            strokeWidth={1}
            stroke={T.isIndicatorGraph(graph) ? graph.style.strokeColor[indSeriesIdx] : graph.style.strokeColor}
            dash={[8, 16]}
          /> 
        </React.Fragment>
      ) */}
      <Line
        listening={false}
        key={`sub${subchartIdx}_graph${graphIdx}-${indSeriesIdx}`}
        x={calcXaxis.pixXStart}
        y={0}
        points={graphVals}
        stroke={T.isIndicatorGraph(graph) ? graph.style.strokeColor[indSeriesIdx] : graph.style.strokeColor}
        strokeWidth={1}
      />
    </React.Fragment>
  ) : null;
};

export const CLineChart = React.memo(CLineChartComponent);
