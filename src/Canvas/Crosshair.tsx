import React from "react";
import { Line, Rect } from "react-konva";
import { CText } from ".";
import { isNullish } from "../utils/Basics";
import * as T from "../Types";
import { getDateString } from "../ChartState/utils/DateTime";
import { snapPixYToDataset } from "../ChartState/utils/Utils";

export type CrosshairProps = {
  subcharts: T.ChartState["subCharts"];
  data: T.ChartState["data"];
  containerSize: T.ChartState["containerSize"];
  // pointer: T.ChartState["pointer"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  calcPointer: T.ChartState["calc"]["pointer"];
  calcXaxis: T.ChartState["calc"]["xaxis"];
  style: T.ChartState["options"];
  disableSnapX?: boolean;
  disableSnapGraphs?: boolean;
  pixToY?: T.ChartState["calc"]["pixToY"];
  rtTicks?: T.RealtimeDataTick[];
};

export const CrosshairComponent = (props: CrosshairProps) => {
  const {
    disableSnapX,
    disableSnapGraphs,
    containerSize,
    style,
    subcharts,
    data,
    calcSubcharts,
    // pointer,
    calcPointer,
    calcXaxis,
    pixToY,
    rtTicks,
  } = props;

  const containerWidth = containerSize.width - 1;
  const containerHeight = containerSize.height - 1;
  const { widthYAxis } = style.yaxis; // 80 default but yaxis currently does not have width -> should be in settings
  const { heightXAxis, heightTickMarkLines } = style.xaxis;
  // const calcPointer = ChartState.calc.pointer;
  const {  pixXSnap, xUnlimited, pixXUnlimSnap } = calcPointer.move;
  const { xEnd, xLast } = calcXaxis;

  const pointedSubchartIdx = calcPointer.move.subchartIdx;
  const snapDataset = calcPointer.move.snapDatasets?.[0];
  const pointedYaxisIdx = snapDataset ? snapDataset.yaxisIdx : null;
  const pointedGraphIdx = snapDataset ? snapDataset.graphIdx : null;
  const pointedGraph =
    !isNullish(pointedYaxisIdx) && !isNullish(pointedGraphIdx) && !isNullish(pointedSubchartIdx)
      ? subcharts[pointedSubchartIdx].yaxis?.[pointedYaxisIdx]?.graphs?.[pointedGraphIdx]
      : null;
  const graphData = data.find((val) => val.id === pointedGraph?.dataId);
  const pixX =
    (!disableSnapX || (snapDataset?.ySnap && !disableSnapGraphs)) && pixXSnap ? pixXSnap : pixXUnlimSnap ?? 0;

  const mainGraphData = data?.[0].type === "chart" ? data[0] : null;

  const xDateString = snapDataset
    ? snapDataset.dateString
    : xUnlimited > xLast &&
      xUnlimited <= xLast + (rtTicks?.[0]?.data.length ?? 1) - 1 &&
      mainGraphData?.meta?.chartPeriod
    ? (() => {
        const date = rtTicks?.[0]?.data?.[xUnlimited - xEnd]?.date;
        const chartPeriod = mainGraphData.meta.chartPeriod;
        if (!date || !chartPeriod) return "";
        // const periodToDraw = getTickPeriod(date, data?.[0]?.type === "chart" ? data?.[0]?.dateStat : null, mainGraphMeta.chartPeriod, {
        //     ...optChartPeriod,
        // });
        //          const xDateString = getDateString(
        //     mainData.data[x].date,
        //     !!periodToDraw ? periodToDraw : mainGraphMeta.chartPeriod.name

        return getDateString(date, chartPeriod.name);
      })()
    : "";

  // const ysnapTest =
  //   xUnlimited > xLast &&
  //   xUnlimited <= xLast + (rtTicks?.[0]?.data.length ?? 1) - 1 &&
  //   !isNullish(pointedSubchartIdx) &&
  //   !isNullish(calcPointer.move.pixY)
  //     ? snapPixYToDataset(
  //         calcPointer.move.pixY,
  //         rtTick?.data?.[xUnlimited - xEnd],
  //         subcharts,
  //         pointedSubchartIdx,
  //         0,
  //         calcSubcharts
  //       )
  //     : null;
  const ysnapTest =
    xUnlimited > xLast &&
    xUnlimited <= xLast + (rtTicks?.[0]?.data.length ?? 1) - 1 &&
    !isNullish(pointedSubchartIdx) &&
    !isNullish(calcPointer.move.pixY) &&
    rtTicks
      ? rtTicks
          .map(
            (rtTick) =>
              snapPixYToDataset(
                calcPointer.move.pixY,
                rtTick?.data?.[xUnlimited - xEnd],
                subcharts,
                pointedSubchartIdx,
                0,
                calcSubcharts
              )?.filter((val) => val !== null) ??
              ([] as {
                y: string;
                pixY: number;
              }[])
          )
          .flat()
      : null;

  const pixY: number | null = !isNullish(snapDataset?.pixYSnap)
    ? snapDataset.pixYSnap
    : !isNullish(ysnapTest) && ysnapTest.length > 0
    ? ysnapTest[0].pixY
    : !isNullish(calcPointer.move.pixY)
    ? calcPointer.move.pixY
    : null;
  const yRaw =
    !isNullish(snapDataset?.ySnap) && !disableSnapGraphs
      ? snapDataset.ySnap
      : !isNullish(ysnapTest) && ysnapTest.length > 0
      ? ysnapTest[0].y
      : snapDataset?.y
      ? snapDataset.y.toString()
      : pixToY && !isNullish(pointedSubchartIdx)
      ? pixToY(calcPointer.move.pixY, pointedSubchartIdx, 0).toString()
      : null;
  const y =
    pointedGraph &&
    !isNullish(yRaw) &&
    T.isIndicatorGraph(pointedGraph) &&
    graphData?.type === "indicator" &&
    !!graphData.indicator.default.decimals
      ? parseFloat(yRaw).toFixed(graphData.indicator.default.decimals).toString()
      : yRaw;

  // console.log("Crosshair rendered");
  return !!pixY && subcharts.length > 0 ? (
    <React.Fragment>
      <Line // crosshair x
        name="crosshair-x"
        listening={false}
        x={0}
        y={0}
        points={[pixX + 0.5, 0.5, pixX + 0.5, containerHeight - heightXAxis + heightTickMarkLines + 0.5]}
        stroke={style.crosshair.strokeColor}
        strokeWidth={1}
      />
      {calcPointer.move.pixY <= subcharts[subcharts.length - 1].bottom ? (
        <React.Fragment>
          <Line // crosshair y
            name="crosshair-y"
            listening={false}
            x={0}
            y={0}
            points={[0.5, pixY + 0.5, containerWidth - widthYAxis + 0.5, pixY + 0.5]}
            stroke={style.crosshair.strokeColor}
            strokeWidth={1}
          />
          <Line // yaxis marker polygon
            name="y-marker-polygon"
            listening={false}
            draggable={false}
            x={0}
            y={0}
            points={[
              containerWidth - widthYAxis,
              pixY,
              containerWidth - widthYAxis + 10,
              pixY + 10,
              containerWidth,
              pixY + 10,
              containerWidth,
              pixY - 10,
              containerWidth - widthYAxis + 10,
              pixY - 10,
            ]}
            stroke={style.crosshair.yMarkerStrokeColor}
            fill={style.crosshair.yMarkerBackgroundColor}
            strokeWidth={1}
            closed
          />
          <CText
            name="y-marker text"
            listening={false}
            text={y ?? ""}
            halign="left"
            valign="middle"
            fontColor={style.crosshair.yMarkerTextColor}
            fontSize={style.crosshair.yMarkerFontSize}
            fontName={style.crosshair.yMarkerFontName}
            x={containerWidth - widthYAxis + style.yaxis.widthTickmarkLines + 5}
            y={pixY as number}
          />
        </React.Fragment>
      ) : null}
      {xUnlimited >= 0 && xUnlimited <= xEnd + (rtTicks?.[0]?.data.length ?? 1) - 1 ? (
        <React.Fragment>
          <Rect // xaxis marker rect
            name="x-marker rect"
            listening={false}
            x={pixX - 25}
            y={containerHeight - heightXAxis + heightTickMarkLines + 0.5}
            width={50}
            height={25}
            fill={style.crosshair.xMarkerBackgroundColor}
            stroke={style.crosshair.xMarkerStrokeColor}
            strokeWidth={1}
          />
          <CText // xaxis marker text
            name="x-marker text"
            listening={false}
            fontSize={style.crosshair.xMarkerFontSize}
            fontName={style.crosshair.xMarkerFontName}
            fontColor={style.crosshair.xMarkerTextColor}
            halign="center"
            valign="top"
            text={xDateString}
            x={pixX}
            y={containerHeight - heightXAxis + heightTickMarkLines + 5 + 0.5} // additional 5px distance to end of tickmark
          ></CText>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  ) : null;
};

export const Crosshair = React.memo(CrosshairComponent);
