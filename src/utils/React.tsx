import React from "react";
import isDeepEqual from "lodash/isEqual";
import { isNullish } from "./Basics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modifyStateProp = (src: any, path: (string | number)[], newValue: any, mode: "edit" | "add" | "remove") => {
  if (typeof src !== "object") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let target: any = Array.isArray(src) ? [...src] : { ...src }; //_.cloneDeep(src);
  let srcPointer = src;
  let targetPointer = target;
  try {
    path.forEach((pathStep, pathStepIdx) => {
      if (!(pathStep in srcPointer) || (typeof pathStep !== "number" && typeof pathStep !== "string")) {
        target = null;
        throw new Error(`path at position ${pathStepIdx} '${pathStep}' not found in src object/array -1`);
      }
      if (pathStepIdx < path.length - 1) {
        if (
          (typeof pathStep === "number" && /*!Array.isArray(targetPointer) ||*/ !Array.isArray(srcPointer)) ||
          (typeof pathStep === "string" && typeof srcPointer !== "object") /*|| typeof targetPointer !== "object")*/
        ) {
          target = null;
          throw new Error(`path at position ${pathStepIdx} '${pathStep}' not found in src object/array -2`);
        }
        if (Array.isArray(srcPointer) && typeof pathStep === "number") {
          targetPointer[pathStep] = Array.isArray(srcPointer[pathStep])
            ? [...srcPointer[pathStep]]
            : { ...srcPointer[pathStep] };
        } else
          targetPointer[pathStep] = Array.isArray(srcPointer[pathStep])
            ? [...srcPointer[pathStep]]
            : { ...srcPointer[pathStep] };

        if (mode === "remove" && pathStepIdx === path.length - 2) {
          const lastPath = path[path.length - 1];
          if (typeof lastPath === "number" && Array.isArray(srcPointer[pathStep])) {
            targetPointer[pathStep] = [
              ...srcPointer[pathStep].slice(0, path[path.length - 1]),
              ...srcPointer[pathStep].slice(lastPath + 1),
            ];
          } else if (typeof lastPath === "string" && typeof srcPointer[pathStep]) {
            const { [lastPath]: out, ...rest } = srcPointer[pathStep];
            targetPointer[pathStep] = { ...rest };
          }
        } else targetPointer = targetPointer[pathStep];
        srcPointer = srcPointer[pathStep];
      } else {
        if (mode !== "remove") {
          if (!(pathStep in srcPointer) && mode !== "add") {
            target = null;
            throw new Error(`path at position ${pathStepIdx} '${pathStep}' not found in src object/array -3`);
          }
          if (mode === "add" && Array.isArray(srcPointer[pathStep]))
            targetPointer[pathStep] = [...srcPointer[pathStep], newValue];
          else targetPointer[pathStep] = newValue;

          // else delete targetPointer[pathStep];
        }
      }
    });
  } catch (err) {
    console.error("Error at setStateProp(): ", err);
    return null;
  }
  return target;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setStateProp = (src: any, path: (string | number)[], newValue: any) =>
  modifyStateProp(src, path, newValue, "edit");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addStateProp = (src: any, path: (string | number)[], newValue: any) =>
  modifyStateProp(src, path, newValue, "add");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeStateProp = (src: any, path: (string | number)[]) => modifyStateProp(src, path, null, "remove");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStateProp = (src: any, path: (string | number)[]) => {
  if (typeof src !== "object") return null;
  let pointer = src;
  try {
    path.forEach((pathStep, pathStepIdx) => {
      if (!(pathStep in pointer) || (typeof pathStep !== "number" && typeof pathStep !== "string")) {
        throw new Error(`path at position ${pathStepIdx} '${pathStep}' not found in src object/array -1`);
      }
      pointer = pointer[pathStep];
    });
    return pointer;
  } catch (err) {
    console.error("Error at getStateProp(): ", err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeRefs<T = any>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useReactiveInfo2 = (dependencies: any[]) => {
  const prevDepsRef = React.useRef(dependencies);
  const prevDeps = prevDepsRef.current;
  // const prevDeps = cloneDeep(prevDepsRef.current);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSubelementsInfo = (dep: any, prevDep: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changedSubelements: any =
      Array.isArray(dep) && Array.isArray(prevDep) && dep.length > 0 && prevDep.length > 0
        ? dep.map((depSub, dsIdx) => {
            return {
              idx: dsIdx,
              // value: depSub,
              // prevValue: prevDep[dsIdx],
              type: Array.isArray(depSub) ? "array" : typeof depSub,
              hasChanged: depSub !== prevDep[dsIdx],
              hasDeepChanged: !isDeepEqual(depSub, prevDep[dsIdx]),
              changedSubelements:
                typeof depSub === "object" &&
                typeof prevDep[dsIdx] === "object" &&
                !isNullish(depSub) &&
                !isNullish(prevDep[dsIdx])
                  ? getSubelementsInfo(depSub, prevDep[dsIdx])
                  : null,
            };
          })
        : typeof dep === "object" && typeof prevDep === "object" && !isNullish(dep) && !isNullish(prevDep)
        ? {
            ...Object.entries(dep).map(([key, val]) => {
              return {
                key: key,
                value: val,
                prevValue: prevDep?.[key],
                type: Array.isArray(val) ? "array" : typeof val,
                hasChanged: val !== prevDep[key],
                hasDeepChanged: !isDeepEqual(val, prevDep[key]),
                changedSubelements:
                  typeof dep[key] === "object" &&
                  typeof prevDep[key] === "object" &&
                  !isNullish(dep[key]) &&
                  !isNullish(prevDep[key])
                    ? getSubelementsInfo(dep[key], prevDep[key])
                    : null,
              };
            }),
          }
        : null;

    return changedSubelements;
  };

  const delta = dependencies.map((dep, dIdx) => {
    const prevDep = prevDeps[dIdx];
    const hasChanged = dep !== prevDep;
    const hasDeepChanged = !isDeepEqual(dep, prevDep);
    const changedSubelements = getSubelementsInfo(dep, prevDep);
    return {
      hasChanged,
      hasDeepChanged,
      changedSubelements,
      value: dependencies,
      prevValue: prevDeps,
    };
  });
  React.useEffect(() => {
    prevDepsRef.current = dependencies;
  }, [dependencies]);

  return delta;
};
