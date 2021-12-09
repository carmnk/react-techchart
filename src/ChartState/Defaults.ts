import uniq from "lodash/uniq";
import * as T from "../Types";
import { setStateProp } from "../utils";
import { isNullish } from "../utils/Basics";

export const prefersDarkMode =
  typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;

export const defaultContainerSizeState: T.ChartState["containerSize"] = {
  top: 0,
  left: 0,
  width: 300,
  height: 300,
  init: false,
};

export const defaultPointerState: T.ChartState["pointer"] = {
  isHovering: false,
  move: { isMoving: false, xy: [0, 0] },
  wheel: { isWheeling: false, delta: [0, 0] },
  dragPointerUp: {
    isDragPointerUp: false,
    xy: [0, 0],
    // first: false,
    // last: false,
    // initial: [0, 0],
    // movementInitial: [0, 0],
  },
  drag: {
    isDragging: false,
    xy: [0, 0],
    first: false,
    last: false,
    initial: [0, 0],
    movementInitial: [0, 0],
    delta: [0, 0],
    ctrlKey: false,
  },
  pinch: { isPinching: false, first: false, movementInitial: [0, 0], origin: [0, 0] },
};

export const defaultDrawState: T.ChartState["draw"] = {
  isDrawing: false,
  xy: [],
  params: [],
};

export const defaultCalcXaxis: T.ChartState["calc"]["xaxis"] = {
  totalTranslatedX: 0,
  scaledWidthPerTick: 10,
  xStart: 0,
  xEnd: 0,
  xLast: 0,
  xUnlimited: 0,
  pixXStart: 0,
  pixXEnd: 0,
  optChartPeriod: null,
  initialWidthPerTick: 10,
  curTicks: [],
};

export const defaultCalcPointer: T.ChartState["calc"]["pointer"] = {
  isHovering: false,
  move: {
    x: 0,
    pixX: 0,
    pixY: 0,
    snapDatasets: [],
    subchartIdx: null,
    xDateString: "",
    pixXSnap: 0,
    pixXUnlimSnap: 0,
    xUnlimited: 0,
  },
  click: { clickedSubchartIdx: null },
};
export const defaultLightTheme = {
  isDarkMode: false,
  borderColor: "#000",
  backgroundColor: "#fff",
  crosshair: {
    useCrosshair: true,
    strokeColor: "#000",
    xMarkerBackgroundColor: "#fff",
    xMarkerFontName: "Arial",
    xMarkerFontSize: 14,
    xMarkerTextColor: "#000",
    xMarkerStrokeColor: "#000",
    yMarkerBackgroundColor: "#fff",
    yMarkerStrokeColor: "#000",
    yMarkerTextColor: "#000",
    yMarkerFontName: "Arial",
    yMarkerFontSize: 14,
  },
  grid: {
    useGridX: true,
    useGridY: true,
    strokeColor: "rgba(51,51,51, 0.2)",
    strokeStyle: "FUTURE",
  },
  yaxis: {
    widthYAxis: 80,
    widthTickmarkLines: 5,
    fillColor: "#fff",
    strokeColor: "#000",
    fontColor: "#000",
    fontSize: 14,
    fontName: "Arial",
  },
  xaxis: {
    heightXAxis: 36,
    heightTickMarkLines: 8,
    fillColor: "#fff",
    strokeColor: "#000",
    fontColor: "#000",
    fontSize: 14,
    fontName: "Arial",
  },
  draw: {
    strokeColor: "red",
    anchorColor: "#333",
  },
};

export const defaultDarkTheme = {
  ...defaultLightTheme,
  isDarkMode: true,
  crosshair: { ...defaultLightTheme.crosshair, strokeColor: "#bbb" },
  borderColor: "#666",
  draw: { strokeColor: "red", anchorColor: "#ccc" },
  grid: { ...defaultLightTheme.grid, strokeColor: "rgba(153,153,153, 0.08)" },
  yaxis: { ...defaultLightTheme.yaxis, fontColor: "#bbb", strokeColor: "#bbb" },
  backgroundColor: "#333",
};

export const defaultState: T.ChartState = {
  data: [],
  subCharts: [],
  // darkMode: false,
  fullscreen: false,
  draw: defaultDrawState,
  containerSize: defaultContainerSizeState,
  pointer: defaultPointerState,
  calc: {
    subcharts: [],
    xaxis: defaultCalcXaxis,
    pointer: defaultCalcPointer,
  },
  options: defaultLightTheme,
};

