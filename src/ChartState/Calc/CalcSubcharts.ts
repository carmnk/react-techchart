import { getDataSeriesMaxY, getDataSeriesMinY, purePixToY, pureYToPix } from "../utils/Utils";
import * as T from "../../Types";

const GetMetricYintervalStep = (yMax: number, yMin: number, decimals: number, targetSteps: number): number => {
  const minIntervalStep = 1 / Math.pow(10, decimals); //smallest possible number acc. to decimals
  const optIntervalStepPts = (yMax - yMin) / minIntervalStep / targetSteps; // in Pts -> in minInterval-steps
  const startExponent = Math.floor(Math.log10(optIntervalStepPts)) || 0;
  const nIterations = 2;
  const minimizationFunction = (steps: number) => Math.abs((yMax - yMin) / steps - targetSteps);
  return parseFloat(
    Array(nIterations * 3)
      .fill(0)
      .map((x, idx) => {
        const intervalStep =
          minIntervalStep *
          Math.pow(10, startExponent + Math.floor(idx / 3)) *
          (idx % 3 === 0 ? 1.0 : idx % 3 === 1 ? 2.5 : idx % 3 === 2 ? 5.0 : 0);
        const optimum = minimizationFunction(intervalStep);
        return {
          intervalStep,
          optimum,
        };
      })
      .reduce((prev, cur) => {
        if (cur.optimum < prev?.optimum) return cur;
        else return prev;
      })
      .intervalStep.toFixed(decimals)
  );
};

const calculateGraphs = (
  data: T.ChartState["data"],
  subcharts: T.ChartState["subCharts"],
  subchartIdx: number,
  yaxisIdx: number,
  xaxis: T.ChartState["calc"]["xaxis"]
): (T.CalcGraphState | null)[] => {
  const { xStart, xEnd, pixXEnd } = xaxis;
  const { top, bottom } = subcharts[subchartIdx];
  const intervalsTarget = Math.max(Math.round((bottom - top) / 75), 3);
  return subcharts[subchartIdx].yaxis[yaxisIdx].graphs.map((graph) => {
    const graphData = data.find((val) => val.id === graph.dataId);
    if (!graphData?.data) return null;
    const graphDataSeries = (graphData?.data as T.DataSeries) ?? [];
    const graphIndicator = (graphData as T.IndicatorData)?.indicator;
    const curData = graphDataSeries.slice(xStart, xEnd + 1); 
    const yMaxExact = getDataSeriesMaxY(curData, graphIndicator?.default?.fixedYScale, graphIndicator?.graphTypes);
    const yMinExact = getDataSeriesMinY(curData, graphIndicator?.default?.fixedYScale, graphIndicator?.graphTypes);
    const gDecimals = graphData?.decimals ?? 0;
    const gOptIntervalY = GetMetricYintervalStep(yMaxExact, yMinExact, gDecimals, intervalsTarget);
    return {
      lastDataset: {
        data: graphDataSeries[xEnd],
        x: xEnd,
        pixX: pixXEnd,
        dateString: "",
      },
      curData,
      yMaxExact,
      yMax: Math.ceil(yMaxExact / gOptIntervalY) * gOptIntervalY,
      yMinExact,
      yMin: Math.floor(yMinExact / gOptIntervalY) * gOptIntervalY,
    };
  });
};

// only post calculation !
export const calculatePixYDataset = (
  dataset: T.Dataset,
  dataId: string,
  data: T.ChartState["data"],
  subcharts: T.ChartState["subCharts"],
  yToPix: T.ChartState["calc"]["yToPix"]
): T.PixYDataset | null => {
  const paths = subcharts
    .map((subchart, sIdx) =>
      subchart.yaxis
        .map((yaxis, yIdx) =>
          yaxis.graphs.map((graph, gIdx) =>
            graph.dataId === dataId ? { subchartIdx: sIdx, yaxisIdx: yIdx, graphIdx: gIdx } : null
          )
        )
        .flat()
    )
    .flat()
    .filter((val) => val !== null);
  const path = paths?.[0];
  if (!path || !yToPix) return null;
  const yToPixSpec = (price: number) => yToPix(price, path.subchartIdx, path.yaxisIdx);
  const graphTypes = (data.find((dat) => dat.id === dataId && dat.type === "indicator") as T.IndicatorData | undefined)
    ?.indicator?.graphTypes;
  const pixY = T.isIndicatorDataset(dataset)
    ? {
        pixPrices: dataset.prices.map((price, pIdx) =>
          price && ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "") ? yToPixSpec(price) : null
        ),
      }
    : T.isCandleChartDataset(dataset)
    ? {
        pixOpen: yToPixSpec(dataset.open),
        pixHigh: yToPixSpec(dataset.high),
        pixLow: yToPixSpec(dataset.low),
        pixClose: yToPixSpec(dataset.close),
      }
    : T.isLineChartDataset(dataset)
    ? { pixClose: yToPixSpec(dataset.close) }
    : null;
  return pixY;
};

