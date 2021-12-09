import deepEqual from "lodash/isEqual";
import { defaultTools } from "../../Tools";
import { updateChartDataAndDeps, updateIndicatorData } from "./DataFactory";
import { addSubchart, removeSubchart, addGraph, removeGraph, addInitialData, clearChart } from "./Factory";
import { swapSubcharts } from "./SubchartFactory";
import { getStateProp, removeStateProp, setStateProp } from "../../utils/React";
import { isNullish } from "../../utils/Basics";
import * as defaults from "../Defaults";
import * as T from "../../Types";

const generalProps: { prop: T.ReducerSetGeneralProps; path: (string | number)[]; toggle?: boolean }[] = [
  { prop: "backgroundColor", path: ["style", "backgroundColor"] },
  { prop: "crosshairStrokeColor", path: ["style", "crosshair", "strokeColor"] },
  { prop: "crosshairXmarkerBackgroundColor", path: ["style", "crosshair", "xMarkerBackgroundColor"] },
  { prop: "crosshairXmarkerStrokeColor", path: ["style", "crosshair", "xMarkerStrokeColor"] },
  { prop: "crosshairXmarkerTextColor", path: ["style", "crosshair", "xMarkerTextColor"] },
  { prop: "crosshairYmarkerBackgroundColor", path: ["style", "crosshair", "yMarkerBackgroundColor"] },
  { prop: "crosshairYmarkerStrokeColor", path: ["style", "crosshair", "yMarkerStrokeColor"] },
  { prop: "crosshairYmarkerTextColor", path: ["style", "crosshair", "yMarkerTextColor"] },
  { prop: "gridStrokeColor", path: ["style", "grid", "strokeColor"] },
  { prop: "toggleCrosshair", path: ["style", "crosshair", "useCrosshair"], toggle: true },
  { prop: "toggleFullscreen", path: ["fullscreen"], toggle: true },
  { prop: "toggleGridX", path: ["style", "grid", "useGridX"], toggle: true },
  { prop: "toggleGridY", path: ["style", "grid", "useGridY"], toggle: true },
  { prop: "xAxisFillColor", path: ["style", "xaxis", "fillColor"] },
  { prop: "xAxisStrokeColor", path: ["style", "xaxis", "strokeColor"] },
  { prop: "xAxisTextColor", path: ["style", "xaxis", "fontColor"] },
  { prop: "yAxisStrokeColor", path: ["style", "yaxis", "strokeColor"] },
  { prop: "yAxisTextColor", path: ["style", "yaxis", "fontColor"] },
];

