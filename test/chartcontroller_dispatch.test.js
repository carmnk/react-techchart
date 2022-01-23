import React from "react";
import { act, render } from "@testing-library/react";
// import { render } from "react-dom";
// import { act } from "react-dom/test-utils";
import { Wrapper, defaultSettings } from "./utils/wrapper";
// import { iATR, iSMA, ATR, defaultLightTheme, defaultDarkTheme } from "../../lib";
const { iATR, iSMA, ATR, defaultLightTheme, defaultDarkTheme } = require("../lib");

let container;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  if (container) document.body.removeChild(container);
  container = null;
});

test("it should update general settings (theme) using dispatch", () => {
  // fullscreen to be mocked and tested
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch } = Controller;

  act(() => {
    Dispatch({ task: "setGeneralProp", params: { prop: "backgroundColor", newValue: "blue" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "xAxisFillColor", newValue: "red" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "xAxisStrokeColor", newValue: "yellow" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "xAxisTextColor", newValue: "orange" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "yAxisStrokeColor", newValue: "violett" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "yAxisTextColor", newValue: "magenta" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "gridStrokeColor", newValue: "black" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairStrokeColor", newValue: "DarkBlue" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerStrokeColor", newValue: "Olive" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerBackgroundColor", newValue: "LightBlue" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerTextColor", newValue: "Purple" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerStrokeColor", newValue: "Lime" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerBackgroundColor", newValue: "Gray" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerTextColor", newValue: "Maroon" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "toggleGridX" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "toggleGridY" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "toggleCrosshair" } });
    Dispatch({ task: "setGeneralProp", params: { prop: "toggleFullscreen" } });
  });
  const { ChartState } = Controller;
  expect(ChartState.theme.backgroundColor).toBe("blue");
  expect(ChartState.theme.xaxis.fillColor).toBe("red");
  expect(ChartState.theme.xaxis.strokeColor).toBe("yellow");
  expect(ChartState.theme.xaxis.fontColor).toBe("orange");
  expect(ChartState.theme.yaxis.strokeColor).toBe("violett");
  expect(ChartState.theme.yaxis.fontColor).toBe("magenta");
  expect(ChartState.theme.grid.strokeColor).toBe("black");
  expect(ChartState.theme.crosshair.strokeColor).toBe("DarkBlue");
  expect(ChartState.theme.crosshair.xMarkerStrokeColor).toBe("Olive");
  expect(ChartState.theme.crosshair.xMarkerBackgroundColor).toBe("LightBlue");
  expect(ChartState.theme.crosshair.xMarkerTextColor).toBe("Purple");
  expect(ChartState.theme.crosshair.yMarkerStrokeColor).toBe("Lime");
  expect(ChartState.theme.crosshair.yMarkerBackgroundColor).toBe("Gray");
  expect(ChartState.theme.crosshair.yMarkerTextColor).toBe("Maroon");
  expect(ChartState.theme.crosshair.useCrosshair).toBe(false);
  expect(ChartState.theme.grid.useGridX).toBe(false);
  // expect(ChartState.fullscreen).toBe(true);
});

test("it should update/set another theme", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  expect(ChartState0?.theme).toEqual(defaultDarkTheme);
  act(() => {
    Dispatch({
      task: "setTheme",
      params: {
        theme: defaultLightTheme,
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1?.theme).toEqual(defaultLightTheme);
});

test("it should add new graph (indicator) in new subchart", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  const mainchart = ChartState0.data?.[0];
  const customAtrPeriod = 30;
  act(() => {
    Dispatch({
      task: "addSubchart",
      params: {
        dataSeries: mainchart.data,
        // graphName: testData2.name,
        id: "new-ATR-indicator",
        indicator: iATR(customAtrPeriod),
        indSrcId: "kama_01",
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1.data.length).toBe(ChartState0.data.length + 1);
  const newData = ChartState1.data?.slice?.(-1)?.[0];
  expect(newData?.id).toBe("new-ATR-indicator");
  expect(newData?.data?.length).toBe(mainchart?.data.length);
  expect(newData?.indicator?.params?.[0]?.val).toBe(customAtrPeriod);
  expect(newData?.indSrcId).toBe("kama_01");
  expect(ChartState1?.subcharts?.length).toBe(ChartState0?.subcharts?.length + 1);
  // expect()
});

test("it should remove a subchart", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  act(() => {
    Dispatch({
      task: "removeSubchart",
      params: {
        subchartIdx: 1,
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1.data.length).toBe(
    ChartState0.data.length - ChartState0?.subcharts?.[1]?.yaxis?.[0]?.graphs.length
  );
});

test("it should add a graph in existing subchart", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  const customSmaPeriod = 100;
  const mainchart = ChartState0.data?.[0];
  act(() => {
    Dispatch({
      task: "addGraph",
      params: {
        dataSeries: mainchart.data,
        subchartIdx: 0,
        id: "new-SMA-indicator",
        indicator: iSMA(customSmaPeriod),
        indSrcId: "kama_01",
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1.data.length).toBe(ChartState0.data.length + 1);
  const newData = ChartState1.data?.slice?.(-1)?.[0];
  expect(newData?.id).toBe("new-SMA-indicator");
  expect(newData?.data?.length).toBe(mainchart?.data.length);
  expect(newData?.indicator?.params?.[0]?.val).toBe(customSmaPeriod);
  expect(newData?.indSrcId).toBe("kama_01");
  expect(ChartState1?.subcharts?.length).toBe(ChartState0?.subcharts?.length);
  expect(ChartState1?.subcharts?.[0]?.yaxis?.[0]?.graphs?.length).toBe(
    ChartState0?.subcharts?.[0]?.yaxis?.[0]?.graphs?.length + 1
  );
});

test("it should remove a graph in existing subchart", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  act(() => {
    Dispatch({
      task: "removeGraph",
      params: {
        subchartIdx: 0,
        yaxisIdx: 0,
        graphIdx: 1,
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1.data.length).toBe(ChartState0.data.length - 1);
  expect(ChartState1?.subcharts?.length).toBe(ChartState0?.subcharts?.length);
  expect(ChartState1?.subcharts?.[0]?.yaxis?.[0]?.graphs?.length).toBe(
    ChartState0?.subcharts?.[0]?.yaxis?.[0]?.graphs?.length - 1
  );
});

test("it should swap subcharts", () => {
  let Controller = null;
  const settings = {
    ...defaultSettings,
    initialIndicators: [
      ...defaultSettings.initialIndicators,
      {
        id: "atr_01",
        type: "indicator",
        indicator: ATR,
      },
    ],
  };
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} settings={settings} />, container);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch, ChartState: ChartState0 } = Controller;
  act(() => {
    Dispatch({
      task: "swapSubcharts",
      params: {
        subchartIdx1: 1,
        subchartIdx2: 2,
      },
    });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  const subchartSizes0 = ChartState0.subcharts.map((sub) => ({ top: sub.top, bottom: sub.bottom }));
  const subchartSizes1 = ChartState1.subcharts.map((sub) => ({ top: sub.top, bottom: sub.bottom }));
  expect(subchartSizes1).toEqual(subchartSizes0);
  const subchartContent0 = ChartState0.subcharts.map((sub) => ({ yaxis: sub.yaxis }));
  const subchartContent1 = ChartState1.subcharts.map((sub) => ({ yaxis: sub.yaxis }));
  const subchartContent0subsReversed = [subchartContent0?.[0], subchartContent0?.[2], subchartContent0?.[1]];
  expect(subchartContent1).toEqual(subchartContent0subsReversed);
});

test("it should update graph-specific settings using dispatch", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />, container);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { Dispatch } = Controller;
  const mainchartPath = {
    subchartIdx: 0,
    yaxisIdx: 0,
    graphIdx: 0,
  };
  const indicatorPath = {
    subchartIdx: 1,
    yaxisIdx: 0,
    graphIdx: 1,
  };
  act(() => {
    Dispatch({
      task: "setGraphProp",
      params: { prop: "strokeColor", newValue: "yellow", ...indicatorPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "candleUpColor", newValue: "blue", ...mainchartPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "candleDownColor", newValue: "red", ...mainchartPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "candleStrokeColor", newValue: "maroon", ...mainchartPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "candleWickStrokeColor", newValue: "green", ...mainchartPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "chartType", newValue: "line", ...mainchartPath },
    });
    Dispatch({
      task: "setGraphProp",
      params: { prop: "dataId", newValue: "someId", ...indicatorPath },
    });
  });

  const { ChartState } = Controller;
  expect(ChartState?.subcharts?.[1]?.yaxis?.[0]?.graphs?.[1]?.style?.strokeColor).toBe("yellow");
  expect(ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.style?.candleUpColor).toBe("blue");
  expect(ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.style?.candleDownColor).toBe("red");
  expect(ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.style?.candleStrokeColor).toBe("maroon");
  expect(ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.style?.candleWickStrokeColor).toBe("green");
  expect(ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.chartType).toBe("line");
  expect(ChartState?.subcharts?.[1]?.yaxis?.[0]?.graphs?.[1]?.dataId).toBe("someId");
});
test.skip("it should add a tool - TODO", () => {});
test.skip("it should remove a tool - TODO", () => {});
test.skip("it should update tool-specific settings using dispatch - TODO", () => {});
