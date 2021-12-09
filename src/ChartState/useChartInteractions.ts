import React from "react";
import { useResizeDetector } from "react-resize-detector";
import { useGesture } from "react-use-gesture";
// import { useGesture as useGesture2 } from "@use-gesture/react";
import { isNullish } from "../utils/Basics";
import { getDefaultChartInteractions } from "./Defaults";
import * as T from "../Types";

export const useChartInteractions = (
  ContainerRef: React.RefObject<HTMLElement>,
  initialState: T.ChartState,
  staticWidth: T.ChartStateProps["width"],
  staticHeight: T.ChartStateProps["height"],
  settings: T.ChartStateProps["settings"],
  fullscreen: boolean
) => {
  const { containerMode: containerModeIn, disablePointerEvents } = settings;
  const containerMode = containerModeIn === "static" && staticHeight && staticWidth ? "static" : "responsive";
  /* T.ChartInteractions ref used to store/accumulate interactive state changes before setting state */
  const ChartInteractionsRef = React.useRef<T.ChartInteractions>(getDefaultChartInteractions(initialState));

  /* update static container size if not in fullscreen */
  const { top: clientTop, left: clientLeft } = ContainerRef?.current?.getBoundingClientRect() ?? {};
  React.useEffect(() => {
    const ref = ContainerRef;
    if (!ref?.current || fullscreen || containerMode !== "static") return;
    if (isNullish(clientTop) || isNullish(clientLeft) || isNullish(staticWidth) || isNullish(staticHeight)) return;
    const Interactions = ChartInteractionsRef.current;
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
    ChartInteractionsRef.current = {
      ...Interactions,
      stateControl: {
        ...Interactions.stateControl,
        shallUpdate: [...Interactions.stateControl.shallUpdate, "containerResize"],
      },
      containerSize,
    };
  }, [containerMode, ContainerRef, fullscreen, staticWidth, staticHeight, clientLeft, clientTop]);

  /** init and update container size if in fullscreen */
  React.useEffect(() => {
    const ref = ContainerRef;
    if (!ref?.current) return;
    if (disablePointerEvents) {
      ref.current.style.pointerEvents = "none";
      return;
    }
    ref.current.style.pointerEvents = "auto";
    if (!fullscreen) return;
    const Interactions = ChartInteractionsRef.current;
    const handleWindowResize = (e?: Event) => {
      if (!ref || !ref.current) return;
      const { innerWidth: width, innerHeight: height } = window;
      ChartInteractionsRef.current = {
        ...Interactions,
        stateControl: {
          ...Interactions.stateControl,
          shallUpdate: [...Interactions.stateControl.shallUpdate, "containerResize"],
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

  /* init and update container size if in responsive containerMode using parents size */
  const handleResizeDetected = React.useCallback(
    (width, height) => {
      if (containerMode !== "responsive" || isNullish(width) || isNullish(height) || fullscreen) return;
      if (!ContainerRef?.current?.parentElement) return;
      const Interactions = ChartInteractionsRef.current;
      const { top, left } = ContainerRef.current.parentElement.getBoundingClientRect();
      ChartInteractionsRef.current = {
        ...Interactions,
        stateControl: {
          ...Interactions.stateControl,
          shallUpdate: [...Interactions.stateControl.shallUpdate, "containerResize"],
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
  const transformVector = (xy: [number, number]): [number, number] => [xy[0] - 0, xy[1] - 0];
  useGesture(
    {
      onPinch: (pinchState) => {
        if (disablePointerEvents) return;
        const { active: isPinching, origin, movement: movementInitial, first, offset } = pinchState;
        ChartInteractionsRef.current.pointer = {
          ...ChartInteractionsRef.current.pointer,
          pinch: {
            isPinching,
            origin: transformVector(origin),
            movementInitial, //: [(offset[0] - 1) * 100, (movementInitial[1] - 1) * 100],
            first,
          },
        };
        // alert("pinch: " + movementInitial + "vs:" + pinchState.offset+ ", origin: " + transformVector(origin));
        ChartInteractionsRef.current.stateControl.shallUpdate = [
          ...ChartInteractionsRef.current.stateControl.shallUpdate.filter((val) => val !== "pointerMove"),
          "pinch",
        ];
      },
      onDrag: (dragState) => {
        if (disablePointerEvents) return;
        const shallAlreadyUpdate = ChartInteractionsRef.current.stateControl.shallUpdate.includes("drag");
        const prevDelta = ChartInteractionsRef.current.pointer.drag.delta;
        const deltaX = shallAlreadyUpdate && !!prevDelta ? prevDelta[0] + dragState.delta[0] : dragState.delta[0];
        const deltaY = shallAlreadyUpdate && !!prevDelta ? prevDelta[1] + dragState.delta[1] : dragState.delta[1];
        const {
          xy,
          initial,
          movement: movementInitial,
          first: firstIn,
          last: lastIn,
          active: isDragging,
          ctrlKey,
        } = dragState;
        const first = shallAlreadyUpdate ? ChartInteractionsRef.current.pointer.drag.first || firstIn : firstIn;
        const last = shallAlreadyUpdate ? ChartInteractionsRef.current.pointer.drag.last || lastIn : lastIn;
        if (isDragging && !first && !dragState.delta[0] && !dragState.delta[1]) return;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            drag: {
              isDragging,
              xy: transformVector(xy),
              initial: transformVector(initial),
              movementInitial,
              last,
              first,
              delta: [deltaX, deltaY],
              ctrlKey,
            },
          },
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [...ChartInteractionsRef.current.stateControl.shallUpdate, "drag"],
            // lastUpdate: ChartInteractionsRef.current.stateControl.lastUpdate,
          },
        };
      },
      onMove: (moveState) => {
        if (disablePointerEvents) return;
        const isMoving = moveState.active;
        if (isMoving && !moveState.first && !moveState.delta[0] && !moveState.delta[1]) return;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            move: {
              isMoving: moveState.active,
              xy: transformVector(moveState.xy),
            },
          },
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [...ChartInteractionsRef.current.stateControl.shallUpdate, "pointerMove"],
          },
        };
      },
      onHover: (hoverState) => {
        if (disablePointerEvents) return;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            isHovering: hoverState.active,
          },
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [...ChartInteractionsRef.current.stateControl.shallUpdate, "pointerMove"],
          },
        };
      },
      onWheel: (wheelState) => {
        if (disablePointerEvents) return;
        const shallAlreadyUpdate = ChartInteractionsRef.current.stateControl.shallUpdate.includes("wheel");
        const prevDelta = ChartInteractionsRef.current.pointer.wheel.delta;
        const deltaX = shallAlreadyUpdate && !!prevDelta ? prevDelta[0] + wheelState.delta[0] : wheelState.delta[0];
        const deltaY = shallAlreadyUpdate && !!prevDelta ? prevDelta[1] + wheelState.delta[1] : wheelState.delta[1];
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            wheel: { delta: [deltaX, deltaY], isWheeling: wheelState.active },
          },
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [...ChartInteractionsRef.current.stateControl.shallUpdate, "wheel"],
          },
        };
      },
      onDragEnd: (dragState) => {
        if (disablePointerEvents) return;
        const { xy, first, last, movement: movementInitial } = dragState;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            dragPointerUp: {
              isDragPointerUp: true,
              xy: transformVector(xy),
            },
          },
          stateControl: {
            ...ChartInteractionsRef.current.stateControl,
            shallUpdate: [...ChartInteractionsRef.current.stateControl.shallUpdate, "dragEnd"],
          },
        };
      },
    },
    {
      domTarget: fullscreen ? document.body : ContainerRef,
      transform: ([x, y]) => [x - (clientLeft ?? 0), y - (clientTop ?? 0)],
      drag: { experimental_preventWindowScrollY: true, useTouch: true },
      enabled:
        // !disablePointerEvents &&
        ChartInteractionsRef.current.containerSize.init,
      eventOptions: { passive: false, capture: false },
      pinch: { transform: ([x, y]) => [x, y] },
      wheel: { transform: ([x, y]) => [x, y] },
    }
  );

  return ChartInteractionsRef;
};
