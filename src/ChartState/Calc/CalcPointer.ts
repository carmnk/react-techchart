import { getTickPeriod } from "./PeriodUtils";
import { getDateString } from "../utils/DateTime";
import {
  getSubchartIdxByPixXy,
  purePixToX,
  purePixToY,
  pureXToPix,
  snapPixYToDataset,
} from "../utils/Utils";
import * as T from "../../Types";
import { defaultCalcPointer } from "../Defaults";

const calculatePointerXvals = (
  xaxis: T.CalcXaxisState,
  mainGraph: T.ChartGraphState | null,
  data: T.ChartState["data"],
  onMove?: T.ChartState["pointer"]["move"]
):
  | (Pick<
      T.CalcPointerState["move"],
      "pixXSnap" | "xUnlimited" | "xDateString" | "pixXUnlimSnap"
    > & { x: number })
  | Pick<T.CalcPointerState["move"], "xUnlimited" | "pixXUnlimSnap">
  | null => {
  if (mainGraph?.type !== "chart" || !onMove) return null;
  const mainData = data.find((val) => val.id === mainGraph.dataId);
  if (mainData?.type !== "chart") return null;
  const { meta: mainGraphMeta, dateStat: mainGraphDateStat } = mainData;
  const { scaledWidthPerTick: widthPerTick, totalTranslatedX: translatedPixX } =
    xaxis;
  const xUnlimited = Math.round(
    purePixToX(onMove?.xy[0] as any, translatedPixX, widthPerTick)
  );
  const pixXUnlimSnap = pureXToPix(xUnlimited, translatedPixX, widthPerTick);
  if (
    xUnlimited < 0 ||
    xUnlimited > mainData.data.length - 1 ||
    !mainGraphDateStat
  )
    return { xUnlimited, pixXUnlimSnap };
  const x = Math.abs(Math.round(xUnlimited));
  const optChartPeriod = xaxis.optChartPeriod;
  if (!optChartPeriod || !mainGraphMeta.chartPeriod || !mainGraphDateStat)
    return { xUnlimited, pixXUnlimSnap };
  const periodToDraw = getTickPeriod(
    mainData.data[x].date,
    mainGraphDateStat,
    mainGraphMeta.chartPeriod,
    {
      ...optChartPeriod,
    }
  );
  const pixXSnap = pureXToPix(x, translatedPixX, widthPerTick);
  const xDateString = getDateString(
    mainData.data[x].date,
    periodToDraw ? periodToDraw : mainGraphMeta.chartPeriod.name
  );
  return {
    x,
    xDateString,
    pixXSnap,
    xUnlimited,
    pixXUnlimSnap,
  };
};

export const calculateCurrentPointerDataset = (
  pointer: T.ChartInteractions["pointer"],
  calc: T.ChartInteractions["calc"],
  subcharts: T.ChartState["subCharts"] | null,
  data: T.ChartState["data"]
): T.ChartState["calc"]["pointer"] | null => {
  const { move, dragPointerUp: dragEnd, isHovering } = pointer;
  const xaxis = calc.xaxis;
  const mainGraph =
    !!subcharts?.[0]?.yaxis?.[0]?.graphs?.[0] &&
    T.isChartGraph(subcharts[0].yaxis[0].graphs[0])
      ? subcharts[0].yaxis[0].graphs[0]
      : null;
  const xy = move?.xy;
  if (!mainGraph || !move || !subcharts || !xy) return null;
  const subchartIdx = getSubchartIdxByPixXy(xy, subcharts);
  if (subchartIdx === null) return defaultCalcPointer;
  const getDefaultChartPointer = (
    xUnlimited: number,
    pixXUnlimSnap: number,
    subchartIdx: number
  ): T.CalcPointerState => ({
    isHovering,
    move: {
      pixX: xy[0],
      pixXUnlimSnap,
      pixXSnap: 0,
      pixY: xy[1],
      x: null,
      xUnlimited,
      subchartIdx,
      snapDatasets: [],
      xDateString: "",
    },
    click: {
      clickedSubchartIdx: null,
    },
  });
  const pointerXvals = calculatePointerXvals(xaxis, mainGraph, data, move);
  if (!pointerXvals) return null;
  if (!("x" in pointerXvals))
    return getDefaultChartPointer(
      pointerXvals.xUnlimited,
      pointerXvals.pixXUnlimSnap,
      subchartIdx
    );
  const { xUnlimited, x, xDateString, pixXSnap, pixXUnlimSnap } = pointerXvals;
  const clickedSubchartIdx =
    !!dragEnd && !!dragEnd.xy
      ? getSubchartIdxByPixXy(dragEnd.xy, subcharts)
      : null;
  const snapDatasets = subcharts[subchartIdx].yaxis
    .map((yaxis, yaxisIdx) =>
      yaxis.graphs.map((graph, graphIdx) => {
        const graphDataSeries = data.find((val) => val.id === graph?.dataId)
          ?.data as T.DataSeries;
        const snapPriceRes = graphDataSeries
          ? snapPixYToDataset(
              xy[1],
              graphDataSeries[x],
              subcharts,
              subchartIdx,
              yaxisIdx,
              calc.subcharts
            )
          : null;
        const pixYSnap =
          snapPriceRes && snapPriceRes.length > 0 ? snapPriceRes[0].pixY : null;
        const ySnap =
          snapPriceRes && snapPriceRes.length > 0 ? snapPriceRes[0].y : null;
        const { decimals, translatedY, heightPerPt } =
          calc.subcharts[subchartIdx].yaxis[yaxisIdx];
        return {
          yaxisIdx: yaxisIdx,
          graphIdx: graphIdx,
          data: graphDataSeries?.[x], // can actualy be undefined
          y: purePixToY(
            xy[1],
            subcharts[subchartIdx].bottom,
            decimals,
            translatedY,
            heightPerPt
          ),
          ySnap: ySnap,
          pixYSnap: pixYSnap,
          dateString: xDateString,
        };
      })
    )
    .flat()
    .sort((a, b) => {
      return a.ySnap === null && b.ySnap === null
        ? 0
        : (a.ySnap === null && b.ySnap !== null) ||
          (a.ySnap !== null &&
            b.ySnap !== null &&
            Math.abs(parseFloat(a.ySnap) - a.y) >
              Math.abs(parseFloat(b.ySnap) - b.y))
        ? 1
        : (a.ySnap !== null && b.ySnap === null) ||
          (a.ySnap !== null &&
            b.ySnap !== null &&
            Math.abs(parseFloat(a.ySnap) - a.y) <
              Math.abs(parseFloat(b.ySnap) - b.y))
        ? -1
        : 0;
    });
  return {
    isHovering,
    move: {
      pixX: xy[0],
      pixXSnap,
      pixXUnlimSnap,
      pixY: xy[1],
      x,
      xUnlimited,
      subchartIdx,
      snapDatasets,
      xDateString,
    },
    click: {
      clickedSubchartIdx,
    },
  };
};
