import React from "react";
import { getDefaultChartInteractions } from "./Defaults";
import * as T from "../Types";
import { useGesture as useGesture2 } from "@use-gesture/react";

export const useChartInteractions = (
  HtmlElementRef: React.RefObject<HTMLElement>,
  initialState: T.ChartState,
  disablePointerEvents: boolean,
  fullscreen: boolean
) => {
  /* T.ChartInteractions ref used to store/accumulate interactive state changes before setting state */
  const ChartInteractionsRef = React.useRef<T.ChartInteractions>(getDefaultChartInteractions(initialState));
  const { top: clientTop, left: clientLeft } = HtmlElementRef?.current?.getBoundingClientRect() ?? {};

  const transformVector = (xy: [number, number]): [number, number] => [
    xy[0] - (clientLeft ?? 0),
    xy[1] - (clientTop ?? 0),
  ];
  useGesture2(
    {
      onPinch: (pinchState) => {
        if (disablePointerEvents) return;
        const { active: isPinching, origin, movement: movementInitial, first, distance } = pinchState;
        ChartInteractionsRef.current.pointer = {
          ...ChartInteractionsRef.current.pointer,
          pinch: {
            isPinching,
            origin: transformVector(origin),
            movementInitial: distance, //: [(offset[0] - 1) * 100, (movementInitial[1] - 1) * 100],
            first,
          },
        };
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
        const { xy, initial, first, last, movement: movementInitial } = dragState;
        ChartInteractionsRef.current = {
          ...ChartInteractionsRef.current,
          pointer: {
            ...ChartInteractionsRef.current.pointer,
            dragPointerUp: {
              isDragPointerUp: true,
              xy: transformVector(xy),
              // initial: transformVector(xy),
              // movementInitial,
              // last,
              // first,
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
      target: fullscreen ? document.body : HtmlElementRef,
      hover: { mouseOnly: false },
      move: { mouseOnly: false },
      // transform: ([x, y]) => [x - (clientLeft ?? 0), y - (clientTop ?? 0)],
      drag: { preventScroll: true },
      enabled:
        // !disablePointerEvents &&
        ChartInteractionsRef.current.containerSize.init,
      eventOptions: { passive: false, capture: false },
      // pinch: { transform: ([x, y]) => [x, y] },
      // wheel: { transform: ([x, y]) => [x, y] , },
    }
  );
  return ChartInteractionsRef;
};
