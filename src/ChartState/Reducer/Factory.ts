import uniq from "lodash/uniq";
import { createChartData, createData, createIndicatorData, getIndicatorsCalcDepIndicatorDatas } from "./DataFactory";
import { createSubChartModel, createChartGraphModel } from "./SubchartFactory";
import { createIndicatorGraphModel, resizeSubcharts } from "./SubchartFactory";
import { getDefaultGraphStyle, getGraphColors, getInitSubchartsState } from "../Defaults";
import { graphColorsDark, graphColorsLight } from "../Defaults";
import { resizeContainer } from "../Interactions";
import { setStateProp, removeStateProp } from "../../utils/React";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";

export const addSubchart = (current: T.ChartState, params: T.ReducerAction<"addSubchart">["params"]): T.ChartState => {
  const { dataSeries: srcData, graphName, id, indicator, reset, indSrcId } = params;
  // currently all new subcharts are indicators!
  const containerHeight = current.containerSize.height;
  const data = createData(srcData, graphName, id, indicator, indSrcId);
  if (!data) return current;
  const indicatorLines = data.type === "indicator" ? data.indicator.graphTypes.length : undefined;
  const style = getDefaultGraphStyle(data.type, current.options.isDarkMode, undefined, indicatorLines);
  const dataId = data.id;
  if (current.subCharts.length === 0 || !!reset) {
    const top = 0;
    const bottom = containerHeight - current.options.xaxis.heightXAxis;
    const newSubchart = createSubChartModel({ top, bottom, dataId, style, indicator, type: data.type });
    if (!newSubchart) return current;
    return {
      ...current,
      data: [data],
      subCharts: [newSubchart],
    };
  } else {
    const subchartsHeight = containerHeight - current.options.xaxis.heightXAxis;
    const subCharts = resizeSubcharts({
      subchartsHeight,
      subCharts: current.subCharts,
      addSubchart: { data, darkMode: current.options.isDarkMode },
    });
    return {
      ...current,
      data: [...current.data, data],
      subCharts,
    };
  }
};

export const removeSubchart = (
  current: T.ChartState,
  params: T.ReducerAction<"removeSubchart">["params"]
): T.ChartState => {
  const { subchartIdx: delSubIdx } = params;
  const dataIds = current.subCharts[delSubIdx].yaxis.map((yaxi) => yaxi.graphs.map((graph) => graph.dataId)).flat();
  const subchartsHeight = current.containerSize.height - current.options.xaxis.heightXAxis;
  const subCharts = resizeSubcharts({
    subchartsHeight,
    subCharts: current.subCharts,
    removeSubchartIdx: delSubIdx,
  });
  return {
    ...current,
    data: current.data.filter((singleData) => !dataIds.includes(singleData.id)),
    subCharts,
  };
};

export const addGraph = (current: T.ChartState, params: T.ReducerAction<"addGraph">["params"]): T.ChartState => {
  const { dataSeries, graphName, subchartIdx, id, indSrcId, indicator, indSrcLineIdx } = params;
  const newGraphIdx = current.subCharts[subchartIdx].yaxis[0].graphs.length;
  const getStrokeColor = (idx: number) =>
    getGraphColors(current.options.isDarkMode ? graphColorsDark : graphColorsLight, idx);
  if ((!indSrcId && indicator) || (indSrcId && !indicator)) return current;
  const data = createData(dataSeries, graphName, id, indicator, indSrcId, indSrcLineIdx);
  if (!data) return current;
  const dataId = data.id;
  const indicatorLines = data.type === "indicator" ? data.indicator.graphTypes.length : undefined;
  const style = getDefaultGraphStyle(data.type, current.options.isDarkMode, newGraphIdx, indicatorLines);
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
  const subchart = current.subCharts[subchartIdx];
  return setStateProp(setStateProp(current, ["data"], [...current.data, data]), ["subCharts", subchartIdx], {
    ...subchart,
    yaxis: [{ ...subchart.yaxis[0], graphs: [...subchart.yaxis[0].graphs, graph] }],
  });
};

export const removeGraph = (current: T.ChartState, params: T.ReducerAction<"removeGraph">["params"]): T.ChartState => {
  const { subchartIdx: delSubIdx, yaxisIdx: delYIdx, graphIdx: delGraphIdx } = params;
  const dataId = current.subCharts[delSubIdx].yaxis[delYIdx].graphs[delGraphIdx].dataId;
  const subchart = current.subCharts[delSubIdx];
  if (delGraphIdx === 0 && subchart.yaxis[delYIdx].graphs.length === 1) {
    return removeSubchart(current, { subchartIdx: delSubIdx });
  } else {
    return setStateProp(
      removeStateProp(current, ["subCharts", delSubIdx, "yaxis", delYIdx, "graphs", delGraphIdx]),
      ["data"],
      current.data.filter((val) => val.id !== dataId)
    );
  }
};

export const addInitialData = (current: T.ChartState, params: T.ReducerAction<"addData">["params"]): T.ChartState => {
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
      .map((inputDat, inputDatIdx) =>
        inputDat.type === "indicator" && !isNullish(inputDat?.id)
          ? getIndicatorsCalcDepIndicatorDatas(intInputData as any, inputDat.id)
          : null
      )
      .flat()
      .filter((val) => val !== null) as unknown as string[]
  );
  const chartDatas = intInputData.map((dat) =>
    dat.type === "chart" ? createChartData(dat.data, dat.name, dat.id) : null
  );
  const datasCopy = [...chartDatas] as (T.Data | null)[];
  sequencedIndiTest.forEach((dataId, i) => {
    const inputDatIdx = intInputData?.findIndex((dat, dIdx) => dat.id === dataId); // [dataIdx];
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
  const initSubcharts = inputData ? getInitSubchartsState(current.options.isDarkMode, inputData) : [];
  const subCharts = resizeContainer(current.containerSize.height, initSubcharts, current.options);
  return { ...current, subCharts, data: finalDatas };
};

export const clearChart = (current: T.ChartState, params: T.ReducerAction<"clearChart">["params"]) => {
  const { mode } = params;
  const clearedSubcharts = current.subCharts
    .map((sub, sIdx) =>
      mode === "tools" || sIdx === 0
        ? {
            ...sub,
            bottom:
              mode !== "tools" ? current.containerSize.height - 1 - current.options.xaxis.heightXAxis : sub.bottom,
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
        setStateProp(current, ["subCharts"], clearedSubcharts),
        ["data"],
        [current.data.find((val) => val.id === current.subCharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.dataId)]
      )
    : mode === "tools"
    ? setStateProp(current, ["subCharts"], clearedSubcharts)
    : current;
};
