import { getDateString, chartPeriods } from "../utils/DateTime";
import { getTickPeriod } from "./PeriodUtils";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";
import { purePixToX, pureXToPix } from "../utils/Utils";

type CalcXaxisVals = Omit<
  T.CalcXaxisState,
  | "totalTranslatedX"
  | "totalScaleX"
  | "scaledWidthPerTick"
  | "scaleInitTranslatedX"
  | "scaleInitWidthPerTick"
  | "initialWidthPerTick"
>;

export const calculateXaxis = (
  ChartState: T.ChartState,
  PreState: T.ChartInteractions,
  action: T.Action
): T.CalcXaxisState => {
  const { data, subcharts } = ChartState;
  const mainGraph =
    subcharts?.[0]?.yaxis?.[0]?.graphs?.[0] && T.isChartGraph(subcharts?.[0]?.yaxis?.[0]?.graphs?.[0])
      ? subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]
      : null;
  const xaxis = ChartState.calc.xaxis;
  const pointer = PreState.pointer;
  const canvasWidth = PreState.containerSize.width - 1;
  const wheelDeltaY = pointer.wheel?.delta[1];
  const isWheeling = !!action.wheel;
  // const isPinching = !!action.pinch;
  const isPinching = action?.pointer?.type === "pinchScale";
  const initWheelMousePos = pointer.move?.xy;
  const doDragAction = action?.pointer?.type !== "pinchScale" ? action?.pointer?.shallUpdate : false;
  const doTranslate = (action?.pointer as T.DragAction)?.type === "translate" && doDragAction;
  const doScale = (action?.pointer as T.DragAction)?.type === "scale" && doDragAction;
  const mainGraphData = data.find((val) => val.id === mainGraph?.dataId);
  const dragInit = pointer.drag?.initial;
  if (
    !mainGraphData ||
    (!(action?.pointer as T.DragAction)?.shallUpdate && !action.wheel && !action.deps && !action.containerResize) ||
    (!dragInit && (action?.pointer as T.DragAction)?.shallUpdate)
  )
    return xaxis;
  const nMainData = mainGraphData.data.length;

  if (isPinching) {
    const pinchAction = action.pointer as NonNullable<T.PinchAction>;
    const { initScaledWidthPerTick, initTranslatedX, type } = pinchAction;
    if (type !== "pinchScale" || isNullish(initScaledWidthPerTick) || isNullish(initTranslatedX)) return xaxis;

    const scaledWidthPerTick = scaleFn2(pointer?.pinch?.movementInitial[0], initScaledWidthPerTick, canvasWidth);
    const translatedXonStart = initTranslatedX;
    const initPixX = dragInit[0];
    const initXexact = (dragInit[0] - translatedXonStart) / initScaledWidthPerTick;
    const newPos = initXexact * scaledWidthPerTick + translatedXonStart;
    const totalTranslatedX = initTranslatedX - newPos + initPixX;
    return {
      ...xaxis,
      scaledWidthPerTick,
      totalTranslatedX,
      ...calcXaxisVals(scaledWidthPerTick, totalTranslatedX, canvasWidth, mainGraph, data),
    };
  } else if (isWheeling) {
    const scaledWidthPerTick = scaleFn2(wheelDeltaY / 2, xaxis.scaledWidthPerTick, canvasWidth);
    const translatedXonStart = xaxis.totalTranslatedX;
    const initPixX = initWheelMousePos ? initWheelMousePos[0] : 0;
    const initXexact =
      ((initWheelMousePos ? initWheelMousePos[0] : 0) - translatedXonStart) / (xaxis.scaledWidthPerTick as number);
    const newPos = Math.round(initXexact) * scaledWidthPerTick + xaxis.totalTranslatedX;

    const totalTranslatedX = xaxis.totalTranslatedX - newPos + initPixX;
    return {
      ...xaxis,
      scaledWidthPerTick,
      totalTranslatedX,
      ...calcXaxisVals(scaledWidthPerTick, totalTranslatedX, canvasWidth, mainGraph, data),
    };
  } else if (doTranslate) {
    const totalTranslatedX = Math.max(
      Math.min(pointer.drag.delta[0] + xaxis.totalTranslatedX, canvasWidth - 2 * xaxis.scaledWidthPerTick),
      -((nMainData - 3) * xaxis.scaledWidthPerTick)
    );
    return {
      ...xaxis,
      totalTranslatedX,
      ...calcXaxisVals(xaxis.scaledWidthPerTick, totalTranslatedX, canvasWidth, mainGraph, data),
    };
  } else if (doScale) {
    const dragAction = action.pointer as T.DragAction<"scale">;
    const { initTranslatedX, initScaledWidthPerTick } = dragAction;
    if (!initScaledWidthPerTick) return xaxis;
    const scaledWidthPerTick = scaleFn2(pointer?.drag?.movementInitial[0], initScaledWidthPerTick, canvasWidth);
    const translatedXonStart = initTranslatedX;
    const initPixX = dragInit[0];
    const initXexact = (dragInit[0] - translatedXonStart) / (initScaledWidthPerTick as number);
    const newPos = initXexact * scaledWidthPerTick + translatedXonStart;
    const totalTranslatedX = initTranslatedX - newPos + initPixX;

    return {
      ...xaxis,
      scaledWidthPerTick,
      totalTranslatedX,
      ...calcXaxisVals(scaledWidthPerTick, totalTranslatedX, canvasWidth, mainGraph, data),
    };
  } else if (action.deps) {
    return {
      ...xaxis,
      ...calcXaxisVals(xaxis.scaledWidthPerTick, xaxis.totalTranslatedX, canvasWidth, mainGraph, data),
    };
  }
  return xaxis;
};

