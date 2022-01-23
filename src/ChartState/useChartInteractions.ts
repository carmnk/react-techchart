import React from "react";
import { useResizeDetector } from "react-resize-detector";
import useFullscreen from "react-use/lib/useFullscreen";
import { useGesture } from "@use-gesture/react";
import { isNullish } from "../utils/Basics";
import { getDefaultChartInteractions } from "./Defaults";
import * as T from "../Types";

export const useChartInteractions: T.UseChartInteractions = (
  ContainerRef: React.RefObject<HTMLElement>,
  PointerContainerRef: React.RefObject<HTMLElement>,
  ChartState: T.ChartState,
  Dispatch: T.ChartController["Dispatch"],
  stateProps: T.UseChartControllerProps
) => {
  const { settings, width: staticWidth, height: staticHeight, events } = stateProps;
  const { containerMode: containerModeIn } = settings || {};
  const { disablePointerEvents } = events || {};
  const { fullscreen } = ChartState;
  const containerMode = containerModeIn === "static" && staticHeight && staticWidth ? "static" : "responsive";
  const InteractionsRef = React.useRef<T.ChartInteractions>(getDefaultChartInteractions(ChartState));

  useFullscreen(ContainerRef, fullscreen, {
    onClose: () =>
      Dispatch({
        task: "setGeneralProp",
        params: { prop: "toggleFullscreen" },
      } as T.ReducerAction<"setGeneralProp">),
  });

  /* update static container size if not in fullscreen */
  const { top: clientTop, left: clientLeft } = ContainerRef?.current?.getBoundingClientRect() ?? {};
  React.useEffect(() => {
    const ref = ContainerRef;
    if (!ref?.current || fullscreen || containerMode !== "static") return;
    if (isNullish(clientTop) || isNullish(clientLeft) || isNullish(staticWidth) || isNullish(staticHeight)) return;
    const containerSize = {
      top: clientTop,
      left: clientLeft,
      width: staticWidth,
      height: staticHeight,
      init: true,
    };
    ref.current.style.position = "relative";
    ref.current.style.width = containerMode === "static" && staticWidth !== undefined ? staticWidth + "px" : "100%";
    ref.current.style.height = containerMode === "static" && staticHeight !== undefined ? staticHeight + "px" : "100%";
    ref.current.style.top = "0px";
    ref.current.style.left = "0px";
    InteractionsRef.current = {
      ...InteractionsRef.current,
      stateControl: {
        ...InteractionsRef.current.stateControl,
        shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "containerResize"],
      },
      containerSize,
    };
  }, [containerMode, ContainerRef, fullscreen, staticWidth, staticHeight, clientLeft, clientTop]);

  /** init and update container size if in fullscreen */
  React.useEffect(() => {
    const ref = ContainerRef;
    if (!ref?.current) return;
    if (!fullscreen) return;
    const handleWindowResize = () => {
      if (!ref || !ref.current) return;
      const { innerWidth: width, innerHeight: height } = window;
      InteractionsRef.current = {
        ...InteractionsRef.current,
        stateControl: {
          ...InteractionsRef.current.stateControl,
          shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "containerResize"],
        },
        containerSize: { top: 0, left: 0, width, height, init: true },
      };
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("orientationchange", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("orientationchange", handleWindowResize);
    };
  }, [ContainerRef, fullscreen, disablePointerEvents]);

  /* init and update container size if in responsive containerMode and not fullscreen */
  const handleResizeDetected = React.useCallback(
    (width, height) => {
      if (containerMode !== "responsive" || isNullish(width) || isNullish(height) || fullscreen) return;
      if (!ContainerRef?.current?.parentElement) return;
      const { top, left } = ContainerRef.current.parentElement.getBoundingClientRect();
      InteractionsRef.current = {
        ...InteractionsRef.current,
        stateControl: {
          ...InteractionsRef.current.stateControl,
          shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "containerResize"],
        },
        containerSize: { top, left, width, height, init: true },
      };
    },
    [fullscreen, containerMode, ContainerRef]
  );
  useResizeDetector({
    targetRef: { current: ContainerRef.current?.parentElement } ?? undefined,
    onResize: handleResizeDetected,
  });

  /* pointer event handlers  */
  const transformVector = (xy: [number, number]): [number, number] => [
    xy[0] - (clientLeft ?? 0),
    xy[1] - (clientTop ?? 0),
  ];
  useGesture(
    {
      onPinch: (pinchState) => {
        const { active: isPinching, origin, first, values, initial } = pinchState;
        InteractionsRef.current.pointer = {
          ...InteractionsRef.current.pointer,
          pinch: {
            isPinching,
            origin: transformVector(origin),
            movementInitial: [values[0] - initial[0], values[1] - initial[1]],
            first,
          },
        };
        InteractionsRef.current.stateControl.shallUpdate = [
          ...InteractionsRef.current.stateControl.shallUpdate.filter((val) => val !== "pointerMove"),
          "pinch",
        ];
      },
      onDrag: (dragState) => {
        const shallAlreadyUpdate = InteractionsRef.current.stateControl.shallUpdate.includes("drag");
        const prevDelta = InteractionsRef.current.pointer.drag.delta;
        const deltaX = shallAlreadyUpdate && !!prevDelta ? prevDelta[0] + dragState.delta[0] : dragState.delta[0];
        const deltaY = shallAlreadyUpdate && !!prevDelta ? prevDelta[1] + dragState.delta[1] : dragState.delta[1];
        const { xy, initial, movement, first: firstIn, last: lastIn, active: isDragging, ctrlKey } = dragState;
        const first = shallAlreadyUpdate ? InteractionsRef.current.pointer.drag.first || firstIn : firstIn;
        const last = shallAlreadyUpdate ? InteractionsRef.current.pointer.drag.last || lastIn : lastIn;
        if (isDragging && !first && !dragState.delta[0] && !dragState.delta[1]) return;
        InteractionsRef.current = {
          ...InteractionsRef.current,
          pointer: {
            ...InteractionsRef.current.pointer,
            drag: {
              isDragging,
              xy: transformVector(xy),
              initial: transformVector(initial),
              movementInitial: !disablePointerEvents ? movement : [0, 0],
              last,
              first,
              delta: !disablePointerEvents ? [deltaX, deltaY] : [0, 0],
              ctrlKey,
            },
          },
          stateControl: {
            ...InteractionsRef.current.stateControl,
            shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "drag"],
          },
        };
      },
      onMove: (moveState) => {
        const isMoving = moveState.active;
        if (isMoving && !moveState.first && !moveState.delta[0] && !moveState.delta[1]) return;
        InteractionsRef.current = {
          ...InteractionsRef.current,
          pointer: {
            ...InteractionsRef.current.pointer,
            move: {
              isMoving: moveState.active,
              xy: transformVector(moveState.xy),
            },
          },
          stateControl: {
            ...InteractionsRef.current.stateControl,
            shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "pointerMove"],
          },
        };
      },
      onHover: (hoverState) => {
        InteractionsRef.current = {
          ...InteractionsRef.current,
          pointer: {
            ...InteractionsRef.current.pointer,
            isHovering: hoverState.active,
          },
          stateControl: {
            ...InteractionsRef.current.stateControl,
            shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "pointerMove"],
          },
        };
      },
      onWheel: (wheelState) => {
        const shallAlreadyUpdate = InteractionsRef.current.stateControl.shallUpdate.includes("wheel");
        const prevDelta = InteractionsRef.current.pointer.wheel.delta;
        const deltaX = shallAlreadyUpdate && !!prevDelta ? prevDelta[0] + wheelState.delta[0] : wheelState.delta[0];
        const deltaY = shallAlreadyUpdate && !!prevDelta ? prevDelta[1] + wheelState.delta[1] : wheelState.delta[1];

        InteractionsRef.current = {
          ...InteractionsRef.current,
          pointer: {
            ...InteractionsRef.current.pointer,
            wheel: { delta: [deltaX, deltaY], isWheeling: wheelState.active },
          },
          stateControl: {
            ...InteractionsRef.current.stateControl,
            shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "wheel"],
          },
        };
      },
      onDragEnd: (dragState) => {
        const { xy: xyIn } = dragState;
        const xy = transformVector(xyIn);
        InteractionsRef.current = {
          ...InteractionsRef.current,
          pointer: {
            ...InteractionsRef.current.pointer,
            dragPointerUp: { isDragPointerUp: true, xy },
          },
          stateControl: {
            ...InteractionsRef.current.stateControl,
            shallUpdate: [...InteractionsRef.current.stateControl.shallUpdate, "dragEnd"],
          },
        };
      },
    },
    {
      // target: ContainerRef,
      target: PointerContainerRef,

      enabled:
        !ChartState.menu?.disablePointerEvents && !disablePointerEvents && InteractionsRef.current.containerSize.init,
      eventOptions: { passive: false, capture: false },
      pinch: { axis: "x" }, // not as intended but low prio -> will also scale on y-pinch
      drag: { preventScroll: true, touch: true },
      wheel: { preventDefault: true },
      hover: { mouseOnly: false },
      move: { mouseOnly: false },
    }
  );

  return !disablePointerEvents
    ? InteractionsRef
    : {
        current: {
          ...InteractionsRef.current,
          stateControl: {
            shallUpdate: InteractionsRef.current.stateControl.shallUpdate.filter(
              (val) => val === "containerResize" || val === "deps"
            ),
          },
        },
      };
};
