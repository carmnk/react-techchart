import { PointerEventFake, matchMediaMock } from "./utils/mocks";
import React from "react";
import { fireEvent, render, act, createEvent, cleanup } from "@testing-library/react/";

import { Wrapper, defaultSettings } from "./utils/wrapper";
import { testData, testData2, testData2AddOne } from "./utils/testData";

import { defaultDrawState, defaultDarkTheme, FactoryTesting } from "../lib";

let container;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  if (container) document.body.removeChild(container);
  container = null;
  cleanup();
});

test("it should return the ChartController", () => {
  let Controller;
  const sendController = (c) => {
    Controller = c;
  };

  render(<Wrapper settings={defaultSettings} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  expect(Controller).toEqual(
    expect.objectContaining({
      ChartState: expect.objectContaining({
        calc: expect.any(Object),
        containerSize: { height: 500, init: true, left: 0, top: 0, width: 400 },
        data: expect.any(Array),
        draw: defaultDrawState,
        fullscreen: false,
        menu: expect.any(Object),
        subcharts: expect.any(Array),
      }),
      ContainerRef: expect.any(Object),
      PointerContainerRef: expect.any(Object),
      Dispatch: expect.any(Function),
      events: expect.objectContaining({ onDataChange: expect.any(Function) }),
      settings: defaultSettings,
      rtTicks: expect.any(Array),
    })
  );
  expect(Controller?.ChartState?.data?.[0]?.id).toBe("someId");
  expect(Controller?.ChartState?.data?.[0]?.data?.length).toBe(testData?.data?.length);
  expect(Controller?.ChartState?.data?.length).toBe(1 + defaultSettings?.initialIndicators?.length);
  expect(Controller?.ChartState?.subcharts?.length).toBe(2);
  expect(Controller?.ChartState?.calc?.subcharts?.length).toBe(2);
  expect(Controller?.ContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
  expect(Controller?.PointerContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
});

test("it should recalculate when new data is passed to data prop", () => {
  let Controller;
  const sendController = (c) => {
    Controller = c;
  };
  const { rerender } = render(<Wrapper settings={defaultSettings} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
    rerender(<Wrapper settings={defaultSettings} sendController={sendController} data={testData2} />);
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  expect(Controller?.ChartState?.data?.[0]?.id).toBe("someNewId");
  expect(Controller?.ChartState?.data?.[0]?.data?.length).toBe(testData2?.data?.length);
  expect(Controller?.ChartState?.data?.length).toBe(1 + defaultSettings?.initialIndicators?.length);
  expect(Controller?.ChartState?.subcharts?.length).toBe(2);
  expect(Controller?.ChartState?.calc?.subcharts?.length).toBe(2);
  expect(Controller?.ContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
  expect(Controller?.PointerContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
});

test("it should upddate when new Datasets are added to data prop", () => {
  let Controller;
  // const initDataFn = jest.spyOn(FactoryTesting, 'initData');
  const sendController = (c) => {
    Controller = c;
  };
  const { rerender } = render(<Wrapper settings={defaultSettings} sendController={sendController} data={testData2} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
    rerender(<Wrapper settings={defaultSettings} sendController={sendController} data={testData2AddOne} />);
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });

  expect(Controller?.ChartState?.data?.[0]?.id).toBe("someNewId");
  expect(Controller?.ChartState?.data?.[0]?.data?.length).toBe(testData2AddOne?.data?.length);
  expect(Controller?.ChartState?.data?.length).toBe(1 + defaultSettings?.initialIndicators?.length);
  expect(Controller?.ChartState?.subcharts?.length).toBe(2);
  expect(Controller?.ChartState?.calc?.subcharts?.length).toBe(2);
  expect(Controller?.ContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
  expect(Controller?.PointerContainerRef?.current?.constructor?.name).toBe("HTMLDivElement");
});

test("it should initialize and update containerSize in static containerMode", () => {
  let Controller;
  const sendController = (c) => {
    Controller = c;
  };
  const { rerender } = render(<Wrapper width={400} height={500} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  const { ContainerRef } = Controller;
  expect(ContainerRef?.current?.style?.width).toBe("400px");
  expect(ContainerRef?.current?.style?.height).toBe("500px");
  rerender(<Wrapper width={500} height={600} />);
  expect(ContainerRef?.current?.style?.width).toBe("500px");
  expect(ContainerRef?.current?.style?.height).toBe("600px");
});

test.skip("it should initialize and update containerSize in responsive containerMode - TODO", () => {
  let Controller;
  const settings = { ...defaultSettings, containerMode: "responsive" };
  const sendController = (c) => {
    Controller = c;
  };
  const { rerender } = render(<Wrapper sendController={sendController} settings={settings} />);
  const testRootContainer = document.getElementById("testRoot");
  const componentRoot = testRootContainer.children[0];
  expect(componentRoot.style.width).toBe("400px");
});

test("it should initialize provided initialTheme", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper settings={{ containerMode: "responsive" }} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { ChartState } = Controller;
  expect(ChartState.theme).toEqual(defaultDarkTheme);
});

test("it should initialize provided initialIndicators", () => {
  let Controller;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper settings={defaultSettings} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  const initialIndicators = defaultSettings?.initialIndicators;
  expect(Controller?.ChartState?.data?.length).toBe(1 + initialIndicators?.length);
  expect(Controller?.ChartState?.data?.[1]?.id).toBe("kama_01");
  expect(Controller?.ChartState?.data?.[1]?.data?.length).toBe(testData?.data?.length);
  expect(Controller?.ChartState?.data?.[2]?.id).toBe("rsi_01");
  expect(Controller?.ChartState?.data?.[2]?.data?.length).toBe(testData?.data?.length);
  expect(Controller?.ChartState?.data?.[3]?.id).toBe("ema_rsi_01");
  expect(Controller?.ChartState?.data?.[3]?.data?.length).toBe(testData?.data?.length);

  expect(Controller?.ChartState?.subcharts?.length).toBe(2);
  expect(Controller?.ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[1]?.dataId).toBe("kama_01");
  expect(Controller?.ChartState?.subcharts?.[1]?.yaxis?.[0]?.graphs?.[0]?.dataId).toBe("rsi_01");
  expect(Controller?.ChartState?.subcharts?.[1]?.yaxis?.[0]?.graphs?.[1]?.dataId).toBe("ema_rsi_01");
  expect(Controller?.ChartState?.calc?.subcharts?.length).toBe(2);
});

test.skip("it should check for interaction updates according to provided maxUpdatesPerSec - TODO", () => {});

test("it should detect/process hovering", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { PointerContainerRef, ChartState: ChartState0 } = Controller;
  expect(ChartState0.calc.pointer.isHovering).toBe(false);
  expect(ChartState0.calc.action?.pointerMove).toBe(false);

  if (!PointerContainerRef?.current)
    throw new Error("Errow with Wrapper, PointerController is not included in Controller");
  const pointerArea = PointerContainerRef?.current;
  act(() => {
    fireEvent(pointerArea, new PointerEventFake("pointerenter"));
    fireEvent(pointerArea, new MouseEvent("pointerdown", { clientX: 10, clientY: 50 })); // more correctly would be to mock PointerEvent
    fireEvent(pointerArea, new MouseEvent("pointermove", { clientX: 20, clientY: 60 }));
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1.calc.pointer.isHovering).toBe(true);
  expect(ChartState1.calc.pointer.move.pixX).toBe(20);
  expect(ChartState1.calc.pointer.move.pixY).toBe(60);
  expect(ChartState1.calc.action?.pointerMove).toBe(true);
  act(() => {
    fireEvent.pointerUp(pointerArea);
    fireEvent(pointerArea, new PointerEventFake("pointerleave"));
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2.calc.pointer.isHovering).toBe(false);
  expect(ChartState2.calc.action?.pointerMove).toBe(false); // !! should be false when hovering!!!!
});

test("it should translate when dragging chartarea", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  render(<Wrapper sendController={sendController} width={400} height={500} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { PointerContainerRef, ChartState: ChartState0 } = Controller;
  const totalTranslatedX0 = ChartState0.calc.xaxis.totalTranslatedX;
  expect(ChartState0?.calc?.action?.pointer).toBe(null);
  if (!PointerContainerRef?.current)
    throw new Error("Errow with Wrapper, PointerController is not included in Controller");
  const pointerArea = PointerContainerRef?.current;

  act(() => {
    const mouseDownEvent = createEvent.mouseDown(pointerArea, {
      pointerId: 1,
      clientX: 10,
      clientY: 50,
      buttons: 1,
    });
    const mouseMoveEvent = createEvent.mouseMove(pointerArea, {
      pointerId: 1,
      clientX: 20,
      clientY: 60,
      buttons: 1,
    });
    fireEvent(pointerArea, mouseDownEvent);
    fireEvent(pointerArea, mouseMoveEvent);
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  const totalTranslatedX1 = ChartState1.calc.xaxis.totalTranslatedX;

  expect(ChartState1?.calc?.action?.pointer?.type).toBe("translate");
  expect(ChartState1?.calc?.action?.pointer?.shallUpdate).toBe(true);
  expect(totalTranslatedX1 - totalTranslatedX0).toBe(10);

  act(() => {
    fireEvent.mouseUp(pointerArea, { pointerId: 1 });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2?.calc?.action?.pointer).toBe(null);
});

test("it should scale when draggin xaxis", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  const width = 400;
  const height = 500;
  render(<Wrapper sendController={sendController} width={width} height={height} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { PointerContainerRef, ChartState: ChartState0 } = Controller;
  const pointerArea = PointerContainerRef?.current;
  const totalTranslatedX0 = ChartState0.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick0 = ChartState0.calc.xaxis.scaledWidthPerTick;
  expect(ChartState0?.calc?.action?.pointer).toBe(null);
  const xAxisHeight = ChartState0.theme.xaxis.heightXAxis;
  const dragPoint = height - xAxisHeight + 1;
  const xDragStart = 10;
  const dxDrag = 10;
  act(() => {
    fireEvent(
      pointerArea,
      createEvent.mouseDown(pointerArea, {
        pointerId: 1,
        clientX: xDragStart,
        clientY: dragPoint,
        buttons: 1,
      })
    );
    fireEvent(
      pointerArea,
      createEvent.mouseMove(pointerArea, {
        pointerId: 1,
        clientX: xDragStart + dxDrag,
        clientY: dragPoint,
        buttons: 1,
      })
    );
    fireEvent(pointerArea, new MouseEvent("pointerdown", { clientX: xDragStart, clientY: dragPoint })); // more correctly would be to mock PointerEvent
    fireEvent(pointerArea, new MouseEvent("pointermove", { clientX: xDragStart + dxDrag, clientY: dragPoint }));
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  const totalTranslatedX1 = ChartState1.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick1 = ChartState1.calc.xaxis.scaledWidthPerTick;
  expect(ChartState1?.calc?.action?.pointer?.type).toBe("scale");
  expect(ChartState1?.calc?.action?.pointer?.shallUpdate).toBe(true);
  const exp = dxDrag >= 0 ? 1 : 0;
  const expectScaledWidthPerTick1 = Math.max(
    Math.min(scaledWidthPerTick0 * Math.pow(1 + (dxDrag * 2) / (width - 1), exp), (width - 1) / 3),
    1
  );
  expect(scaledWidthPerTick1).toEqual(expectScaledWidthPerTick1);
  const initPixX = xDragStart;
  const initXexact = (initPixX - totalTranslatedX0) / scaledWidthPerTick0;
  const newPos = initXexact * expectScaledWidthPerTick1 + totalTranslatedX0;
  const expectedTotalTranslatedX1 = totalTranslatedX0 - newPos + initPixX;
  expect(totalTranslatedX1).toBe(expectedTotalTranslatedX1);
  expect(ChartState1?.calc?.action?.pointerMove).toBe(true);
  act(() => {
    fireEvent(pointerArea, new MouseEvent("pointerup"));
    fireEvent.mouseUp(pointerArea);
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2?.calc?.action?.pointer).toBe(null);
  expect(ChartState2?.calc?.action?.pointerMove).toBe(false);
});

test.skip("it should scale when pinching horizontally - TODO", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  const height = 500;
  const { rerender, container } = render(<Wrapper sendController={sendController} width={400} height={height} />);
  act(() => {
    jest.runOnlyPendingTimers(); // useChartController uses an eternal timer in react-effect
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { PointerContainerRef, ChartState: ChartState0 } = Controller;
  const pointerArea = PointerContainerRef?.current;
  const totalTranslatedX0 = ChartState0.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick0 = ChartState0.calc.xaxis.scaledWidthPerTick;
  expect(ChartState0?.calc?.action?.pointer).toBe(null);

  act(() => {
    fireEvent.pointerDown(pointerArea, { pointerId: 31, clientX: 10, clientY: 0, buttons: 1 });
    fireEvent.pointerDown(pointerArea, { pointerId: 32, clientX: 110, clientY: 0, buttons: 1 });
    // fireEvent(pointerArea, new PointerEventFake("pointerdown", { pointerId: 21, clientX: 0, clientY: 10, buttons: 1 }));
    // fireEvent(pointerArea, new PointerEventFake("pointerdown", { pointerId: 22, clientX: 70, clientY: 10, buttons: 1 }));
    // fireEvent.pointerDown(pointerArea, { pointerId: 31, clientX: 10, clientY: 0, buttons: 1 });
    // fireEvent.pointerDown(pointerArea, { pointerId: 32, clientX: 10, clientY: 0, buttons: 1 });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  const totalTranslatedX1 = ChartState1.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick1 = ChartState1.calc.xaxis.scaledWidthPerTick;
  expect(ChartState1?.calc?.action?.pointer?.type).toBe("scale");
  expect(ChartState1?.calc?.action?.pointer?.shallUpdate).toBe(true);
  expect(totalTranslatedX1 - totalTranslatedX0).toBe(10);

  act(() => {
    // fireEvent.mouseUp(pointerArea, { pointerId: 1 });
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2?.calc?.action?.pointer).toBe(null);
});

test("it should scale when wheeling", () => {
  let Controller = null;
  const sendController = (c) => {
    Controller = c;
  };
  const width = 400;
  const height = 500;
  render(<Wrapper sendController={sendController} width={width} height={height} />);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  if (!Controller) throw new Error("Errow with Wrapper, Controller is not sent");
  const { PointerContainerRef, ChartState: ChartState0 } = Controller;
  const pointerArea = PointerContainerRef?.current;
  const totalTranslatedX0 = ChartState0.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick0 = ChartState0.calc.xaxis.scaledWidthPerTick;
  expect(ChartState0?.calc?.action?.pointer).toBe(null);
  expect(ChartState0?.calc?.action?.wheel).toBe(null);

  const deltaY = 300;
  const initClientX = 20;
  act(() => {
    fireEvent(PointerContainerRef?.current, new PointerEventFake("pointerenter"));
    fireEvent(pointerArea, new MouseEvent("pointermove", { clientX: initClientX, clientY: 60 }));
    fireEvent(pointerArea, createEvent.wheel(pointerArea, { deltaX: 0, deltaY }));
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  const totalTranslatedX1 = ChartState1.calc.xaxis.totalTranslatedX;
  const scaledWidthPerTick1 = ChartState1.calc.xaxis.scaledWidthPerTick;
  expect(ChartState1?.calc?.action?.wheel?.type).toBe("wheelScale");
  expect(ChartState1?.calc?.action?.wheel?.wheelDeltaY).toBe(deltaY);
  expect(ChartState1?.calc?.action?.shallUpdateXaxis).toBe(true);
  expect(ChartState1?.calc?.action?.shallUpdateCalcSubcharts).toBe(true);
  const exp = deltaY >= 0 ? 1 : 0;
  const expectScaledWidthPerTick1 = Math.max(
    Math.min(scaledWidthPerTick0 * Math.pow(1 + deltaY / (width - 1), exp), (width - 1) / 3),
    1
  );
  expect(scaledWidthPerTick1).toBe(expectScaledWidthPerTick1);
  const initPixX = initClientX;
  const initXexact = (initPixX - totalTranslatedX0) / scaledWidthPerTick0;
  const newPos = Math.round(initXexact) * expectScaledWidthPerTick1 + totalTranslatedX0;
  const expectedTotalTranslatedX1 = totalTranslatedX0 - newPos + initPixX;
  expect(totalTranslatedX1).toBe(expectedTotalTranslatedX1);
  expect(ChartState1?.calc?.action?.pointerMove).toBe(true);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2?.calc?.action?.pointer).toBe(null);
});

test("it should not trigger any event if disablePointerEvents is true", () => {
  const triggerEvents = () => {
    // hover
    fireEvent(pointerArea, new PointerEventFake("pointerenter"));
    // pointerMove
    fireEvent(pointerArea, new MouseEvent("pointermove", { clientX: 20, clientY: 60 }));
    // drag
    fireEvent(
      pointerArea,
      createEvent.mouseDown(pointerArea, {
        pointerId: 1,
        clientX: 10,
        clientY: 50,
        buttons: 1,
      })
    );
    fireEvent(
      pointerArea,
      createEvent.mouseMove(pointerArea, {
        pointerId: 1,
        clientX: 20,
        clientY: 60,
        buttons: 1,
      })
    );
    // wheel
    fireEvent(pointerArea, createEvent.wheel(pointerArea, { deltaX: 0, deltaY: 200 }));
    // pinch - TODO
  };
  let Controller;
  const events = { disablePointerEvents: true };
  const sendController = (c) => {
    Controller = c;
  };
  const { rerender } = render(<Wrapper settings={defaultSettings} sendController={sendController} />);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  const { PointerContainerRef } = Controller;
  const pointerArea = PointerContainerRef?.current;
  act(() => {
    triggerEvents();
    jest.runOnlyPendingTimers();
  });
  rerender(<Wrapper settings={defaultSettings} sendController={sendController} events={events} />);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState1 } = Controller;
  expect(ChartState1?.calc?.action?.pointer).toBe(null);
  expect(ChartState1?.calc?.action?.pointerMove).toBe(false);
  expect(ChartState1?.calc?.action?.wheel).toBe(null);
  act(() => {
    triggerEvents();
    jest.runOnlyPendingTimers();
  });
  const { ChartState: ChartState2 } = Controller;
  expect(ChartState2?.calc?.action?.pointer).toBe(null);
  expect(ChartState2?.calc?.action?.pointerMove).toBe(false);
  expect(ChartState2?.calc?.action?.wheel).toBe(null);
});
