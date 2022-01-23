import React from "react";
import { testData } from "./testData";
import { PointerEventFake, matchMediaMock } from "./mocks";

// jest.mock('useFullscreen');
// additional global window mocks for jsdom env
Object.defineProperty(window, "PointerEvent", PointerEventFake);
Object.defineProperty(window, "matchMedia", matchMediaMock);
Object.defineProperty(window, "ResizeObserver", {
  value: require("resize-observer-polyfill"),
});
Object.defineProperty(document, "requestFullscreen", jest.fn());
Object.defineProperty(document, "exitFullscreen", jest.fn());
Object.defineProperty(document, "fullscreenElement", jest.fn());
Object.defineProperty(
  document,
  "fullscreenEnabled",
  jest.fn(() => true)
);
Object.defineProperty(document, "fullscreenchange", jest.fn());
Object.defineProperty(document, "fullscreenerror", jest.fn());
Object.defineProperty(document, "fullscreenerror", jest.fn());

jest.mock("../../lib/utils/Csv.js", () => ({
  parseCsvFileObj: jest.fn(),
}));

jest.useFakeTimers();

const { Chart, defaultDarkTheme, useChartController, KAMA, EMA, iRSI } = require("../webpack-test");
// const { Chart, defaultDarkTheme, useChartController, KAMA, EMA, iRSI } = require("../../lib");

export const defaultSettings = {
  disableTheme: true,
  initialTheme: defaultDarkTheme,
  initialIndicators: [
    {
      id: "kama_01",
      type: "indicator",
      indicator: KAMA,
      graphProps: {
        style: {
          strokeColor: ["#0693E3"],
        },
      },
    },
    { type: "indicator", indicator: iRSI(5), id: "rsi_01" },
    {
      id: "ema_rsi_01",
      type: "indicator",
      indSrcId: "rsi_01",
      indicator: EMA,
      graphProps: {
        style: {
          strokeColor: ["#0693E3"],
        },
      },
    },
  ],
  containerMode: "static",
};

export const Wrapper = (props) => {
  const defaultEvents = {
    onDataChange: (newData) => {
      setData(newData);
    },
  };
  const settings = React.useMemo(() => ({ ...defaultSettings, ...(props.settings || {}) }), []);
  const events = { ...defaultEvents, ...props?.events };
  const [Data, setData] = React.useState(testData);
  const Controller = useChartController({
    data: props?.data || Data,
    settings,
    width: props.width || 400,
    height: props.height || 500,
    events,
  });
  // a way to access useChartControllerHook in testing
  props?.sendController?.(Controller);
  // width / height style is for responsive containerMode, will not affect static containerMode
  return (
    <div id="testRoot" style={{ width: 420, height: 520 }}>
      <Chart Controller={Controller} />
    </div>
  );
};
