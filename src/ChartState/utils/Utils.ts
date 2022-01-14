import * as T from "../../Types";
import { getDecimals, isNullish } from "../../utils/Basics";

export const pureXToPix = (x: number, translated: number, widthPerTick: number) => {
  return x * widthPerTick + translated;
};
export const purePixToX = (pixX: number, translated: number, widthPerTick: number) => {
  return (pixX - translated) / widthPerTick;
};

export const pureYToPix = (y: number, pixYBottom: number, decimals: number, translatedY: number, pixPerPt: number) => {
  return pixYBottom - y * Math.pow(10, decimals) * pixPerPt + translatedY;
};
export const purePixToY = (
  pixY: number,
  pixYBottom: number,
  decimals: number,
  translatedY: number,
  pixPerPt: number
) => {
  return ((pixYBottom + translatedY - pixY) / pixPerPt) * Math.pow(10, -decimals);
};

export const getDataSeriesMaxY = (
  dataSeries: T.DataSeries,
  fixedYScale?: [number, number],
  graphTypes?: T.IndicatorData["indicator"]["graphTypes"]
) => {
  return T.isIndicatorDataset(dataSeries[0]) && !!fixedYScale
    ? fixedYScale[1]
    : Math.max(
        ...dataSeries.map((dataset) => {
          if (T.isIndicatorDataset(dataset)) {
            const max = Math.max(
              ...(dataset.prices.filter(
                (price, pIdx) => price !== null && ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "")
              ) as number[])
            );
            return isNullish(max) ? 0 : max;
          }
          if (T.isCandleChartDataset(dataset)) return dataset.high;
          return dataset.close;
        })
      );
};

export const getDataSeriesMinY = (
  dataSeries: T.DataSeries,
  fixedYScale?: [number, number],
  graphTypes?: T.IndicatorData["indicator"]["graphTypes"]
) => {
  return T.isIndicatorDataset(dataSeries[0]) && !!fixedYScale
    ? fixedYScale[0]
    : Math.min(
        ...dataSeries.map((dataset) => {
          if (T.isIndicatorDataset(dataset)) {
            const min = Math.min(
              ...(dataset.prices.filter(
                (price, pIdx) => price !== null && ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "")
              ) as number[])
            );
            return isNullish(min) ? 0 : min;
          }
          if (T.isCandleChartDataset(dataset)) return dataset.low;
          return dataset.close;
        })
      );
};

export const snapPixYToDataset = (
  pixY: number,
  dataset: T.Dataset | undefined,
  subcharts: T.ChartState["subcharts"] | null,
  subchartIdx: number,
  yaxisIdx: number,
  calcSubcharts: T.ChartState["calc"]["subcharts"],
  snapTolerance?: number
):
  | {
      y: string;
      pixY: number;
    }[]
  | null => {
  const snapTol = snapTolerance ? snapTolerance : 10;
  if (
    isNullish(pixY) ||
    isNullish(subcharts) ||
    isNullish(subchartIdx) ||
    isNullish(yaxisIdx) ||
    isNullish(dataset) ||
    isNullish(dataset)
  )
    return null;

  const prices = T.isIndicatorDataset(dataset)
    ? (dataset.prices.filter((p) => p !== null) as number[])
    : T.isCandleChartDataset(dataset)
    ? [dataset.open, dataset.high, dataset.low, dataset.close]
    : T.isLineChartDataset(dataset)
    ? [dataset.close]
    : [];
  if (prices.length === 0) return null;
  const calcYaxis = calcSubcharts[subchartIdx].yaxis[yaxisIdx];
  return prices
    .map((price) => ({
      pixY: pureYToPix(
        price,
        subcharts[subchartIdx].bottom,
        calcYaxis.decimals,
        calcYaxis.translatedY,
        calcYaxis.heightPerPt
      ),
      y: price.toFixed(getDecimals(price)),
    }))
    .filter((price) => price.pixY >= pixY - snapTol && price.pixY <= pixY + snapTol)
    .sort((a, b) =>
      Math.abs(a.pixY - pixY) < Math.abs(b.pixY - pixY) ? -1 : Math.abs(a.pixY - pixY) > Math.abs(b.pixY - pixY) ? 1 : 0
    );
};

export const getSubchartIdxByPixXy = (
  pixXy: [number, number] | undefined,
  subcharts: T.ChartState["subcharts"]
): number | null => {
  if (!pixXy || !subcharts) return null;
  const activeSubchart = subcharts.find((val) => pixXy[1] >= val.top && pixXy[1] < val.bottom);
  if (!activeSubchart) return null;
  const activeIdx = subcharts.indexOf(activeSubchart);
  if (activeIdx === -1) return null;
  return activeIdx;
};

export const snapToolsByXy = (
  pixXy: [number, number] | undefined,
  subcharts: T.ChartState["subcharts"],
  xaxis: T.CalcXaxisState,
  calc: T.ChartState["calc"]
): { subchartIdx: number; yaxisIdx: number; toolIdx: number; toolPtIdx: number }[] => {
  if (!pixXy || !subcharts || !xaxis) return [];
  const subchartIdx = getSubchartIdxByPixXy(pixXy, subcharts);
  if (subchartIdx === null) return [];
  const translatedX = xaxis.totalTranslatedX;
  const widthPerTick = xaxis.scaledWidthPerTick;

  return subcharts[subchartIdx].yaxis
    .map((yaxis, yaxisIdx) => {
      const calcYaxis = calc.subcharts?.[subchartIdx]?.yaxis?.[yaxisIdx];
      if (!calcYaxis) return [];
      return yaxis.tools
        .map(
          (tool, toolIdx) =>
            tool.xy
              .map((anchorXy, toolPtIdx) => {
                const anchorPixX = pureXToPix(anchorXy[0], translatedX, widthPerTick);
                const anchorPixY = pureYToPix(
                  anchorXy[1],
                  subcharts[subchartIdx].bottom,
                  calcYaxis.decimals,
                  calcYaxis.translatedY,
                  calcYaxis.heightPerPt
                );
                return pixXy[0] >= anchorPixX - 10 &&
                  pixXy[0] <= anchorPixX + 10 &&
                  pixXy[1] >= anchorPixY - 10 &&
                  pixXy[1] <= anchorPixY + 10
                  ? { subchartIdx, yaxisIdx, toolIdx, toolPtIdx }
                  : null;
              })
              .filter((a) => a !== null) as {
              subchartIdx: number;
              yaxisIdx: number;
              toolIdx: number;
              toolPtIdx: number;
            }[]
        )
        .flat();
    })
    .flat();
};

export const getMaxDataSeriesDecimals = (dataSeries: T.DataSeries) => {
  const decimalStat = dataSeries.map((dataset) =>
    T.isCandleChartDataset(dataset)
      ? Math.max(
          ...[
            getDecimals(dataset.close),
            getDecimals(dataset.open),
            getDecimals(dataset.high),
            getDecimals(dataset.low),
          ]
        )
      : T.isLineChartDataset(dataset)
      ? getDecimals(dataset.close)
      : T.isIndicatorDataset(dataset)
      ? getDecimals(Math.max(...dataset.prices.map((price) => (!isNullish(price) ? getDecimals(price) : 0))))
      : 0
  );
  const maxDecimals = Math.max(...decimalStat);
  return maxDecimals;
};
