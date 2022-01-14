import React from "react";
import deepEqual from "lodash/isEqual";
import clone from "lodash/cloneDeep";
import { chartStateReducer } from "./Reducer";
import { getInitState } from "./Defaults";
import { useChartInteractions } from "./useChartInteractions";
import { getRtTicks, isRtDataOutOfRange } from "./Calc/CalcRtData";
// import { useReactiveInfo2 } from "../utils";
import * as T from "../Types";

export const useChartController: T.UseChartController = (params: T.UseChartControllerProps): T.ChartController => {
  const { data, rtData, settings, events } = params;
  const maxUpdatesPerSec = settings?.maxUpdatesPerSec || 15;
  const disablePointerEvents = events?.disablePointerEvents || false;
  const initialIndicators = React.useMemo(() => settings?.initialIndicators || [], [settings?.initialIndicators]);
  const initialTheme = React.useMemo(
    () => getInitState(settings?.initialTheme),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // not reactive!
  );
  const ContainerRef = React.useRef<HTMLDivElement | null>(null);
  const PointerContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [ChartState, Dispatch] = React.useReducer<
    (prevState: T.ChartState, action: T.ReducerAction<T.ReducerTask>) => T.ChartState
  >(chartStateReducer, initialTheme);
  const ChartInteractionsRef = useChartInteractions(ContainerRef, PointerContainerRef, ChartState, Dispatch, params);
  const ChartMemo = React.useRef<T.ChartMemo>({
    customEffectChartState: null,
  });
  const RtDataInjection = React.useRef<{ rtData: T.UseChartControllerProps["rtData"]; isRtOutOfRange: boolean }>({
    rtData,
    isRtOutOfRange: false,
  });
  if (rtData)
    RtDataInjection.current = {
      rtData,
      isRtOutOfRange: isRtDataOutOfRange(rtData, ChartState.subcharts, ChartState.calc),
    };

  // Custom Effect
  const { xy, ...CustomEffectDrawState } = ChartState.draw;
  const CustomEffectChartState: T.CustomEffectChartState = {
    subcharts: ChartState.subcharts.map((subchart) => ({
      yaxis: subchart.yaxis,
    })),
    draw: { ...CustomEffectDrawState, nPixXy: xy.length },
  };
  if (!deepEqual(ChartMemo.current.customEffectChartState, CustomEffectChartState)) {
    ChartMemo.current.customEffectChartState = CustomEffectChartState;
  }

  React.useEffect(() => {
    const onTimer = () => {
      const Interactions = clone(ChartInteractionsRef.current);
      const RtData = RtDataInjection.current;
      const stateControl = Interactions.stateControl;
      if (stateControl.shallUpdate.length > 0 || RtData.isRtOutOfRange) {
        if (!stateControl.shallUpdate.includes("dragEnd")) Interactions.pointer.dragPointerUp.isDragPointerUp = false;
        // console.log(stateControl.shallUpdate);
        Dispatch({
          task: "updateInteractionState",
          params: {
            Interactions,
            RtData,
            disablePointerEvents,
          },
        });
        ChartInteractionsRef.current.stateControl.shallUpdate = [];
      }
    };
    ChartInteractionsRef.current.stateControl.shallUpdate.push("deps");
    onTimer(); // exec immmediately
    // console.log("updated Timer");

    const handleTimer = window.setInterval(onTimer, Math.round(1000 / maxUpdatesPerSec));
    return () => {
      window.clearInterval(handleTimer);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ChartMemo.current.customEffectChartState,
    maxUpdatesPerSec,
    disablePointerEvents,
    ChartState.theme,
    ChartState.data,
  ]);

  React.useEffect(() => {
    // console.log("DATA PROP EFFECT")
    if (!ChartState.containerSize.init) return;
    const mainchartIn = data;
    if (mainchartIn?.type !== "chart" || !mainchartIn?.data?.length) return;
    const dataMainchart = ChartState.data?.[0];
    if (ChartState.data.length === 0) {
      // console.log("Chart is initialized.");
      Dispatch({ task: "initData", params: { datas: [data, ...initialIndicators] } });
      return;
    }

    if (dataMainchart.id === mainchartIn.id && dataMainchart.type === "chart") {
      if (mainchartIn.data.length === dataMainchart.data.length) {
        return;
      } else if (mainchartIn.data.length > dataMainchart.data.length) {
        // console.log("Chart is updated");
        Dispatch({
          task: "modifyChartData",
          params: {
            dataId: dataMainchart.id,
            newDatasets: mainchartIn.data?.slice(dataMainchart.data.length),
          },
        });
      } else if (mainchartIn.data.length < dataMainchart.data.length) {
        // load new graph?
      }
    } else {
      Dispatch({
        task: "addSubchart",
        params: { dataSeries: data.data, graphName: data.name, reset: true, id: data.id },
      });
    }
  }, [data, ChartState.containerSize.init, ChartState.data, ChartState.subcharts, initialIndicators]);

  const rtTicks = getRtTicks(rtData, ChartState.data, ChartState.subcharts, ChartState.calc);

  // const depInfo = useReactiveInfo2([ChartState, Dispatch, rtTicks, settings]);
  // console.log(depInfo?.[0]);
  return { ChartState, Dispatch, rtTicks, settings, ContainerRef, PointerContainerRef, events };
};