export const calculateSubcharts = (
  subcharts: T.ChartState["subCharts"] | undefined,
  xaxis: T.CalcXaxisState | undefined,
  data: T.ChartState["data"],
  rtData?: T.ChartStateProps["rtData"]
): T.CalcSubchartState[] | null => {
  if (!subcharts || !xaxis || !data) return null;
  if (subcharts.length === 0 || data.length === 0) return null;

  return subcharts.map((subchart, sIdx) => {
    const bottom = subchart.bottom;
    const top = subchart.top;
    const intervalsTarget = Math.max(Math.round((bottom - top) / 75), 3);
    return {
      yaxis: subchart.yaxis.map((oneYaxis, yIdx) => {
        const calculatedGraphs = calculateGraphs(data, subcharts, sIdx, yIdx, xaxis);
        const yMaxExact =
          Math.max(
            ...(calculatedGraphs.map((g) => g?.yMaxExact ?? null).filter((g) => g !== null) as number[]),
            ...(rtData
              ?.filter?.((val) => oneYaxis.graphs.map((g, gIdx) => g.dataId).includes(val.dataId))
              .map((rtDat) =>
                rtDat.data.map((dat) => (T.isCandleChartDataset(dat) ? dat.high ?? dat.close : dat.close))
              )
              .flat() ?? [])
          ) ?? 0;
        const yMinExact =
          Math.min(
            ...(calculatedGraphs.map((g) => g?.yMinExact ?? null).filter((g) => g !== null) as number[]),
            ...(rtData
              ?.filter?.((val) => oneYaxis.graphs.map((g, gIdx) => g.dataId).includes(val.dataId))
              .map((rtDat) => rtDat.data.map((dat) => (T.isCandleChartDataset(dat) ? dat.low ?? dat.close : dat.close)))
              .flat() ?? [])
          ) ?? 0;
        const decimals =
          Math.max(...oneYaxis.graphs.map((g) => data.find((val) => val.id === g.dataId)?.decimals ?? 0)) ?? 0;
        const optIntervalY = GetMetricYintervalStep(yMaxExact, yMinExact, decimals, intervalsTarget);
        // optIntervalY cant be fetched by graphs since max and min may concern different graphs
        const yMax = Math.ceil(yMaxExact / optIntervalY) * optIntervalY;
        const yMin = Math.floor(yMinExact / optIntervalY) * optIntervalY;
        const heightPerPt = (bottom - top) / ((yMax || 0) - (yMin || 0)) / Math.pow(10, decimals);
        const translatedY = -pureYToPix(yMin || 0, bottom, decimals, 0, heightPerPt) + bottom;
        const yToPix = (price: number) => pureYToPix(price, bottom, decimals, translatedY, heightPerPt);
        const yBottom = purePixToY(bottom, bottom, decimals, translatedY, heightPerPt);
        const pixYBottomCeiled = yToPix(Math.ceil(yBottom / optIntervalY) * optIntervalY);

        const intervalStep = (heightPerPt * optIntervalY) / Math.pow(10, -decimals);
        const nintervalSteps = Math.floor((pixYBottomCeiled - 10 - top - 10) / intervalStep);
        const drawTicks =
          !nintervalSteps || nintervalSteps < 0
            ? []
            : Array(nintervalSteps)
                .fill(0)
                .map((x, idx) => {
                  const pixY = pixYBottomCeiled - (idx + 1) * intervalStep;
                  const yi = purePixToY(pixY, bottom, decimals, translatedY, heightPerPt);
                  const label = (Math.round(yi * Math.pow(10, decimals)) / Math.pow(10, decimals)).toString();
                  return { pixY, label };
                });

        const finalGraphs =
          calculatedGraphs &&
          calculatedGraphs.map((graph, gIdx) => {
            if (!graph?.curData) return graph;
            const curTicks = graph.curData.map((dataset, dIdx) => {
              const graphTypes = (
                data.find(
                  (dat) => dat.id === oneYaxis.graphs?.[gIdx].dataId && dat.type === "indicator"
                ) as T.IndicatorData
              )?.indicator?.graphTypes;
              const pixY = T.isIndicatorDataset(dataset)
                ? {
                    pixPrices: dataset.prices.map((price, pIdx) =>
                      price && ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "") ? yToPix(price) : null
                    ),
                  }
                : T.isCandleChartDataset(dataset)
                ? {
                    pixOpen: yToPix(dataset.open),
                    pixHigh: yToPix(dataset.high),
                    pixLow: yToPix(dataset.low),
                    pixClose: yToPix(dataset.close),
                  }
                : T.isLineChartDataset(dataset)
                ? { pixClose: yToPix(dataset.close) }
                : null;
              return { pixX: xaxis.scaledWidthPerTick * dIdx, pixY };
            });
            return { ...graph, curTicks };
          });

        return {
          pixY0: yToPix(0),
          yMaxExact,
          yMinExact,
          yMax,
          yMin,
          heightPerPt,
          decimals,
          optIntervalY,
          translatedY,
          graphs: finalGraphs,
          drawTicks,
        };
      }),
    };
  });
};

export const getYaxisMethods = (subcharts: T.ChartState["subCharts"], calcSubcharts: T.CalcSubchartState[]) => {
  return {
    yToPix: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number): number => {
      if (!subcharts?.[subchartIdx]?.yaxis?.[yaxisIdx]) return 0;
      const { heightPerPt, decimals, translatedY: stateTranslatedY } = calcSubcharts[subchartIdx].yaxis[yaxisIdx];
      const translatedYint = translatedY !== undefined ? translatedY : stateTranslatedY;
      return subcharts[subchartIdx].bottom - y * Math.pow(10, decimals) * heightPerPt + translatedYint;
    },
    pixToY: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number): number => {
      if (!subcharts?.[subchartIdx]?.yaxis?.[yaxisIdx]) return 0;
      const { heightPerPt, decimals, translatedY: stateTranslatedY } = calcSubcharts[subchartIdx].yaxis[yaxisIdx];
      const translatedYint = translatedY !== undefined ? translatedY : stateTranslatedY;
      return ((subcharts[subchartIdx].bottom + translatedYint - pixY) / heightPerPt) * Math.pow(10, -decimals);
    },
  };
};
