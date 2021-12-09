import React from "react";
import useFullscreen from "react-use/lib/useFullscreen";
import { chartStateReducer } from "./Reducer/Reducer";
import { calculateSubcharts, getYaxisMethods } from "./Calc/CalcSubcharts";
import { resizeContainer, resizeSubchart, getAction } from "./Interactions";
import { drawTool, editToolPosition } from "./ToolInteractions";
import { getInitState } from "./Defaults";
import { calculateXaxis, jumpToXaxisEnd } from "./Calc/CalcXaxis";
import deepEqual from "lodash/isEqual";
import { useChartInteractions } from "./useChartInteractions";
import { calculateCurrentPointerDataset } from "./Calc/CalcPointer";
import * as T from "../Types";
import { getRtTicks, isRtDataOutOfRange } from "./Calc/CalcRtData";
import { useReactiveInfo2 } from "../utils";

export const useChartState = (params: T.ChartStateProps): T.ChartStateHook => {
  const { data, rtData, width, height, settings } = params;
  const ContainerRef = React.useRef<HTMLDivElement | null>(null);
  const initialState = React.useMemo(
    () => getInitState(settings.initialState, settings.initWidthPerTick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // settings are not reactive
  );
  /* shortcuts and default values for settings */
  const maxUpdatesPerSec = settings.maxUpdatesPerSec ? settings.maxUpdatesPerSec : 15;
  const disablePointerEvents = settings.disablePointerEvents;

  const [ChartState, Dispatch] = React.useReducer<
    (prevState: T.ChartState, action: T.ReducerAction<T.ReducerTask>) => T.ChartState
  >(chartStateReducer, initialState);
  // collects pointer, containerResize, calc and  stateControl data in mutable reference (not reactive)
  const fullscreen = ChartState.fullscreen;
  const ChartInteractionsRef = useChartInteractions(ContainerRef, initialState, width, height, settings, fullscreen);

  // if rt-data is provided, it has to be injected in effect below without restarting effect each time new rt-data is provided
  if (rtData) ChartInteractionsRef.current.rtData = rtData;

  useFullscreen(ContainerRef, fullscreen, {
    onClose: () =>
      Dispatch({
        task: "setGeneralProp",
        params: { prop: "toggleFullscreen" },
      }),
  });

  // Custom Effect
  const { xy, ...CustomEffectDrawState } = ChartState.draw;
  const CustomEffectChartState: T.CustomEffectChartState = {
    subcharts: ChartState.subCharts.map((subchart) => ({
      yaxis: subchart.yaxis,
    })),
    draw: { ...CustomEffectDrawState, nPixXy: xy.length },
  };
  if (!deepEqual(ChartInteractionsRef.current.stateControl.customEffectChartState, CustomEffectChartState)) {
    ChartInteractionsRef.current.stateControl.customEffectChartState = CustomEffectChartState;
  }
  React.useEffect(() => {
    const onTimer = () => {
      const PreState = ChartInteractionsRef.current;
      let stateControl = PreState.stateControl;
      if (disablePointerEvents) {
        PreState.pointer.drag = {
          ...PreState.pointer.drag,
          delta: [0, 0],
          movementInitial: [0, 0],
        };
        return;
      }
      const subcharts = ChartState.subCharts;
      const isRtOutOfRange = isRtDataOutOfRange(PreState.rtData, subcharts, PreState.calc);
      console.log(isRtDataOutOfRange);
      // const rtData = isRtOutOfRange ? PreState.rtData : undefined;
      if (stateControl.shallUpdate.length > 0 || isRtOutOfRange) {
        if (!stateControl.shallUpdate.includes("dragEnd")) PreState.pointer.dragPointerUp.isDragPointerUp = false;
        const heightXaxis = ChartState.options.xaxis.heightXAxis;
        const containerWidth = PreState.containerSize.width - 1;
        const containerHeight = PreState.containerSize.height;
        const mainGraph =
          !!subcharts?.[0]?.yaxis?.[0]?.graphs?.[0] && T.isChartGraph(subcharts[0].yaxis[0].graphs[0])
            ? subcharts[0].yaxis[0].graphs[0]
            : null;
        const mainGraphData = ChartState.data.find((val) => val.id === mainGraph?.dataId);
        const isDrawing = ChartState.draw.isDrawing;
        const { action, stateControl: updatedStateControl } = getAction(PreState, subcharts, isDrawing, heightXaxis);
        stateControl = {
          ...updatedStateControl,
          prevAction: !action ? null : { ...action },
        };
        ChartInteractionsRef.current.stateControl = updatedStateControl;

        const subchartsCRs = action.containerResize
          ? resizeContainer(containerHeight, subcharts, ChartState.options)
          : subcharts;
        const subchartsRs =
          action?.drag?.type === "resizeSubchart"
            ? resizeSubchart(action, subchartsCRs, PreState.pointer.drag)
            : subchartsCRs;
        // if new chart is added or replacing current chart or chart is reset/cleared -> initial translatedX to end of chart is calculated in reducer
        if (stateControl.lastMainChartData !== mainGraphData?.data ?? null) {
          if (mainGraphData?.type === "chart")
            PreState.calc.xaxis = jumpToXaxisEnd(PreState.calc.xaxis, mainGraphData.data, containerWidth);
        }
        const calcXaxis = action.shallUpdateXaxis
          ? calculateXaxis(PreState, action, mainGraph, ChartState.data)
          : PreState.calc.xaxis;
        PreState.calc.xaxis = calcXaxis;
        const calcSubcharts =
          action.shallUpdateCalcSubcharts || isRtDataOutOfRange
            ? calculateSubcharts(subchartsRs, PreState.calc.xaxis, ChartState.data, PreState.rtData)
            : null;
        if (calcSubcharts) PreState.calc.subcharts = calcSubcharts;
        const calcPointer = stateControl.shallUpdate.includes("pointerMove")
          ? calculateCurrentPointerDataset(PreState.pointer, PreState.calc, subcharts, ChartState.data)
          : null;
        if (calcPointer) PreState.calc.pointer = calcPointer;
        const subchartsTe =
          action?.drag?.type === "editTool" && action?.drag?.shallUpdate
            ? editToolPosition(PreState, subchartsRs, action)
            : subchartsRs;
        const { subcharts: finalizedSubcharts, draw } =
          action?.drag?.type === "drawTool"
            ? drawTool(PreState, subchartsTe, ChartState.draw, ChartState.options)
            : { subcharts: subchartsTe, draw: ChartState.draw };
        const { stateControl: sOut, ...state } = PreState;
        const addCalcSubcharts = calcSubcharts
          ? {
              subcharts: calcSubcharts,
              ...getYaxisMethods(finalizedSubcharts, calcSubcharts),
            }
          : null;
        const addCalcPointer = calcPointer ? { pointer: calcPointer } : null;
        Dispatch({
          task: "updateInteractionState",
          params: {
            newState: {
              ...state,
              calc: {
                xaxis: calcXaxis,
                ...addCalcPointer,
                ...addCalcSubcharts,
              },
              subCharts: finalizedSubcharts,
              draw,
            },
          },
        });
        const graphDataSeries = ChartState.data.find(
          (val) => val.id === ChartState.subCharts?.[0].yaxis[0].graphs[0].dataId
        )?.data;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [],
            lastMainChartData: (graphDataSeries as T.ChartDataSeries) ?? null,
          },
        };
      }
    };
    ChartInteractionsRef.current.stateControl.shallUpdate.push("deps");
    onTimer(); // exec immmediately
    console.log("updated Timer");

    const handleTimer = window.setInterval(onTimer, Math.round(1000 / maxUpdatesPerSec));
    return () => {
      window.clearInterval(handleTimer);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ChartInteractionsRef.current.stateControl.customEffectChartState,
    maxUpdatesPerSec,
    disablePointerEvents,
    ChartState.options,
    ChartState.data,
  ]);

  React.useEffect(() => {
    if (!ChartState.containerSize.init) return;
    const mainchartIn = data?.[0];
    if (mainchartIn?.type !== "chart" || !mainchartIn?.data?.length) return;
    const dataMainchart = ChartState.data?.[0];
    if (ChartState.data.length === 0) {
      console.log("Chart is initialized. A");
      Dispatch({ task: "addData", params: { datas: data } });
      return;
    }

    if (dataMainchart.id === mainchartIn.id && dataMainchart.type === "chart") {
      if (mainchartIn.data.length === dataMainchart.data.length) {
        return;
      } else if (mainchartIn.data.length > dataMainchart.data.length) {
        console.log("Chart is updated");
        Dispatch({
          task: "modifyChartData",
          params: {
            dataId: dataMainchart.id,
            newDatasets: mainchartIn.data?.slice(dataMainchart.data.length),
          },
        });
      } else if (mainchartIn.data.length < dataMainchart.data.length) {
        console.log("HERE THERE SHOULD BE LOADED A NEW GRAPH");
      }
    }
  }, [data, ChartState.containerSize.init, ChartState.data, ChartState.subCharts]);

  const rtTicks = getRtTicks(rtData, ChartState.data, ChartState.subCharts, ChartState.calc);

  // const depInfo = useReactiveInfo2([ChartState, Dispatch, rtTicks, settings]);
  // console.log(depInfo?.[0]);
  // console.log(ChartState);
  return { ChartState, Dispatch, rtTicks, settings, ContainerRef };
};