export const chartStateReducer = (current: T.ChartState, action: T.ReducerAction<T.ReducerTask>): T.ChartState => {
  if (T.isModifyIndicatorDataAction(action)) {
    const { dataId, newIndSrcId, newParam, prevData } = action.params;
    const dataGraph = current.data.find((dat) => dat.id === dataId);
    if (dataGraph?.type !== "indicator") return current;
    const newParams =
      newParam &&
      dataGraph.indicator.params.map((param, pIdx) =>
        pIdx !== newParam?.paramIdx ? param : { ...param, val: newParam.newValue }
      );
    return {
      ...current,
      data: updateIndicatorData(current, dataId, { newParams, newIndSrcId }, prevData),
    };
  }
  if (T.isModifyChartDataAction(action)) {
    const { dataId, newDatasets } = action.params;
    return updateChartDataAndDeps(current, dataId, newDatasets);
  }
  if (T.isSetToolPropAction(action)) {
    const { newValue, prop, subchartIdx, yaxisIdx, toolIdx, toolParamIdx } = action.params;
    const tool = current.subCharts[subchartIdx].yaxis[yaxisIdx].tools[toolIdx];
    return prop === "strokeColor" || prop === "anchorColor"
      ? setStateProp(current, ["subCharts", subchartIdx, "yaxis", yaxisIdx, "tools", toolIdx, "style", prop], newValue)
      : prop === "hLineYlevel"
      ? setStateProp(
          current,
          ["subCharts", subchartIdx, "yaxis", yaxisIdx, "tools", toolIdx, "xy"],
          [[tool.xy[0][0], newValue]]
        )
      : prop === "toolParam" && !isNullish(toolParamIdx)
      ? setStateProp(
          current,
          ["subCharts", subchartIdx, "yaxis", yaxisIdx, "tools", toolIdx, "params", toolParamIdx, "val"],
          newValue
        )
      : current;
  } else if (T.isSetGraphPropAction(action)) {
    const { newValue, prop, subchartIdx, yaxisIdx, graphIdx } = action.params;
    return ["strokeColor", "candleDownColor", "candleUpColor", "candleStrokeColor", "candleWickStrokeColor"].includes(
      prop
    )
      ? setStateProp(
          current,
          ["subCharts", subchartIdx, "yaxis", yaxisIdx, "graphs", graphIdx, "style", prop],
          newValue
        )
      : prop === "chartType" && (newValue === "line" || newValue === "candles")
      ? setStateProp(current, ["subCharts", subchartIdx, "yaxis", yaxisIdx, "graphs", graphIdx, "chartType"], newValue)
      : prop === "dataId"
      ? setStateProp(current, ["subCharts", subchartIdx, "yaxis", yaxisIdx, "graphs", graphIdx, "dataId"], newValue)
      : current;
  } else if (T.isSetGeneralPropAction(action)) {
    const { newValue: newValueIn, prop } = action.params;
    const gprop = generalProps?.find((gprop) => gprop.prop === prop);
    if (!gprop) return current;
    const { path, toggle } = gprop;
    const newValue = toggle ? !getStateProp(current, path) : newValueIn;
    return setStateProp(current, path, newValue);
  } else if (T.isAddDataAction(action)) {
    return addInitialData(current, action.params);
  } else if (T.isAddSubchartAction(action)) {
    return addSubchart(current, action.params);
  } else if (T.isRemoveSubchartAction(action)) {
    return removeSubchart(current, action.params);
  } else if (T.isAddGraphAction(action)) {
    return addGraph(current, action.params);
  } else if (T.isRemoveGraphAction(action)) {
    return removeGraph(current, action.params);
  } else if (T.isSwapSubchartsAction(action)) {
    return swapSubcharts(current, action.params);
  } else if (T.isRemoveToolAction(action)) {
    const { subchartIdx, yaxisIdx, toolIdx } = action.params;
    return removeStateProp(current, ["subCharts", subchartIdx, "yaxis", yaxisIdx, "tools", toolIdx]);
  } else if (T.isClearChartAction(action)) {
    return clearChart(current, action.params);
  } else if (T.isSetThemeAction(action)) {
    const { theme } = action.params;
    const { name, ...style } = theme;
    const baseTheme = style.isDarkMode ? defaults.defaultDarkTheme : defaults.defaultLightTheme;
    return {
      ...current,
      options: {
        ...baseTheme,
        ...style,
        crosshair: { ...baseTheme.crosshair, ...style.crosshair },
        draw: { ...baseTheme.draw, ...style.draw },
        grid: { ...baseTheme.grid, ...style.grid },
        xaxis: { ...baseTheme.xaxis, ...style.xaxis },
        yaxis: { ...baseTheme.yaxis, ...style.yaxis },
      },
    };
  } else if (T.isDrawAction(action)) {
    const xy = action.params.xy;
    const nPoints = defaultTools.find((tool) => tool.type === action.params.type)?.nPoints;
    if (!nPoints || !action.params.type) {
      return { ...current, draw: defaults.defaultDrawState };
    }
    // init draw command -> switch to draw mode
    else if (!xy && !!action.params.type) {
      return {
        ...current,
        draw: { ...current.draw, isDrawing: true, xy: [], type: action.params.type },
      };
    }
    return current;
  } else if (T.isUpdateInteractionState(action)) {
    const xaxis = !deepEqual(current.calc.xaxis, action.params.newState.calc.xaxis)
      ? { xaxis: { ...current.calc.xaxis, ...action.params.newState.calc.xaxis } }
      : {};
    const subCharts = !deepEqual(current.subCharts, action.params.newState.subCharts)
      ? { subCharts: action.params.newState.subCharts }
      : {};
    const containerSize = !deepEqual(current.containerSize, action.params.newState.containerSize)
      ? { containerSize: action.params.newState.containerSize }
      : {};

    return {
      ...current,
      ...containerSize,
      ...subCharts,
      pointer: action.params.newState.pointer,
      draw: action.params.newState.draw,
      calc: { ...current.calc, ...action.params.newState.calc, ...xaxis },
    };
  }
  return current;
};