export const jumpToXaxisEnd = (
  xaxis: T.CalcXaxisState,
  mainGraphData: T.ChartDataSeries,
  containerWidth: number
): T.CalcXaxisState => {
  return {
    ...xaxis,
    totalTranslatedX:
      -(mainGraphData.length + 10 - containerWidth / xaxis.scaledWidthPerTick) * xaxis.scaledWidthPerTick,
  };
};

// scaledWidthPerTick -> scaledWidthPerTick after scaling
const scaleFn2 = (deltaPixX: number, scaleInitWidthPerTick: number, containerWidth: number) => {
  return deltaPixX >= 0
    ? Math.min(scaleInitWidthPerTick * (1 + Math.abs(deltaPixX) / (containerWidth / 2)), containerWidth / 3)
    : Math.max(scaleInitWidthPerTick / (1 + Math.abs(deltaPixX) / (containerWidth / 2)), 1);
};

const getOptimalPeriod = (
  metaData: T.ChartData["meta"],
  dateStat: T.ChartData["dateStat"],
  containerWidth: number,
  widthPerTick: number
): T.ChartPeriod | null => {
  if (!metaData.chartPeriod || !dateStat) return null;
  const { name: chartPeriodName, multiply: chartPeriodMultiply } = metaData.chartPeriod;
  const periodsConstIdx = chartPeriods.findIndex((periodConst) => periodConst.name === chartPeriodName);
  if (periodsConstIdx === -1) return null;
  const nCurrentBars = purePixToX(containerWidth, 0, widthPerTick);

  const curAccAmts = { ...dateStat.accAmt };
  Object.entries(curAccAmts).forEach(([key]) => {
    const pKey = key as T.PeriodName;
    if (key !== chartPeriodName) curAccAmts[pKey] = (curAccAmts[pKey] * nCurrentBars) / curAccAmts[chartPeriodName];
    else curAccAmts[chartPeriodName] = nCurrentBars;
  });

  const targetIntervals = Math.max(Math.round(containerWidth / 100), 4); //10
  const minimizationFunction = (amtOfPeriod: number, multiply: number) =>
    Math.abs(amtOfPeriod / multiply - targetIntervals);
  const optPeriodRes = chartPeriods
    .slice(periodsConstIdx)
    .map((constPeriod, constIdx) => {
      const name = constPeriod.name;
      const multiplys =
        constIdx === 0
          ? [1, ...constPeriod.scaleMultiplys]
              .filter((val) => val >= chartPeriodMultiply)
              .map((val) => val / chartPeriodMultiply)
          : [1, ...constPeriod.scaleMultiplys];
      return [1, ...multiplys].map((multiply) => {
        const amt = curAccAmts[name];
        const period = constPeriod.period;
        return { name, multiply, amt, period };
      });
    })
    .flat()
    .reduce((acc, cur) =>
      minimizationFunction(cur.amt, cur.multiply) < minimizationFunction(acc.amt, acc.multiply) ? cur : acc
    );
  const { amt, ...result } = optPeriodRes;
  return result;
};

