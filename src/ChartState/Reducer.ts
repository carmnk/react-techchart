import { updateIndicatorData } from "./Factory/IndicatorDataFactory";
import { addSubchart, removeSubchart, addGraph, removeGraph, initData, clearChart } from "./Factory/Factory";
import { modifyGraphProp, modifyToolProp, removeTool, swapSubcharts } from "./Factory/SubchartFactory";
import { updateChartDataAndDeps } from "./Factory/ChartDataFactory";
import { startDrawing } from "./Interactions/CalcInteractions";
import { interactionsUpdate } from "./Interactions/InteractionsUpdate";
import { getStateProp, setStateProp } from "../utils/React";
import * as defaults from "./Defaults";
import * as T from "../Types";
import type { AlertProps } from "@mui/material/Alert";

const generalProps: { prop: T.ReducerSetGeneralProps; path: (string | number)[]; toggle?: boolean }[] = [
  { prop: "backgroundColor", path: ["theme", "backgroundColor"] },
  { prop: "crosshairStrokeColor", path: ["theme", "crosshair", "strokeColor"] },
  { prop: "crosshairXmarkerBackgroundColor", path: ["theme", "crosshair", "xMarkerBackgroundColor"] },
  { prop: "crosshairXmarkerStrokeColor", path: ["theme", "crosshair", "xMarkerStrokeColor"] },
  { prop: "crosshairXmarkerTextColor", path: ["theme", "crosshair", "xMarkerTextColor"] },
  { prop: "crosshairYmarkerBackgroundColor", path: ["theme", "crosshair", "yMarkerBackgroundColor"] },
  { prop: "crosshairYmarkerStrokeColor", path: ["theme", "crosshair", "yMarkerStrokeColor"] },
  { prop: "crosshairYmarkerTextColor", path: ["theme", "crosshair", "yMarkerTextColor"] },
  { prop: "gridStrokeColor", path: ["theme", "grid", "strokeColor"] },
  { prop: "toggleCrosshair", path: ["theme", "crosshair", "useCrosshair"], toggle: true },
  { prop: "toggleFullscreen", path: ["fullscreen"], toggle: true },
  { prop: "toggleGridX", path: ["theme", "grid", "useGridX"], toggle: true },
  { prop: "toggleGridY", path: ["theme", "grid", "useGridY"], toggle: true },
  { prop: "xAxisFillColor", path: ["theme", "xaxis", "fillColor"] },
  { prop: "xAxisStrokeColor", path: ["theme", "xaxis", "strokeColor"] },
  { prop: "xAxisTextColor", path: ["theme", "xaxis", "fontColor"] },
  { prop: "yAxisStrokeColor", path: ["theme", "yaxis", "strokeColor"] },
  { prop: "yAxisTextColor", path: ["theme", "yaxis", "fontColor"] },
];

const setGeneralProp = (current: T.ChartState, params: T.ReducerAction<"setGeneralProp">["params"]) => {
  const { newValue: newValueIn, prop } = params;
  const gprop = generalProps?.find((gprop) => gprop.prop === prop);
  if (!gprop) return current;
  const { path, toggle } = gprop;
  const newValue = toggle ? !getStateProp(current, path) : newValueIn;
  return setStateProp(current, path, newValue);
};

const setTheme = (current: T.ChartState, params: T.ReducerAction<"setTheme">["params"]) => {
  const { theme } = params;
  const { name, ...namelessTheme } = theme;
  const baseTheme = namelessTheme.isDarkMode ? defaults.defaultDarkTheme : defaults.defaultLightTheme;
  return {
    ...current,
    theme: {
      ...baseTheme,
      ...namelessTheme,
      crosshair: { ...baseTheme.crosshair, ...namelessTheme.crosshair },
      draw: { ...baseTheme.draw, ...namelessTheme.draw },
      grid: { ...baseTheme.grid, ...namelessTheme.grid },
      xaxis: { ...baseTheme.xaxis, ...namelessTheme.xaxis },
      yaxis: { ...baseTheme.yaxis, ...namelessTheme.yaxis },
    },
  };
};

const setPointerEventsIntern = (current: T.ChartState, disablePointerEvents: boolean) => {
  return { ...current, menu: { ...current.menu, disablePointerEvents: disablePointerEvents } };
};
const addSnackbarMessage = (current: T.ChartState, text: string, type: AlertProps["severity"]) => {
  console.log(type, text);
  return { ...current, menu: { ...current.menu, snackbars: [...current.menu.snackbars, { text, type }] } };
};
const removeSnackbarMessage = (current: T.ChartState) => {
  return {
    ...current,
    menu: { ...current.menu, snackbars: current.menu.snackbars.length > 1 ? current.menu.snackbars.slice(1) : [] },
  };
};

export const chartStateReducer = (current: T.ChartState, action: T.ReducerAction<T.ReducerTask>): T.ChartState => {
  // general
  if (T.isSetGeneralPropAction(action)) {
    return setGeneralProp(current, action.params);
  } else if (T.isClearChartAction(action)) {
    return clearChart(current, action.params);
  } else if (T.isSetThemeAction(action)) {
    return setTheme(current, action.params);
  }
  // data
  else if (T.isModifyIndicatorDataAction(action)) {
    return { ...current, data: updateIndicatorData(current, action.params) };
  } else if (T.isModifyChartDataAction(action)) {
    return updateChartDataAndDeps(current, action.params.dataId, action.params.newDatasets);
  } else if (T.isInitDataAction(action)) {
    return initData(current, action.params);
  }
  // subcharts
  else if (T.isAddSubchartAction(action)) {
    return addSubchart(current, action.params);
  } else if (T.isRemoveSubchartAction(action)) {
    return removeSubchart(current, action.params);
  } else if (T.isAddGraphAction(action)) {
    return addGraph(current, action.params);
  } else if (T.isRemoveGraphAction(action)) {
    return removeGraph(current, action.params);
  } else if (T.isSetToolPropAction(action)) {
    return modifyToolProp(current, action.params);
  } else if (T.isSetGraphPropAction(action)) {
    return modifyGraphProp(current, action.params);
  } else if (T.isSwapSubchartsAction(action)) {
    return swapSubcharts(current, action.params);
  } else if (T.isRemoveToolAction(action)) {
    return removeTool(current, action.params);
  }
  // interactions
  else if (T.isStartDrawingAction(action)) {
    return startDrawing(current, action.params);
  } else if (T.isUpdateInteractionState(action)) {
    return interactionsUpdate(current, action.params);
  } else if (T.isSetPointerEvents(action)) {
    return setPointerEventsIntern(current, action.params.disablePointerEvents);
  } else if (T.isAddSnackbarMessageAction(action))
    return addSnackbarMessage(current, action.params.text, action.params.type);
  else if (T.isRemoveSnackbarMessageAction(action)) return removeSnackbarMessage(current);
  return current;
};
