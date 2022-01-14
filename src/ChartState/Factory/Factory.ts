import uniq from "lodash/uniq";
import { createIndicatorData, getIndicatorsCalcDepIndicatorDatas } from "./IndicatorDataFactory";
import { createSubChartModel, createChartGraphModel } from "./SubchartFactory";
import { createIndicatorGraphModel, resizeSubcharts } from "./SubchartFactory";
import { getDefaultGraphStyle, getGraphColors, getInitSubchartsState } from "../Defaults";
import { graphColorsDark, graphColorsLight } from "../Defaults";
import { resizeContainer } from "../Interactions/CalcInteractions";
import { setStateProp, removeStateProp } from "../../utils/React";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";
import { jumpToXaxisEnd } from "../Calc/CalcXaxis";
import { createChartData } from "./ChartDataFactory";

export const createData = (
  chartSeries: T.DataSeries,
  chartName: string,
  id: string,
  indicator?: T.IndicatorModel,
  indSrcId?: string,
  indSrcLineIdx?: number
): T.Data | null =>
  !!indicator && !!indSrcId
    ? createIndicatorData(chartSeries, indSrcId, indicator, indSrcLineIdx, id, chartName)
    : T.isChartDataSeries(chartSeries)
    ? createChartData(chartSeries, chartName, id)
    : null;

export const addSubchart = (current: T.ChartState, params: T.ReducerAction<"addSubchart">["params"]): T.ChartState => {
  const { dataSeries: srcData, graphName, id, indicator, reset, indSrcId } = params;
  // currently all new subcharts are indicators!
  const containerHeight = current.containerSize.height;
  const data = createData(srcData, graphName, id, indicator, indSrcId);
  if (!data) return current;
  const indicatorLines = data.type === "indicator" ? data.indicator.graphTypes.length : undefined;
  const style = getDefaultGraphStyle(data.type, current.theme.isDarkMode, undefined, indicatorLines);
  const dataId = data.id;
  if (current.subcharts.length === 0 || !!reset) {
    const top = 0;
    const bottom = containerHeight - current.theme.xaxis.heightXAxis;
    const newSubchart = createSubChartModel({ top, bottom, dataId, style, indicator, type: data.type });
    if (!newSubchart) return current;
    const calc = current.calc;
    const mainchartDataseries = [data]?.find?.((dat) => dat.id === dataId && dat.type === "chart")
      ?.data as T.ChartDataSeries;
    const containerWidth = current.containerSize.width;
    const xaxis =
      (mainchartDataseries && jumpToXaxisEnd(calc.xaxis, mainchartDataseries, containerWidth)) || current.calc.xaxis;
    return {
      ...current,
      data: [data],
      subcharts: [newSubchart],
      calc: { ...calc, xaxis },
    };
  } else {
    const subchartsHeight = containerHeight - current.theme.xaxis.heightXAxis;
    const resizedSubcharts = resizeSubcharts({
      subchartsHeight,
      subcharts: current.subcharts,
      addSubchart: { data, darkMode: current.theme.isDarkMode },
    });
    return {
      ...current,
      data: [...current.data, data],
      subcharts: resizedSubcharts,
    };
  }
};

export const removeSubchart = (
  current: T.ChartState,
  params: T.ReducerAction<"removeSubchart">["params"]
): T.ChartState => {
  const { subchartIdx: delSubIdx } = params;
  const dataIds = current.subcharts[delSubIdx].yaxis.map((yaxi) => yaxi.graphs.map((graph) => graph.dataId)).flat();
  const subchartsHeight = current.containerSize.height - current.theme.xaxis.heightXAxis;
  const subcharts = resizeSubcharts({
    subchartsHeight,
    subcharts: current.subcharts,
    removeSubchartIdx: delSubIdx,
  });
  return {
    ...current,
    data: current.data.filter((singleData) => !dataIds.includes(singleData.id)),
    subcharts,
  };
};

export const addGraph = (current: T.ChartState, params: T.ReducerAction<"addGraph">["params"]): T.ChartState => {
  const { dataSeries, graphName, subchartIdx, id, indSrcId, indicator, indSrcLineIdx } = params;
  const newGraphIdx = current.subcharts[subchartIdx].yaxis[0].graphs.length;
  const getStrokeColor = (idx: number) =>
    getGraphColors(current.theme.isDarkMode ? graphColorsDark : graphColorsLight, idx);
  if ((!indSrcId && indicator) || (indSrcId && !indicator)) return current;
  const data = createData(dataSeries, graphName, id, indicator, indSrcId, indSrcLineIdx);
  if (!data) return current;
  const dataId = data.id;
  const indicatorLines = data.type === "indicator" ? data.indicator.graphTypes.length : undefined;
  const style = getDefaultGraphStyle(data.type, current.theme.isDarkMode, newGraphIdx, indicatorLines);
  const graph =
    data.type === "indicator" && !!indicator && !!indSrcId
      ? createIndicatorGraphModel({
          dataId,
          style: style as T.IndicatorGraphState["style"],
        })
      : createChartGraphModel({ dataId, style: style as T.ChartGraphState["style"] });
  if (T.isIndicatorGraph(graph) && (data as T.IndicatorData).data[data.data.length - 1].prices.length > 1)
    graph.style.strokeColor = (data as T.IndicatorData).data[data.data.length - 1].prices.map((x, idx) =>
      getStrokeColor(idx)
    );
  const subchart = current.subcharts[subchartIdx];
  return setStateProp(setStateProp(current, ["data"], [...current.data, data]), ["subcharts", subchartIdx], {
    ...subchart,
    yaxis: [{ ...subchart.yaxis[0], graphs: [...subchart.yaxis[0].graphs, graph] }],
  });
};