export const defaultDarkState: T.ChartState = {
  ...defaultState,
  options: defaultDarkTheme,
};
export const getInitSubchartsState = (
  isDarkMode: boolean,
  inputData?: T.ChartStateProps["data"]
): T.ChartState["subCharts"] => {
  let sIdx = -1;
  let gIdx = 0;
  const graphs: (T.ChartGraphState & { subchartIdx: number; yaxisIdx: number; graphIdx: number })[] = !inputData
    ? []
    : (
        inputData
          .map((inputDat, inputDatIdx) => {
            if (
              sIdx === -1 ||
              (isNullish(inputDat?.graphProps?.subchartIdx) &&
                (inputDat.type === "chart" ||
                  (inputDat.type === "indicator" && inputDat.indicator.default.newSubchart)))
            ) {
              sIdx++;
              gIdx = 0;
            } else {
              gIdx++;
            }
            // const yIdx = 0;

            if (inputDat.type === "chart") {
              const chartType =
                ["line", "candles", "area"].find((val) => val === inputDat?.graphProps?.chartType) ?? "candles";

              return {
                dataId: inputDat.id, // inputDat.id, check initLoadData
                dataIdx: inputDatIdx,
                type: "chart",
                chartType,
                style: {
                  ...defaultCandleChartStyle,
                  strokeColor: isDarkMode
                    ? defaultDarkLineChartStyle.strokeColor[0]
                    : defaultLineChartStyle.strokeColor[0],
                  ...inputDat?.graphProps?.style,
                },
                subchartIdx: inputDat?.graphProps?.subchartIdx ?? sIdx,
                yaxisIdx: 0,
                graphIdx: inputDat?.graphProps?.graphIdx ?? gIdx,
              };
            } else if (inputDat.type === "indicator") {
              return {
                dataId: inputDat.id ?? "", //indSrcDataIdx,
                dataIdx: inputDatIdx,
                type: "indicator",
                style: {
                  strokeColor: inputDat?.graphProps?.style?.strokeColor
                    ? inputDat.graphProps.style.strokeColor
                    : inputDat.indicator.graphTypes.length <= 1
                    ? defaultLineChartStyle.strokeColor
                    : isDarkMode
                    ? graphColorsDark.slice(0, inputDat.indicator.graphTypes.length)
                    : graphColorsLight.slice(0, inputDat.indicator.graphTypes.length),
                },
                subchartIdx: inputDat?.graphProps?.subchartIdx ?? sIdx,
                yaxisIdx: 0,
                graphIdx: inputDat?.graphProps?.graphIdx ?? gIdx,
              };
            } else return null;
          })
          .filter((val) => !!val) as (T.ChartGraphState & { subchartIdx: number; yaxisIdx: number; graphIdx: number })[]
      ).sort((a, b) =>
        a && b && a.subchartIdx !== b.subchartIdx
          ? a.subchartIdx - b.subchartIdx
          : a && b && a.subchartIdx === b.subchartIdx
          ? a.graphIdx - b.graphIdx
          : 0
      );
  const amtSubcharts = uniq(graphs?.map((graph) => graph.subchartIdx));
  const subcharts2 = amtSubcharts.map((s, sIdx) => ({
    top: 0, // calculated with containerResize
    bottom: 0, // calculated with containerResize
    yaxis: [0].map((y, yIdx) => ({
      tools: [],
      graphs: graphs
        ?.filter((val) => val.subchartIdx === sIdx)
        .map((graph) => {
          const { subchartIdx, yaxisIdx, graphIdx, ...graphRest } = graph;
          return graphRest;
        }),
    })),
  }));
  return subcharts2;
};

export const getInitState = (
  initialState?: T.ChartStateProps["settings"]["initialState"],
  initWidthPerTick?: number
): T.ChartState => {
  const isDarkMode = (prefersDarkMode && initialState?.isDarkMode === undefined) || !!initialState?.isDarkMode;
  const defaultStateInt: T.ChartState = isDarkMode ? defaultDarkState : defaultState;
  const defaultStateProc: T.ChartState = !initWidthPerTick
    ? defaultStateInt
    : setStateProp(defaultStateInt, ["calc", "xaxis"], {
        ...defaultStateInt.calc.xaxis,
        initialWidthPerTick: initWidthPerTick,
        scaledWidthPerTick: initWidthPerTick,
      });

  const initState: T.ChartState = {
    ...defaultStateProc,
    subCharts: [],
    options: {
      ...initialState,
      ...defaultStateProc.options,
      grid: { ...defaultStateProc.options.grid, ...initialState?.grid },
      yaxis: { ...defaultStateProc.options.yaxis, ...initialState?.yaxis },
      xaxis: { ...defaultStateProc.options.xaxis, ...initialState?.xaxis },
      crosshair: { ...defaultStateProc.options.crosshair, ...initialState?.crosshair },
      draw: { ...defaultStateProc.options.draw, ...initialState?.draw },
    },
  };
  return initState;
};

export const getDefaultChartInteractions = (initialChartState: T.ChartState): T.ChartInteractions => {
  return {
    calc: { subcharts: [], pointer: initialChartState.calc.pointer, xaxis: initialChartState.calc.xaxis },
    containerSize: initialChartState.containerSize,
    pointer: initialChartState.pointer,
    stateControl: {
      prevAction: null,
      lastMainChartData: [],
      // lastUpdate: new Date(),
      shallUpdate: [],
      customEffectChartState: null,
    },
  };
};

export const graphColorsLight: string[] = ["#666", "#0693E3", "#f50057", "#00D084", "#FF6900", "#bd10e0", "#bbb"];
export const graphColorsDark: string[] = ["#bbb", "#0693E3", "#f50057", "#00D084", "#FF6900", "#bd10e0", "#bbb"];
export const getGraphColors = (colorArr: string[], idx: number) => colorArr[idx % colorArr.length];

export const defaultCandleChartStyle = {
  candleStrokeColor: "transparent",
  candleWickStrokeColor: "#666",
  candleDownColor: "#c70039",
  candleUpColor: "#009688",
};

export const defaultLineChartStyle = {
  strokeColor: ["#666"],
};

export const defaultDarkLineChartStyle = {
  strokeColor: ["#bbb"],
};

export const getDefaultGraphStyle = (
  type: T.GraphState["type"],
  darkMode?: boolean,
  graphIdx?: number,
  indicatorLines?: number
): T.GraphState["style"] => {
  if (type === "indicator") {
    return !indicatorLines || indicatorLines <= 1
      ? { strokeColor: [getGraphColors(darkMode ? graphColorsDark : graphColorsLight, graphIdx ?? 0)] }
      : { strokeColor: (darkMode ? graphColorsDark : graphColorsLight).slice(0, indicatorLines) };
  } else {
    return {
      ...defaultCandleChartStyle,
      strokeColor: getGraphColors(darkMode ? graphColorsDark : graphColorsLight, graphIdx ?? 0),
    };
  }
};
