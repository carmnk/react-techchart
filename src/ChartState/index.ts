// import { createChartData, updateChartData, updateChartDataAndDeps, getDateStat } from "./Factory/ChartDataFactory";
// const Testing = {createChartData,
//   updateChartData,
//   updateChartDataAndDeps,
//   getDateStat,}
export * as FactoryTesting from "./Factory/Factory";

export {
  prefersDarkMode,
  defaultContainerSizeState,
  defaultPointerState,
  defaultDrawState,
  defaultCalcXaxis,
  defaultCalcPointer,
  defaultLightTheme,
  defaultDarkTheme,
  defaultState,
  defaultDarkState,
  getInitSubchartsState,
  getInitState,
  getDefaultChartInteractions,
  graphColorsLight,
  graphColorsDark,
  getGraphColors,
  defaultCandleChartStyle,
  defaultLineChartStyle,
  defaultDarkLineChartStyle,
  getDefaultGraphStyle,
} from "./Defaults";

export { chartPeriods, getDateString, getUnitOfDate, getDateUnits } from "./utils/DateTime";
export {
  purePixToX,
  purePixToY,
  pureXToPix,
  pureYToPix,
  getDataSeriesMaxY,
  getDataSeriesMinY,
  snapPixYToDataset,
  getSubchartIdxByPixXy,
  snapToolsByXy,
  getMaxDataSeriesDecimals,
} from "./utils/Utils";

export { useChartController } from "./useChartController";