export const removeGraph = (current: T.ChartState, params: T.ReducerAction<"removeGraph">["params"]): T.ChartState => {
  const { subchartIdx: delSubIdx, yaxisIdx: delYIdx, graphIdx: delGraphIdx } = params;
  const dataId = current.subcharts[delSubIdx].yaxis[delYIdx].graphs[delGraphIdx].dataId;
  const subchart = current.subcharts[delSubIdx];
  if (delGraphIdx === 0 && subchart.yaxis[delYIdx].graphs.length === 1) {
    return removeSubchart(current, { subchartIdx: delSubIdx });
  } else {
    return setStateProp(
      removeStateProp(current, ["subcharts", delSubIdx, "yaxis", delYIdx, "graphs", delGraphIdx]),
      ["data"],
      current.data.filter((val) => val.id !== dataId)
    );
  }
};

export const initData = (current: T.ChartState, params: T.ReducerAction<"initData">["params"]): T.ChartState => {
  const { datas: inputData } = params;
  const mainchartId = inputData?.[0]?.id as string;
  const intInputData = inputData.map((inputDat, inputDatIdx) =>
    inputDat.type === "chart"
      ? inputDat
      : {
          ...inputDat,
          indSrcId: inputDat.indSrcId ?? mainchartId,
          id: inputDat.id ?? "indi_" + inputDatIdx.toString().padStart(2, "0"),
        }
  );
  const sequencedIndiTest = uniq(
    intInputData
      .map((inputDat) =>
        inputDat.type === "indicator" && !isNullish(inputDat?.id)
          ? getIndicatorsCalcDepIndicatorDatas(intInputData, inputDat.id)
          : null
      )
      .flat()
      .filter((val) => val !== null) as string[]
  );
  const chartDatas = intInputData.map((dat) =>
    dat.type === "chart" ? createChartData(dat.data, dat.name, dat.id) : null
  );
  const datasCopy = [...chartDatas] as (T.Data | null)[];
  sequencedIndiTest.forEach((dataId) => {
    const inputDatIdx = intInputData?.findIndex((dat) => dat.id === dataId); // [dataIdx];
    const inputDat = intInputData?.[inputDatIdx];
    const indInputData = inputDat?.type === "indicator" ? inputDat : null;
    const indDataSrcId = indInputData?.indSrcId;
    const indSrcData = !isNullish(indDataSrcId) ? datasCopy?.find((dat) => dat?.id === indDataSrcId) : null;
    if (inputDat?.type === "indicator" && indSrcData && indInputData)
      datasCopy[inputDatIdx] = createIndicatorData(
        indSrcData?.data,
        indSrcData?.id,
        indInputData.indicator,
        undefined,
        dataId,
        indInputData.name
      );
  });
  const finalDatas = datasCopy.filter((val) => val !== null) as T.Data[];
  if (finalDatas.length !== intInputData.length) console.warn("Warning - not all indicators could be initialized.");
  const initSubcharts = inputData ? getInitSubchartsState(current.theme.isDarkMode, inputData) : [];
  const subcharts = resizeContainer(current.containerSize.height, { ...current, subcharts: initSubcharts });
  const calc = current.calc;
  const mainchartDataseries = finalDatas?.find?.((dat) => dat.id === mainchartId && dat.type === "chart")
    ?.data as T.ChartDataSeries;
  const containerWidth = current.containerSize.width;
  const xaxis =
    (mainchartDataseries && jumpToXaxisEnd(calc.xaxis, mainchartDataseries, containerWidth)) || current.calc.xaxis;
  return { ...current, subcharts, data: finalDatas, calc: { ...calc, xaxis } };
};

export const clearChart = (current: T.ChartState, params: T.ReducerAction<"clearChart">["params"]) => {
  const { mode } = params;
  const clearedSubcharts = current.subcharts
    .map((sub, sIdx) =>
      mode === "tools" || sIdx === 0
        ? {
            ...sub,
            bottom: mode !== "tools" ? current.containerSize.height - 1 - current.theme.xaxis.heightXAxis : sub.bottom,
            yaxis: sub.yaxis.map((yax) => ({
              ...yax,
              graphs: mode !== "tools" ? [yax.graphs?.[0]] : yax.graphs,
              tools: mode === "all" || mode === "tools" ? [] : yax.tools,
            })),
          }
        : null
    )
    .filter((sub) => sub !== null);
  return mode === "all" || mode === "indicators"
    ? setStateProp(
        setStateProp(current, ["subcharts"], clearedSubcharts),
        ["data"],
        [current.data.find((val) => val.id === current.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.dataId)]
      )
    : mode === "tools"
    ? setStateProp(current, ["subcharts"], clearedSubcharts)
    : current;
};
