import React from "react";
import { Line } from "react-konva";
import * as T from "../Types";
import { isNullish } from "../utils/Basics";
import { CText } from "./CText";

export type MarkerProps = {
  rtTicks?: T.RealtimeDataTick[];
  xaxis: T.ChartState["calc"]["xaxis"];
  containerSize: T.ChartState["containerSize"];
  style: T.ChartState["options"];
  indSeriesIdx?: number;
};

const MarkerComponent = (props: MarkerProps) => {
  const { rtTicks, containerSize, style, indSeriesIdx, xaxis } = props;
  const lastRtTick = rtTicks?.[0]?.ticks?.[rtTicks?.[0]?.ticks?.length - 1];
  const lastRtData = rtTicks?.[0]?.data?.[rtTicks?.[0]?.data?.length - 1];
  if (!rtTicks || !lastRtTick || !lastRtData) return null;
  const { width: containerWidth } = containerSize;
  const widthYAxis = style.yaxis.widthYAxis;

  const pixYDataset = lastRtTick?.pixY;
  const pixX = lastRtTick.pixX;
  const pixY =
    !!pixYDataset && T.isLineChartPixDataset(lastRtTick)
      ? lastRtTick?.pixY?.pixClose
      : T.isIndicatorPixDataset(lastRtTick)
      ? lastRtTick?.pixY?.pixPrices?.[indSeriesIdx ?? 0]
      : null;

  const y = T.isLineChartDataset(lastRtData as T.Dataset)
    ? (lastRtData as T.LineChartDataset)?.close
    : T.isIndicatorDataset(lastRtData as T.Dataset)
    ? (lastRtData as T.IndicatorDataset)?.prices?.[indSeriesIdx ?? 0]
    : null;
  if (isNullish(pixY) || isNullish(y)) return null;
  return (
    <React.Fragment>
      <Line // marker line y
        name="graphmarkerLineY"
        listening={false}
        x={xaxis.pixXStart}
        y={0}
        points={[
          Math.round(pixX) + 0.5,
          Math.round(pixY) + 0.5,
          containerWidth - widthYAxis + 0.5,
          Math.round(pixY) + 0.5,
        ]}
        stroke={"rgba(102,102,102,0.5)"}
        strokeWidth={1}
      />
      <Line // yaxis marker polygon
        name="graphMarkerPolygonY"
        listening={false}
        draggable={false}
        x={0}
        y={0}
        points={[
          Math.round(containerWidth - widthYAxis) + 0.5,
          Math.round(pixY) + 0.5,
          Math.round(containerWidth - widthYAxis + 10) + 0.5,
          Math.round(pixY + 10) + 0.5,
          Math.round(containerWidth) + 0.5,
          Math.round(pixY + 10) + 0.5,
          Math.round(containerWidth) + 0.5,
          Math.round(pixY - 10) + 0.5,
          Math.round(containerWidth - widthYAxis + 10) + 0.5,
          Math.round(pixY - 10) + 0.5,
        ]}
        stroke={style.crosshair.yMarkerStrokeColor}
        fill={style.crosshair.yMarkerBackgroundColor}
        strokeWidth={1}
        closed
      />
      <CText
        name="graphMarkerPolygonYText"
        listening={false}
        text={y.toString() ?? ""}
        halign="left"
        valign="middle"
        fontColor={style.crosshair.yMarkerTextColor}
        fontSize={style.crosshair.yMarkerFontSize}
        fontName={style.crosshair.yMarkerFontName}
        x={Math.round(containerWidth - widthYAxis + style.yaxis.widthTickmarkLines + 5) +0.5}
        y={Math.round(pixY)+0.5 }
      />
    </React.Fragment>
  );
};

export const Marker = React.memo(MarkerComponent);