const calcXaxisVals = (
  scaledWidthPerTick: number,
  translatedPixX: number,
  containerWidth: number,
  mainGraph: T.ChartGraphState | null,
  data: T.ChartState["data"]
): CalcXaxisVals => {
  const xStartExaxt = !scaledWidthPerTick ? 0 : -translatedPixX / scaledWidthPerTick;
  const xStart = Math.max(Math.ceil(xStartExaxt), 0);
  const pixXStart = xStart * scaledWidthPerTick + translatedPixX;
  const defaultXaxis: CalcXaxisVals = {
    xStart,
    pixXStart,
    xEnd: 0,
    xLast: 0,
    xUnlimited: 0,
    pixXEnd: 0,
    curTicks: [],
    optChartPeriod: null,
  };
  const mainGraphData = data.find((val) => val.id === mainGraph?.dataId) as T.ChartData;
  if (
    !containerWidth ||
    !mainGraph ||
    !scaledWidthPerTick ||
    !mainGraphData ||
    !mainGraphData.dateStat ||
    mainGraphData?.data?.length === 0
  )
    return defaultXaxis;

  const nMainData = mainGraphData.data.length ?? 0;
  const pixXEnd = Math.min(containerWidth, nMainData * scaledWidthPerTick + translatedPixX);
  const pixXEndUnlimited = containerWidth;
  const xUnlimited = Math.floor((pixXEndUnlimited - translatedPixX) / scaledWidthPerTick);
  const xEnd = Math.min(xUnlimited, nMainData - 1);
  const optChartPeriod = getOptimalPeriod(
    mainGraphData.meta,
    mainGraphData.dateStat,
    containerWidth,
    scaledWidthPerTick
  );
  const chartPeriod = mainGraphData.meta.chartPeriod;
  const dateStat = mainGraphData?.dateStat;
  const curTicks =
    !optChartPeriod || !chartPeriod || isNullish(dateStat)
      ? []
      : (Array(xEnd - xStart + 1)
          .fill(0)
          .map((x, idx) => {
            const xi = xStart + idx;
            const periodToDraw = getTickPeriod(mainGraphData.data[xi].date, dateStat, chartPeriod, {
              ...optChartPeriod,
            });
            if (periodToDraw) {
              const dateString = getDateString(mainGraphData.data[xi].date, periodToDraw);
              return { x: pixXStart + scaledWidthPerTick * idx, dateString };
            }
            return null;
          })
          .filter((val) => val !== null) as {
          x: number;
          dateString: string;
        }[]);

  const xToPix = (x: number, translatedX?: number) => {
    const translatedXint = translatedX ?? translatedPixX;
    return pureXToPix(x, translatedXint, scaledWidthPerTick);
  };

  const pixToX = (pixX: number, translatedX?: number) => {
    const translatedXint = translatedX ?? translatedPixX;
    return purePixToX(pixX, translatedXint, scaledWidthPerTick);
  };
  return {
    xLast: nMainData - 1,
    xStart,
    pixXStart,
    xEnd,
    xUnlimited,
    pixXEnd,
    curTicks,
    optChartPeriod,
    xToPix,
    pixToX,
  };
};
